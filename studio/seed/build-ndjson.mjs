/**
 * Joins the authored catalog with the resolved videos and writes seed.ndjson.
 *
 * This step is pure — it makes no network calls — so the import is reproducible
 * from two committed files. Document ids are deterministic, which is what makes
 * re-importing an update rather than a second copy of the catalog.
 *
 * Images are handed to the importer as URLs with `_sanityAsset`; the CLI uploads
 * them and rewrites the field into an asset reference. No binaries live in the repo.
 */

import {readFile, writeFile} from 'node:fs/promises'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

import {categories, courses, instructors} from './data/catalog.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const cachePath = join(here, 'data', 'videos.json')
const outputPath = join(here, 'seed.ndjson')

const instructorId = (slug) => `instructor-${slug}`
const categoryId = (slug) => `category-${slug}`
const courseId = (slug) => `course-${slug}`
const lessonSlug = (courseSlug, slug) => `${courseSlug}-${slug}`
const lessonId = (courseSlug, slug) => `lesson-${lessonSlug(courseSlug, slug)}`

const reference = (ref) => ({_type: 'reference', _ref: ref})
const image = (url, alt) => ({_type: 'image', _sanityAsset: `image@${url}`, alt})

/** Stable pseudo-random display numbers — invented, but at least not different every build. */
function hash(text) {
  let value = 2166136261
  for (let i = 0; i < text.length; i++) {
    value ^= text.charCodeAt(i)
    value = Math.imul(value, 16777619)
  }
  return Math.abs(value)
}

const studentCount = (seed, min, max) => min + (hash(seed) % (max - min + 1))

/** Portable Text helpers. Keys only need to be unique within their array, and deterministic keeps diffs quiet. */
const block = (key, text, style = 'normal', listItem) => ({
  _key: key,
  _type: 'block',
  style,
  markDefs: [],
  ...(listItem ? {listItem, level: 1} : {}),
  children: [{_key: `${key}s`, _type: 'span', text, marks: []}],
})

/**
 * Lesson notes, assembled from that lesson's own authored sentences.
 *
 * The structure is uniform and the content is not: every sentence here was
 * written for this lesson. Search matches the plain-text projection of these
 * blocks (AGENTS.md §11), so this is the body a lesson result is found by.
 */
function notesFor(lesson) {
  const blocks = [
    block('n0', lesson.overview),
    block('n1', 'How it works', 'h3'),
    block('n2', lesson.mechanics),
    block('n3', 'In this lesson you will', 'h3'),
    ...lesson.keyPoints.map((point, index) => block(`n4${index}`, point, 'normal', 'bullet')),
  ]

  if (lesson.proTip) {
    blocks.push(block('n5', 'Pro tip', 'h3'), block('n6', lesson.proTip))
  }

  return blocks
}

function lessonDocument({course, lesson, video, isFreePreview}) {
  const slug = lessonSlug(course.slug, lesson.slug)

  const resources = [
    ...course.docs.map(([type, title, description, url], index) => ({
      _key: `r${index}`,
      _type: 'resource',
      type,
      title,
      description,
      url,
    })),
    {
      _key: 'rv',
      _type: 'resource',
      type: 'video',
      title: video.title,
      description: `The full video for this lesson${video.author ? `, from ${video.author}` : ''}.`.slice(0, 160),
      url: video.url,
    },
  ]

  return {
    _id: lessonId(course.slug, lesson.slug),
    _type: 'lesson',
    title: lesson.title,
    slug: {_type: 'slug', current: slug},
    videoUrl: video.url,
    poster: image(video.thumbnail, `${lesson.title} — video thumbnail`),
    durationSeconds: video.durationSeconds,
    freePreview: isFreePreview,
    studentCount: studentCount(slug, 400, 9000),
    notes: notesFor(lesson),
    keyPoints: lesson.keyPoints.map((text, index) => ({
      _key: `k${index}`,
      _type: 'keyPoint',
      text,
    })),
    proTip: lesson.proTip,
    resources,
  }
}

function courseDocument({course, videos}) {
  // The cover is the first lesson's real thumbnail, so the card depicts the course's own content.
  const firstLesson = course.modules[0].lessons[0]
  const cover = videos[lessonSlug(course.slug, firstLesson.slug)].thumbnail

  return {
    _id: courseId(course.slug),
    _type: 'course',
    title: course.title,
    slug: {_type: 'slug', current: course.slug},
    summary: course.summary,
    instructor: reference(instructorId(course.instructor)),
    category: reference(categoryId(course.category)),
    coverImage: image(cover, `Cover image for ${course.title}`),
    level: course.level,
    price: course.price,
    popular: course.popular,
    studentCount: studentCount(course.slug, 1200, 48000),
    learningOutcomes: course.outcomes.map(([icon, title, description], index) => ({
      _key: `o${index}`,
      _type: 'learningOutcome',
      icon,
      title,
      description,
    })),
    modules: course.modules.map((module, moduleIndex) => ({
      _key: `m${moduleIndex}`,
      _type: 'module',
      title: module.title,
      summary: module.summary,
      lessons: module.lessons.map((lesson, lessonIndex) => ({
        ...reference(lessonId(course.slug, lesson.slug)),
        _key: `m${moduleIndex}l${lessonIndex}`,
      })),
    })),
  }
}

/**
 * Guard rails. A document that imports but is invalid in the Studio is worse
 * than one that never imported, so the caps the schema enforces are checked here.
 */
