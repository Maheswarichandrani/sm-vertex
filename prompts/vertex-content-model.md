# Vertex — content model and data layer (course, module, lesson, instructor, category)

## Goal

1. Define the Vertex content schema in the Studio: `course`, `module` (embedded object), `lesson`, `instructor`, `category`.
2. Write the GROQ queries the catalog, course, lesson and instructor pages will read.
3. Expose them as typed, server-only fetch functions in the app's data layer.
4. Regenerate `sanity.types.ts` so every query has a result type.

Out of scope this pass:

- **`video` documents** — built by the offline ingestion pipeline (AGENTS.md §9), not authored.
- **`progress` records** — app state written through a server route (AGENTS.md §7), a different boundary.
- **`agentContext`** — the search config document (AGENTS.md §10).
- **Sample content.** No courses, lessons or instructors are created. The dataset stays empty; an import pass follows.
- **Page wiring.** [app/page.tsx](../app/page.tsx) keeps its hardcoded `courses` array. This pass ships the data layer the pages will call, not the pages.

`category` is in scope even though it was not named: `course` references it (AGENTS.md §8), so the schema does not compile as a coherent set without it.

## Skills read

- `~/.claude/skills/sanity-best-practices/SKILL.md`
- `references/schema.md` — `defineType`/`defineField`/`defineArrayMember`, references vs nested objects, icon subpath imports, validation, the deprecation lifecycle
- `references/groq.md` — `defineQuery`, fragments, optimizable filters, joins in filters, reverse references, order-before-slice
- `references/image.md` — `hotspot: true`, alt field, `urlFor`
- `references/portable-text.md` — block array shape for the lesson notes field

## Code and environment inspected

| What | Finding |
|---|---|
| `studio/schemaTypes/index.ts` | `export const schemaTypes = []` — empty. |
| `studio/sanity.config.ts` | Reads ids from `./env`, plugins `structureTool()` + `visionTool()`, schema from `./schemaTypes`. Default structure, no custom desk. |
| `sanity` (Studio) | **v6.13.2**. |
| `@sanity/icons` | **v5.2.2** — subpath exports only (`./DocumentText`, …). Root named exports were removed in v5, so `import {X} from '@sanity/icons'` type-checks and then fails at bundle time. |
| `sanity/lib/` | `client.ts`, `fetch.ts`, `token.ts` (all `server-only`), `image.ts`, `queries.ts` (one placeholder query). |
| `sanity/lib/fetch.ts` | `sanityFetch({query, params, revalidate = 60, tags = []})`; tags win over revalidate when present. |
| `sanity.types.ts` | Generated, committed. Currently 11 built-in Sanity types + the placeholder query. |
| `app/page.tsx` | Hardcoded `courses` array: `title`, `description`, `level`, `duration` (`"18h 24m"`), `modules` (`"12 modules"`), `icon` (a React SVG from `components/ui/CourseLogos.tsx`). |
| `components/ui/Card.tsx` | `CourseCard` takes `title`, `description`, `level`, `duration`, `modules`, `icon`, `layout`. All strings — formatting is the UI's job. |
| Dataset | `production`, private, **empty** (`count(*)` → 0). |

### What the UI tells us the data layer must produce

`CourseCard` wants a duration and a module count as display strings. Neither is authored (AGENTS.md §8 lists no duration on `course`), so both are **derived**:

- module count = `count(modules)`
- course duration = the sum of its lessons' durations

That makes lesson duration the unit everything else is computed from.

## Decisions and assumptions

