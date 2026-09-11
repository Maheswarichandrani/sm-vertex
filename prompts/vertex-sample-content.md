# Vertex — sample content seed (10 courses, real YouTube lessons)

## Goal

Fill the empty `bn544cp3/production` dataset with coherent sample content so the catalog, the course
and lesson pages, and cross-course search all run on real data:

- 6 instructors, 6 categories.
- 10 courses spanning web development, languages, DSA, AI and backend/data.
- 4 modules per course, 3 lessons per module — **120 lessons**.
- Every lesson points at a **distinct, real, embeddable YouTube video**, with that video's real
  duration and real thumbnail.

Out of scope this pass:

- **`video` documents** (chapters + transcript chunks) — that is the §9 ingestion pipeline. This
  pass only guarantees the lessons carry real video URLs for it to ingest later.
- **`progress` records** — app state, written through a server route (§7).
- **`agentContext`** — the search config document (§10).
- **Page wiring.** `app/page.tsx` keeps its hardcoded array. Reading this content into the pages is
  a separate pass.
- **Schema changes.** The model from `prompts/vertex-content-model.md` is taken as fixed.

## Skills read

- `~/.claude/skills/sanity-best-practices/SKILL.md` — schema shapes, Portable Text block shape,
  image asset references.
- `~/.claude/skills/sanity-migration/SKILL.md` — NDJSON import, `_sanityAsset` URL ingestion,
  deterministic document ids, reference strengthening.
- AGENTS.md §5 (workspace split), §7 (decisions), §8 (data model), §9 (video pipeline), §13 (checks).

## Code and environment inspected

| What | Finding |
|---|---|
| `studio/schemaTypes/` | `course`, `lesson`, `instructor`, `category` documents; `module`, `learningOutcome`, `keyPoint`, `resource` objects. |
| `course` required fields | `title`, `slug`, `summary`, `instructor`, `category`, `coverImage` (+ required `alt`), `level`, `price`, `modules` (min 1). |
| `lesson` required fields | `title`, `slug`, `videoUrl` (https), `poster` (+ required `alt`), `durationSeconds` (positive int). |
| `module` object | `title`, `summary` (≤240), `lessons` (min 1, unique refs). No duration field. |
| `uniqueSlug` validator | Slugs must match `^[a-z0-9-]+$` and be unique per type. Seed slugs must obey this. |
| Field caps | course `summary` ≤280, `learningOutcomes` ≤6; `learningOutcome.title` ≤60, `.description` ≤160; `keyPoint.text` ≤120; `proTip` ≤320; `category.description` ≤240; `instructor.bio` ≤600, `expertise` 1–8 unique; `resource.description` ≤160. |
| `learningOutcome.icon` | Enum: `rocket`, `layers`, `bolt`, `shield`, `chart`, `terminal`. |
| `resource.type` | Enum: `documentation`, `article`, `video`, `download`, `repository`. |
| `sanity/lib/queries.ts` | Course duration and lesson count are **derived** — `math::sum(modules[].lessons[]->durationSeconds)` and `count(modules[].lessons[])`. Module duration is `math::sum(lessons[]->durationSeconds)`. |
| Dataset `production` | **Empty** — 0 courses, lessons, instructors, categories, image assets. |
| Sanity CLI | v8.10.0, logged in as `pYv1yxiGd`, role **administrator** on the project. Import needs no token. |
| Sanity MCP | **Unauthorized — "Session not found."** Not usable this pass; the CLI is the write path. |
| Network probes | `picsum.photos` 200, `api.dicebear.com` 200, `i.ytimg.com` 200, YouTube search HTML yields `videoId` values, watch HTML yields `"lengthSeconds":"213"`. Everything the resolver depends on is reachable. |

## Decisions and assumptions

1. **The seed lives in the Studio workspace**, at `studio/seed/`, and imports with
   `sanity dataset import`. The Studio is the content authoring workspace (§5), the CLI is already
   authenticated as an administrator, and the import needs no write token in env.
2. **Content is authored, video is resolved.** `studio/seed/data/catalog.mjs` holds every
   hand-written string (course, module, lesson, instructor, category copy). A resolver script
   attaches a real YouTube video to each lesson and writes `studio/seed/data/videos.json`. Both are
   committed, so the import is reproducible and does not re-scrape.