function validate(documents) {
  const problems = []
  const seenSlugs = new Map()
  const seenVideos = new Map()

  const cap = (id, field, value, max) => {
    if (typeof value === 'string' && value.length > max) {
      problems.push(`${id}: ${field} is ${value.length} chars, max ${max}`)
    }
  }

  for (const doc of documents) {
    const slug = doc.slug?.current
    if (slug) {
      if (!/^[a-z0-9-]+$/.test(slug)) problems.push(`${doc._id}: slug "${slug}" is not kebab-case`)
      const key = `${doc._type}:${slug}`
      if (seenSlugs.has(key)) problems.push(`${doc._id}: slug "${slug}" duplicates ${seenSlugs.get(key)}`)
      seenSlugs.set(key, doc._id)
    }

    if (doc._type === 'lesson') {
      if (seenVideos.has(doc.videoUrl)) {
        problems.push(`${doc._id}: videoUrl reused from ${seenVideos.get(doc.videoUrl)}`)
      }
      seenVideos.set(doc.videoUrl, doc._id)

      if (!Number.isInteger(doc.durationSeconds) || doc.durationSeconds <= 0) {
        problems.push(`${doc._id}: durationSeconds is not a positive integer`)
      }
      cap(doc._id, 'proTip', doc.proTip, 320)
      for (const point of doc.keyPoints) cap(doc._id, 'keyPoint', point.text, 120)
      for (const resource of doc.resources) cap(doc._id, 'resource.description', resource.description, 160)
    }

    if (doc._type === 'course') {
      cap(doc._id, 'summary', doc.summary, 280)
      if (doc.learningOutcomes.length > 6) problems.push(`${doc._id}: more than 6 learning outcomes`)
      for (const outcome of doc.learningOutcomes) {
        cap(doc._id, 'outcome.title', outcome.title, 60)
        cap(doc._id, 'outcome.description', outcome.description, 160)
      }
      for (const module of doc.modules) {
        cap(doc._id, 'module.summary', module.summary, 240)
        if (module.lessons.length < 1) problems.push(`${doc._id}: a module has no lessons`)
      }
    }

    if (doc._type === 'instructor') {
      cap(doc._id, 'bio', doc.bio, 600)
      if (doc.expertise.length < 1 || doc.expertise.length > 8) {
        problems.push(`${doc._id}: expertise must hold 1-8 entries`)
      }
    }

    if (doc._type === 'category') cap(doc._id, 'description', doc.description, 240)
  }

  // Every reference must point at a document in this same file.
  const ids = new Set(documents.map((doc) => doc._id))
  const refs = []
  const collect = (value, owner) => {
    if (Array.isArray(value)) value.forEach((item) => collect(item, owner))
    else if (value && typeof value === 'object') {
      if (value._type === 'reference') refs.push([owner, value._ref])
      else Object.values(value).forEach((item) => collect(item, owner))
    }
  }
  for (const doc of documents) collect(doc, doc._id)
  for (const [owner, ref] of refs) {
    if (!ids.has(ref)) problems.push(`${owner}: reference to missing document ${ref}`)
  }

  return problems
}

async function main() {
  let videos
  try {
    videos = JSON.parse(await readFile(cachePath, 'utf8'))
  } catch {
    console.error('No data/videos.json — run `npm run seed:videos` first.')
    process.exit(1)
  }

  const documents = [
    ...instructors.map((person) => ({
      _id: instructorId(person.slug),
      _type: 'instructor',
      name: person.name,
      slug: {_type: 'slug', current: person.slug},
      photo: image(
        `https://api.dicebear.com/9.x/personas/png?seed=${encodeURIComponent(person.slug)}&size=512&backgroundColor=e8e5df`,
        `Illustrated portrait of ${person.name}`,
      ),
      expertise: person.expertise,
      bio: person.bio,
    })),
    ...categories.map((category) => ({
      _id: categoryId(category.slug),
      _type: 'category',
      title: category.title,
      slug: {_type: 'slug', current: category.slug},
      description: category.description,
    })),
  ]

  const missing = []
  for (const course of courses) {
    let lessonNumber = 0
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        const key = lessonSlug(course.slug, lesson.slug)
        const video = videos[key]
        if (!video) {
          missing.push(key)
          continue
        }
        documents.push(
          lessonDocument({
            course,
            lesson,
            video,
            // The opening two lessons of each course are the free preview (a label only, §7).
            isFreePreview: lessonNumber < 2,
          }),
        )
        lessonNumber++
      }
    }
  }

  if (missing.length > 0) {
    console.error(`Missing resolved video for ${missing.length} lesson(s):`)
    for (const key of missing) console.error(`  ${key}`)
    process.exit(1)
  }

  for (const course of courses) documents.push(courseDocument({course, videos}))

  const problems = validate(documents)
  if (problems.length > 0) {
    console.error(`${problems.length} problem(s) — nothing written:`)
    for (const problem of problems) console.error(`  ${problem}`)
    process.exit(1)
  }

  await writeFile(outputPath, documents.map((doc) => JSON.stringify(doc)).join('\n') + '\n', 'utf8')

  const count = (type) => documents.filter((doc) => doc._type === type).length
  const moduleCount = documents
    .filter((doc) => doc._type === 'course')
    .reduce((total, course) => total + course.modules.length, 0)

  console.log(`Wrote ${outputPath}`)
  console.log(
    `  ${count('course')} courses, ${moduleCount} modules, ${count('lesson')} lessons, ` +
      `${count('instructor')} instructors, ${count('category')} categories`,
  )
}

await main()