1. **Durations are stored as integer seconds** (`durationSeconds` on `lesson`), not as `"18h 24m"`. Summing is arithmetic, the video pipeline already deals in seconds (AGENTS.md §9, `startSeconds`), and a start-seconds deep link (§7) shares the unit. Formatting to `"18h 24m"` is the UI's job and is not part of this pass.
2. **`module` is an embedded object inside `course`**, never a document — AGENTS.md §8 is explicit. It holds `title`, `summary`, and an ordered array of references to `lesson`.
3. **`lesson` is a document and does not store its parent course.** The course is derived with a reverse reference: `*[_type == "course" && references(^._id)][0]`. AGENTS.md §8.
4. **Module and lesson numbers are never stored.** `Module 5` and `Lesson 5.1` come from array position, computed in the projection so every caller derives them identically.
5. **Learning outcomes, key points and resources are arrays of embedded objects**, not documents. They are course- or lesson-specific and are not reused (schema.md, references vs nested objects).
6. **Lesson notes are Portable Text** (`array of block`), per AGENTS.md §7 — never markdown. No custom blocks this pass; images and code blocks inside notes can be added when a design calls for them.
7. **`videoUrl` is a plain `url` field.** Provider detection (YouTube / Vimeo / Bunny) is parsing, not authoring, and belongs with playback and ingestion (§9). No provider enum is stored — a second source of truth that can disagree with the URL.
8. **`freePreview` stays a boolean**, against schema.md's "prefer `options.list`" rule. AGENTS.md §7 fixes it as a label with exactly two states and no access-control meaning, so there is no third state to grow into.
9. **`level` and `resource.type` are `options.list` string fields**, not booleans or free text — they are closed sets that may grow.
10. **`studentCount` and `popular` are display fields**, authored, not computed. AGENTS.md §8 calls them "for display".
11. **Slug uniqueness is validated async per type**, using the `count(*[... && _id != $id])` pattern from schema.md. Two courses sharing a slug would make a route ambiguous.
12. **Queries live in `sanity/lib/queries.ts`; fetchers live in a new `sanity/lib/content.ts`.** Queries stay declarative and TypeGen-visible; `content.ts` is `server-only` and wraps each one in `sanityFetch` with a cache tag. Pages import from `content.ts` and never touch `client.ts`.
13. **Cache tags are per type** (`course`, `lesson`, `instructor`, `category`) so a future webhook can invalidate one type. Tags win over `revalidate` in the existing helper.
14. **No `->` inside a filter.** Reference resolution in filters is the expensive pattern (groq.md). Filters use `slug.current == $slug` and `references(^._id)`, both optimizable.
15. **No plain-text projection of `notes` this pass.** AGENTS.md §11 needs `pt::text(notes)` for search matching; it belongs with the search queries, not the read path that renders the notes as Portable Text.
16. **Every document gets an icon from `@sanity/icons` via its subpath**, per schema.md and the v5 export change.

## Files touched

### Studio — new schema files under `studio/schemaTypes/`

```
studio/schemaTypes/
  index.ts          register every type
  documents/
    course.ts
    lesson.ts
    instructor.ts
    category.ts
  objects/
    module.ts           title, summary, lessons[] -> reference(lesson)
    learningOutcome.ts  icon, title, description
    keyPoint.ts         text
    resource.ts         type, title, description, url
```

**`course`** (`BookIcon`) — `title`, `slug`, `summary` (text), `coverImage` (hotspot + alt), `level` (list: beginner / intermediate / advanced), `price` (number, min 0), `popular` (boolean), `studentCount` (number), `learningOutcomes` (array of `learningOutcome`, max 6), `instructor` (reference), `category` (reference), `modules` (array of `module`). Preview shows title + instructor name + cover image.

**`module`** (object, `FolderIcon`) — `title`, `summary` (text), `lessons` (array of `reference` to `lesson`, min 1). Preview shows the title and the lesson count.

**`lesson`** (`PlayIcon`) — `title`, `slug`, `videoUrl` (url, https only), `poster` (image, hotspot + alt), `durationSeconds` (integer, positive), `freePreview` (boolean, default false), `studentCount`, `notes` (Portable Text), `keyPoints` (array of `keyPoint`), `proTip` (text, optional), `resources` (array of `resource`).

**`instructor`** (`UserIcon`) — `name`, `slug`, `photo` (hotspot + alt), `expertise` (array of string, unique), `bio` (text).

**`category`** (`TagIcon`) — `title`, `slug`, `description` (text).

**`resource`** — `type` (list: video / article / documentation / download / repository), `title`, `description`, `url`.

### App — `sanity/lib/queries.ts` (rewritten)

