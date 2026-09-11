/**
 * Post-import assertions against the live dataset.
 *
 * The two that matter most are the ones the request-path code depends on:
 * every lesson owns a distinct video (the §9 pipeline keys video documents by
 * URL), and the derived durations add up — a module's runtime is the sum of its
 * lessons and a course's is the sum of its modules. Neither number is stored,
 * so this checks that the sums the app's GROQ performs are actually coherent.
 *
 * Auth comes from the Sanity CLI session, the same one `sanity dataset import`
 * uses. No token is added to the repo.
 */

import {readFile} from 'node:fs/promises'
import {homedir} from 'node:os'
import {join} from 'node:path'

import {createClient} from '@sanity/client'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'bn544cp3'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

async function cliToken() {
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN
  const config = JSON.parse(await readFile(join(homedir(), '.config', 'sanity', 'config.json'), 'utf8'))
  const token = config.authToken
  if (!token) throw new Error('No Sanity CLI session found — run `npx sanity login`.')
  return token
}

const EXPECTED = {course: 10, instructor: 6, category: 6, lesson: 120, modules: 40}

const results = []
const check = (label, ok, detail) => results.push({label, ok, detail})

async function main() {
  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2026-09-11',
    useCdn: false,
    perspective: 'published',
    token: await cliToken(),
  })

  const counts = await client.fetch(`{
    "course": count(*[_type == "course"]),
    "instructor": count(*[_type == "instructor"]),
    "category": count(*[_type == "category"]),
    "lesson": count(*[_type == "lesson"]),
    "modules": count(*[_type == "course"].modules[])
  }`)

  for (const [type, expected] of Object.entries(EXPECTED)) {
    check(`${type} count`, counts[type] === expected, `${counts[type]} (expected ${expected})`)
  }

  const videos = await client.fetch(`{
    "total": count(*[_type == "lesson"]),
    "distinct": count(array::unique(*[_type == "lesson"].videoUrl)),
    "nonYouTube": count(*[_type == "lesson" && !(videoUrl match "*youtube.com*")]),
    "badDuration": count(*[_type == "lesson" && (!defined(durationSeconds) || durationSeconds <= 0)])
  }`)

  check('every lesson has a distinct videoUrl', videos.total === videos.distinct, `${videos.distinct} distinct / ${videos.total} lessons`)
  check('every videoUrl is a YouTube URL', videos.nonYouTube === 0, `${videos.nonYouTube} other`)
  check('every duration is a positive number', videos.badDuration === 0, `${videos.badDuration} bad`)

  // Derived durations: course total === sum of module totals === sum of lesson durations.
  const durations = await client.fetch(`*[_type == "course"] | order(title asc){
    title,
    "courseTotal": math::sum(modules[].lessons[]->durationSeconds),
    "moduleTotals": modules[]{"seconds": math::sum(lessons[]->durationSeconds)}.seconds,
    "moduleCount": count(modules),
    "lessonCount": count(modules[].lessons[])
  }`)

  const durationProblems = durations.filter((course) => {
    const summed = course.moduleTotals.reduce((total, seconds) => total + (seconds ?? 0), 0)
    return summed !== course.courseTotal || !course.courseTotal || course.moduleTotals.some((s) => !s)
  })
  check(
    'course duration equals the sum of its modules, each the sum of its lessons',
    durationProblems.length === 0,
    durationProblems.map((course) => course.title).join(', ') || 'all 10 courses',
  )

  const shape = durations.filter((course) => course.moduleCount !== 4 || course.lessonCount !== 12)
  check('every course has 4 modules and 12 lessons', shape.length === 0, shape.map((c) => c.title).join(', ') || 'all 10 courses')

  const dangling = await client.fetch(`{
    "lessonRefs": count(*[_type == "course"].modules[].lessons[][!defined(@->_id)]),
    "instructorRefs": count(*[_type == "course" && !defined(instructor->_id)]),
    "categoryRefs": count(*[_type == "course" && !defined(category->_id)])
  }`)
  check(
    'no dangling references',
    dangling.lessonRefs === 0 && dangling.instructorRefs === 0 && dangling.categoryRefs === 0,
    JSON.stringify(dangling),
  )

  const assets = await client.fetch(`{
    "coversMissing": count(*[_type == "course" && !defined(coverImage.asset->url)]),
    "postersMissing": count(*[_type == "lesson" && !defined(poster.asset->url)]),
    "photosMissing": count(*[_type == "instructor" && !defined(photo.asset->url)])
  }`)
  check(
    'every cover, poster and portrait resolved to an uploaded asset',
    assets.coversMissing === 0 && assets.postersMissing === 0 && assets.photosMissing === 0,
    JSON.stringify(assets),
  )

  const content = await client.fetch(`{
    "noNotes": count(*[_type == "lesson" && count(notes) == 0]),
    "noKeyPoints": count(*[_type == "lesson" && count(keyPoints) == 0]),
    "noOutcomes": count(*[_type == "course" && count(learningOutcomes) == 0]),
    "orphanLessons": count(*[_type == "lesson" && count(*[_type == "course" && references(^._id)]) == 0])
  }`)
  check('every lesson has notes and key points', content.noNotes === 0 && content.noKeyPoints === 0, JSON.stringify(content))
  check('every course has learning outcomes', content.noOutcomes === 0, `${content.noOutcomes} without`)
  check('every lesson belongs to a course', content.orphanLessons === 0, `${content.orphanLessons} orphaned`)

  for (const {label, ok, detail} of results) {
    console.log(`${ok ? '✓' : '✗'} ${label} — ${detail}`)
  }

  const failed = results.filter((result) => !result.ok)
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`)
  if (failed.length > 0) process.exitCode = 1
}

await main()
