/**
 * Attaches one real YouTube video to every lesson.
 *
 * The rule that shapes this script is uniqueness: a video id is claimed by at
 * most one lesson, ever. The §9 pipeline keys a video document by its URL, so a
 * reused URL would make two lessons share one transcript — the script fails
 * loudly rather than resolving that way.
 *
 * Results are cached in data/videos.json and committed, so the build is
 * reproducible and a rerun does not re-scrape what it already knows.
 */

import {unlinkSync} from 'node:fs'
import {mkdir, readFile, rename, writeFile} from 'node:fs/promises'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

import {courses} from './data/catalog.mjs'
import {isEmbeddable, searchVideos, thumbnailUrl, titleOverlap, watchUrl} from './lib/youtube.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const cachePath = join(here, 'data', 'videos.json')
const lockPath = join(here, 'data', '.resolve.lock')

/** A lesson shorter than this is a clip; longer than this is a conference talk nobody finishes. */
const MIN_SECONDS = 180
const MAX_SECONDS = 5400

/** How many ranked candidates are worth an embed check before giving up. */
const CANDIDATE_LIMIT = 8

const CONCURRENCY = 4

/** Every lesson in the catalog, flattened, with the globally unique slug the builder will use. */
export function flattenLessons() {
  const flat = []
  for (const course of courses) {
    course.modules.forEach((module, moduleIndex) => {
      module.lessons.forEach((lesson, lessonIndex) => {
        flat.push({
          key: `${course.slug}-${lesson.slug}`,
          courseSlug: course.slug,
          courseTitle: course.title,
          moduleIndex,
          lessonIndex,
          title: lesson.title,
          query: lesson.query,
        })
      })
    })
  }
  return flat
}

async function loadCache() {
  try {
    return JSON.parse(await readFile(cachePath, 'utf8'))
  } catch {
    return {}
  }
}

/**
 * Checkpoint the cache.
 *
 * Writes are serialised through one promise chain and land via a rename, so the
 * four concurrent workers cannot interleave and leave a half-written file that
 * the next run fails to parse.
 */
let writing = Promise.resolve()
function saveCache(cache) {
  writing = writing.then(async () => {
    await mkdir(dirname(cachePath), {recursive: true})
    const ordered = Object.fromEntries(Object.entries(cache).sort(([a], [b]) => a.localeCompare(b)))
    const temporary = `${cachePath}.tmp`
    await writeFile(temporary, `${JSON.stringify(ordered, null, 2)}\n`, 'utf8')
    await rename(temporary, cachePath)
  })
  return writing
}

const rightLength = (video) =>
  video.lengthSeconds >= MIN_SECONDS && video.lengthSeconds <= MAX_SECONDS

/**
 * Resolve one lesson.
 *
 * One search request supplies every candidate's title and duration, and the
 * embed check is only spent on the candidates we would actually take, best
 * match first. That keeps the request budget near two per lesson — the watch
 * page rate-limits long before 120 lessons are done.
 *
 * `claimed` is mutated the instant a candidate is accepted. The runner is
 * concurrent but JavaScript is not, so a claim cannot interleave with another
 * lesson's check.
 */
async function resolveLesson(lesson, claimed) {
  const candidates = await searchVideos(lesson.query)

  const ranked = candidates
    .map((video, rank) => ({video, rank, score: titleOverlap(lesson.query, video.title)}))
    .filter(({video}) => rightLength(video))
    // Best title match first, search rank breaking ties.
    .sort((a, b) => b.score - a.score || a.rank - b.rank)
    .slice(0, CANDIDATE_LIMIT)

  for (const {video, score} of ranked) {
    if (claimed.has(video.id)) continue
    if (!(await isEmbeddable(video.id))) continue
    if (claimed.has(video.id)) continue // another lesson may have taken it while we checked

    claimed.add(video.id)

    return {
      videoId: video.id,
      url: watchUrl(video.id),
      title: video.title,
      author: video.author,
      durationSeconds: video.lengthSeconds,
      thumbnail: await thumbnailUrl(video.id),
      query: lesson.query,
      match: Number(score.toFixed(2)),
    }
  }

  return null
}

/**
 * Refuse to run twice at once.
 *
 * Each process holds the whole cache in memory and checkpoints the lot, so a
 * second resolver started while the first is working will, on finishing, write
 * its own older picture over the newer one. That is not hypothetical — it
 * happened during this seed and silently reverted 51 resolved lessons.
 */
async function takeLock() {
  try {
    await writeFile(lockPath, `${process.pid}\n`, {encoding: 'utf8', flag: 'wx'})
  } catch (error) {
    if (error.code === 'EEXIST') {
      throw new Error(
        `Another resolver is running (lock at ${lockPath}). Delete the lock if that is stale.`,
        {cause: error},
      )
    }
    throw error
  }

  const release = () => {
    try {
      unlinkSync(lockPath)
    } catch {
      // already gone
    }
  }
  process.on('exit', release)
  process.on('SIGINT', () => {
    release()
    process.exit(130)
  })
}

async function main() {
  await takeLock()

  const lessons = flattenLessons()
  const cache = await loadCache()

  // Drop cache entries whose lesson no longer exists, then claim what survives.
  const valid = new Set(lessons.map((lesson) => lesson.key))
  for (const key of Object.keys(cache)) if (!valid.has(key)) delete cache[key]

  const claimed = new Set(Object.values(cache).map((entry) => entry.videoId))
  const pending = lessons.filter((lesson) => !cache[lesson.key])

  console.log(
    `${lessons.length} lessons — ${lessons.length - pending.length} cached, ${pending.length} to resolve.`,
  )

  const failed = []
  let done = 0

  const queue = [...pending]
  const workers = Array.from({length: CONCURRENCY}, async () => {
    while (queue.length > 0) {
      const lesson = queue.shift()
      try {
        const resolved = await resolveLesson(lesson, claimed)
        if (resolved) {
          cache[lesson.key] = resolved
          await saveCache(cache) // checkpoint: a crash must not throw away an hour of scraping
          console.log(
            `  ✓ ${lesson.key} → ${resolved.videoId} (${resolved.durationSeconds}s, match ${resolved.match}) ${resolved.title.slice(0, 60)}`,
          )
        } else {
          failed.push(lesson)
          console.log(`  ✗ ${lesson.key} — no usable candidate for "${lesson.query}"`)
        }
      } catch (error) {
        failed.push(lesson)
        console.log(`  ✗ ${lesson.key} — ${error.message}`)
      }
      done++
      if (done % 20 === 0) console.log(`  … ${done}/${pending.length}`)
    }
  })

  await Promise.all(workers)
  await saveCache(cache)

  const resolvedIds = Object.values(cache).map((entry) => entry.videoId)
  const duplicates = resolvedIds.length - new Set(resolvedIds).size

  console.log(`\nResolved ${Object.keys(cache).length}/${lessons.length} lessons.`)
  if (duplicates > 0) console.error(`Duplicate video ids: ${duplicates}`)
  if (failed.length > 0) {
    console.error(`\nUnresolved (${failed.length}) — rerun, or adjust the query in catalog.mjs:`)
    for (const lesson of failed) console.error(`  ${lesson.key}  "${lesson.query}"`)
  }

  if (failed.length > 0 || duplicates > 0) process.exitCode = 1
}

await main()