Fragments first, then queries. Replaces the placeholder query.

```typescript
const imageFragment = /* groq */ `asset->{_id, url, metadata{lqip, dimensions}}, alt, hotspot, crop`

const courseCardFragment = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  summary,
  level,
  price,
  popular,
  studentCount,
  coverImage{${imageFragment}},
  instructor->{_id, name, "slug": slug.current},
  category->{_id, title, "slug": slug.current},
  "moduleCount": count(modules),
  "lessonCount": count(modules[].lessons),
  "durationSeconds": math::sum(modules[].lessons[]->durationSeconds)
`
```

| Query | Shape | Used by |
|---|---|---|
| `COURSES_QUERY` | all courses, `order(popular desc, title asc)`, `courseCardFragment` | catalog, home |
| `COURSE_BY_SLUG_QUERY` | one course + modules, each module's lessons expanded with `_key`, `moduleNumber`, `lessonLabel`, `durationSeconds`, `freePreview` | course detail |
| `COURSE_SLUGS_QUERY` | `*[_type == "course" && defined(slug.current)].slug.current` | `generateStaticParams` |
| `LESSON_BY_SLUG_QUERY` | one lesson, full notes / keyPoints / proTip / resources, plus the parent course derived by reverse reference and the module + lesson position within it | lesson page |
| `LESSON_SLUGS_QUERY` | as above for lessons | `generateStaticParams` |
| `INSTRUCTORS_QUERY` | all instructors + their course count | instructor index |
| `INSTRUCTOR_BY_SLUG_QUERY` | one instructor + their courses via `references(^._id)` | instructor page |
| `CATEGORIES_QUERY` | all categories + course count | catalog filter |

Position derivation inside `COURSE_BY_SLUG_QUERY`:

```groq
modules[]{
  _key,
  title,
  summary,
  "moduleNumber": string(^.modules[@._key == ^._key]  /* index resolved in the real query */ ),
  lessons[]->{ _id, title, "slug": slug.current, durationSeconds, freePreview }
}
```

> GROQ has no array-index variable, so the module and lesson numbers are computed **in TypeScript** inside `content.ts` (`modules.map((m, i) => ({...m, number: i + 1}))`) rather than faked in the query. The query returns the array in authored order; the numbering helper turns that into `Module 5` / `Lesson 5.1`. This is the one place the prompt deviates from "derive it in the projection" — GROQ cannot, so the data layer does it once and every caller shares it.

### App — `sanity/lib/content.ts` (new, `server-only`)

One typed function per query, each tagging its cache entry:

```typescript
import "server-only";
import { sanityFetch } from "./fetch";
import { COURSES_QUERY } from "./queries";
import type { COURSES_QUERYResult } from "@/sanity.types";