3. **One unique video per lesson, globally.** The resolver claims a video id and never reuses it. A
   lesson whose candidates are all claimed or unusable fails the run loudly rather than falling back
   to a duplicate — a silent duplicate would corrupt the §9 one-video-document-per-URL rule.
4. **A candidate is accepted only if it is genuinely playable on our page**: not live, duration
   between 180 s and 5400 s, and `playableInEmbed: true` in the watch page payload. Playback stays
   on the site (§7), so a video that refuses to embed is not a usable lesson.
5. **Durations are the video's real `lengthSeconds`.** Nothing is invented. This is what makes the
   sum invariants below true rather than decorative.
6. **Module duration = sum of its lessons; course duration = sum of its modules.** Neither is
   stored — both are already summed in GROQ from `lesson.durationSeconds`. The invariant therefore
   holds by construction and cannot drift. A post-import check asserts it numerically.
7. **Lesson posters are the real video's YouTube thumbnail** (`maxresdefault.jpg`, falling back to
   `hqdefault.jpg` when the first 404s). The poster then actually depicts the lesson's video.
8. **Course covers are the course's first lesson's thumbnail**, not a random placeholder. Same
   reasoning as 7 — it ties the card to the content. (If you would rather have neutral abstract
   covers, say so and I will switch to `picsum.photos/seed/<slug>`; it is a one-line change.)
9. **Instructor photos are deterministic generated avatars** (`api.dicebear.com`, `personas` style,
   seeded by slug). They are illustrations, not photos of real people who never agreed to teach here.
10. **Images are ingested by URL via `_sanityAsset`** in the NDJSON (`"image@https://…"`), so the
    import uploads them. No binaries are committed to the repo.
11. **Document ids are deterministic and readable** — `instructor-<slug>`, `category-<slug>`,
    `course-<slug>`, `lesson-<slug>`. Re-running the import overwrites the same documents instead of
    duplicating the catalog.
12. **Documents are imported published, not as drafts.** The app client reads with
    `perspective: "published"` — draft-only content would leave every page empty.
13. **Lesson notes are Portable Text assembled from per-lesson authored sentences** — an overview
    paragraph, a "How it works" paragraph, an `h3` plus a bulleted list built from that lesson's key
    points, and the pro tip. Every sentence is specific to its lesson; the *structure* is uniform.
    This is the honest trade-off at 120 lessons: topic-accurate, not long-form hand-written prose.
14. **Topics are coherent top to bottom** (§7): each module's three lessons genuinely cover that
    module's subject, and the video search query for each lesson is authored from the lesson topic.
15. **Prices, student counts, levels and the popular flag are invented display values** — they are
    marketing fields with no backing system. Search must never quote them as fact; that is a §11
    grounding rule for the agent, not a content rule.

## Catalog being authored

| # | Course | Category | Instructor | Level |
|---|---|---|---|---|
| 1 | Next.js App Router in Depth | Web Development | Priya Raghavan | intermediate |
| 2 | React Performance Engineering | Web Development | Priya Raghavan | advanced |
| 3 | TypeScript at Scale | Languages & Tooling | Daniel Okafor | intermediate |
| 4 | Modern Python for Backend Engineers | Languages & Tooling | Elena Vasquez | beginner |
| 5 | Data Structures Foundations | Algorithms & Data Structures | Marcus Bright | beginner |
| 6 | Algorithmic Problem Patterns | Algorithms & Data Structures | Marcus Bright | advanced |
| 7 | Machine Learning Foundations | AI & Machine Learning | Hana Sato | beginner |
| 8 | Building LLM Applications | AI & Machine Learning | Hana Sato | intermediate |
| 9 | System Design for Scale | Backend & Systems | Tobi Lindqvist | advanced |
| 10 | SQL and Database Performance | Data & Databases | Elena Vasquez | intermediate |

6 instructors, 6 categories, 40 modules, 120 lessons.

## Files expected to change