export function getCourses() {
  return sanityFetch<typeof COURSES_QUERY>({ query: COURSES_QUERY, tags: ["course"] });
}
```

Functions: `getCourses`, `getCourseBySlug(slug)`, `getCourseSlugs`, `getLessonBySlug(slug)`, `getLessonSlugs`, `getInstructors`, `getInstructorBySlug(slug)`, `getCategories`.

Plus the numbering helpers used by the course and lesson views:

```typescript
/** Module 5 / Lesson 5.1 — derived from order, never stored (AGENTS.md §8). */
export function withPositions(modules) // adds moduleNumber and lessonLabel
```

### App — `sanity.types.ts`

Regenerated by `npm run typegen` in `studio/`. Committed.

## Requirements

- Every type uses `defineType` / `defineField` / `defineArrayMember`.
- Every document type has an icon imported from its `@sanity/icons` subpath and a `preview`.
- `module` is an object inside `course`; it is not registered as a document type.
- No module or lesson number is stored anywhere.
- Every array projection includes `_key`.
- No filter dereferences (`->`) a reference.
- All reads go through `sanityFetch`; `content.ts` is `server-only`.
- Slugs are required, lowercase-hyphen, and unique within their type.
- `npm run typegen` produces a `*QueryResult` type per query, and `content.ts` uses them rather than `any`.

## Security considerations

- `content.ts` carries `import "server-only"`, like `client.ts`, `fetch.ts` and `token.ts`. The read token stays server-side; a client component importing the data layer is a build error.
- No new env vars, no new tokens. The existing Viewer-role `SANITY_API_READ_TOKEN` covers every query here.
- Schema-side validation (`url` scheme `https`, required slugs, `min(0)` on price) is authoring hygiene, not a security boundary — the pages still treat all content as data.
- No write path is added. Progress writes remain a later pass behind a server route with a separate token.

## Acceptance criteria

1. `studio/schemaTypes/index.ts` registers `course`, `lesson`, `instructor`, `category` and the four objects.
2. Studio dev boots with no schema validation errors and all four document types appear in the Content pane.
3. `npm run typegen` in `studio/` succeeds and `sanity.types.ts` contains `Course`, `Lesson`, `Instructor`, `Category`, `Module` plus a result type per query.
4. Every query in `queries.ts` runs against the live dataset without a GROQ error (empty results are expected — the dataset has no content).
5. `math::sum(modules[].lessons[]->durationSeconds)` is verified against the live API, not assumed. If that traversal does not evaluate, the fallback is a per-course subquery, and the prompt is corrected to say so.
6. Root `npx tsc --noEmit`, `npm run lint` and `npm run build` all pass.
7. `app/page.tsx` is unchanged and the site renders exactly as before.

## Checks to run (AGENTS.md §13)

From `studio/`:

```
npm run typegen
npm run dev            # boot, confirm the four document types and no schema errors
npx sanity schemas deploy
```

From the repo root:

```
npx tsc --noEmit
npm run lint
npm run build
```

Query smoke test — each query executed against `production` with the read token, checking for GROQ errors rather than results.

## Manual test steps

1. `cd studio && npm run dev`, open `http://localhost:3333`.
2. Content pane lists Courses, Lessons, Instructors, Categories.
3. Create an instructor and a category (fill name/title + slug), then a lesson with a title, slug, video URL and duration.
4. Create a course: fill the marketing fields, pick the instructor and category, add a module, add the lesson to it. Confirm the module preview shows the lesson count.
5. Confirm the Studio blocks a second course with the same slug.
6. `npm run dev` at the root — `/` and `/design-system` render exactly as before.
7. Delete the test documents, or keep them as the first real content — your call.

## Needs the user

- **Sample content is not created.** The dataset stays empty, so nothing renders from Sanity yet. Say the word and the next pass imports a coherent set of courses (AGENTS.md §7: a module's lessons must genuinely cover that module's topic).
- **`npx sanity deploy` is still not run** — carried over from the last pass, still required before the Context MCP will serve the dataset.


## Corrections found while implementing

Three things the prompt got wrong or left unstated. Recorded here rather than quietly changed.

1. **`count(modules[].lessons)` counts arrays, not lessons.** With one module holding two lessons it returned `1`. The flattening bracket is required: `count(modules[].lessons[])` returns `2`. Verified against live data before and after the fix.
2. **TypeGen names result types `COURSES_QUERY_RESULT`, not `COURSES_QUERYResult`.** This version also registers a `SanityQueries` map for `overloadClientMethods`, so `client.fetch` is typed from the query string alone; `content.ts` still declares each return type explicitly so a broken query surfaces at the data layer rather than at the call site.
3. **The numbering helpers live in a new `sanity/lib/positions.ts`, not in `content.ts`.** They are pure functions over already-fetched data and hold no token, so keeping them out of the `server-only` module lets a client component label a lesson. `positions.ts` also carries `formatDuration`, which turns stored seconds into the design's `"18h 24m"`.

`math::sum(modules[].lessons[]->durationSeconds)` evaluated correctly on the first try (600 + 900 = 1500), so the fallback per-course subquery named in acceptance criterion 5 was not needed.

### Verification method

The dataset was empty, so a query returning `[]` would have proved nothing. Five throwaway documents (one instructor, one category, two lessons, one course with a module referencing both lessons) were imported, every query and helper was run against them, and all five were deleted afterwards. `count(*)` is back to 12, all of them Sanity's own `system.*` group and retention documents.