| File | Change |
|---|---|
| `studio/seed/data/catalog.mjs` | New. All authored content: instructors, categories, courses, modules, lessons (title, slug, overview, mechanics sentence, key points, pro tip, resources, video search query). |
| `studio/seed/lib/youtube.mjs` | New. Search scrape, watch-page parse (`lengthSeconds`, title, author, `playableInEmbed`, live flag), thumbnail probe. |
| `studio/seed/resolve-videos.mjs` | New. Resolves one unique video per lesson, caches to `data/videos.json`, reports unresolved lessons. |
| `studio/seed/build-ndjson.mjs` | New. Joins catalog + videos into `seed.ndjson` (Portable Text, `_key`s, refs, `_sanityAsset` image URLs). |
| `studio/seed/verify.mjs` | New. Post-import GROQ assertions (counts, unique videos, sum invariants, no dangling refs). |
| `studio/seed/data/videos.json` | New, generated then committed. |
| `studio/seed/seed.ndjson` | New, generated (git-ignored — it is a build output of the two files above). |
| `studio/package.json` | New scripts: `seed:videos`, `seed:build`, `seed:import`, `seed:verify`. |
| `studio/.gitignore` | Ignore `seed/seed.ndjson`. |

No app or schema file changes.

## Requirements

1. Exactly 10 courses, 6 instructors, 6 categories, 40 modules, 120 lessons.
2. Every lesson has a distinct `videoUrl`. `count(*[_type=="lesson"])` equals the count of distinct
   `videoUrl` values.
3. Every `durationSeconds` is the real duration read from that video, a positive integer.
4. Every reference resolves: each module lesson ref, each course instructor and category ref.
5. Every required field populated and every length cap respected — the import must not create a
   document the Studio would then flag as invalid.
6. Slugs unique per type and matching `^[a-z0-9-]+$`.
7. Course cover, lesson poster and instructor photo assets all exist, each with `alt` text.
8. Documents land published.
9. Re-running the import is idempotent: same ids, no duplicates.

## Security considerations

- The import authenticates through the **CLI's own session**, not a token in the repo. No write
  token is added to `.env.local` or `.env.example`, and none is needed.
- The read token stays server-only and untouched; nothing here runs in the request path.
- The seed scripts live in the Studio workspace and are never imported by the Next.js app, so no
  scraping code can reach a bundle.
- Scraped YouTube data is treated as untrusted input: only `videoId`, integer `lengthSeconds`, title
  and author are parsed out, and each video id is validated against `^[A-Za-z0-9_-]{11}$` before it
  is interpolated into a URL.
- No credentials, emails or personal data enter the dataset. Instructor names are fictional and the
  photos are generated illustrations, not real people.

## Acceptance criteria

- `npm run seed:verify` in `studio/` prints all checks passing:
  - counts: 10 courses / 6 instructors / 6 categories / 40 modules / 120 lessons
  - 120 distinct `videoUrl` values across 120 lessons
  - each module's derived duration equals the sum of its own lessons' `durationSeconds`, and each
    course's derived duration equals the sum of its modules' durations
  - zero dangling references, zero missing posters or covers
- `COURSES_QUERY` returns 10 courses, each with non-zero `durationSeconds`, `moduleCount` 4 and
  `lessonCount` 12.
- A spot-checked lesson's `videoUrl` opens a real, embeddable YouTube video matching the lesson topic.
- `npm run typegen` in `studio/` still succeeds and `sanity.types.ts` is unchanged (no schema drift).

## Checks to run

In `studio/`:

1. `npm run seed:videos` — resolves videos, reports any unresolved lesson.
2. `npm run seed:build` — writes `seed.ndjson`.
3. `npx sanity dataset import seed/seed.ndjson production --replace`.
4. `npm run seed:verify`.
5. `npm run typegen`.

In the repo root:

6. `npx tsc --noEmit`
7. `npm run lint`

No production build: no routes, config or server modules change this pass.

## Manual test steps

1. `cd studio && npm run dev`, open the Studio.
2. Courses list shows 10 courses, each with a cover image and an instructor subtitle.
3. Open **Next.js App Router in Depth** → Curriculum → 4 modules, each listing 3 lessons.
4. Open a lesson from module 2 → poster image present, duration subtitle in minutes, key points and
   notes filled, `videoUrl` present.
5. Paste that `videoUrl` into a browser — a real video matching the lesson topic plays.
6. In Vision, run:
   `*[_type=="course"]{title, "mods": count(modules), "lessons": count(modules[].lessons[]), "secs": math::sum(modules[].lessons[]->durationSeconds)}`
   → 10 rows, `mods` 4, `lessons` 12, `secs` > 0 on every row.
7. In Vision, run `count(*[_type=="lesson"]) - count(array::unique(*[_type=="lesson"].videoUrl))`
   → `0`.
