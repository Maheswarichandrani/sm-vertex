# Vertex — Sanity setup (Studio + app client wiring)

> **Revised mid-execution.** This prompt was approved describing a `studio/` + `web/`
> monorepo. The user then rejected the `web/` folder and asked for the Next.js app to
> stay at the repo root, so the restructure was reverted and the Studio will be nested
> at `studio/` instead. Sections below reflect the flat-root layout as built; the
> monorepo rationale is kept where it explains a tradeoff that is now being paid for.

## Goal

Stand up Sanity for Vertex:

1. Keep the Next.js app at the repo root (flat), with the Studio nested at `studio/`.
2. Scaffold a **standalone** Sanity Studio for project `bn544cp3`, dataset `production`.
3. Wire the app to Sanity: server-only client, fetch helper, image builder, env, TypeGen.

Out of scope this pass: the Vertex content schema (course/module/lesson/instructor/category/video/progress/agent-context), sample content, search, ingestion, Visual Editing, Presentation. Studio ships with an empty `schemaTypes` array.

## Skills read

- `.claude/skills/sanity-best-practices/SKILL.md`
- `.claude/skills/sanity-best-practices/references/get-started.md` (the reference the user named)
- `.claude/skills/sanity-best-practices/references/project-structure.md`
- `.claude/skills/sanity-best-practices/references/nextjs.md`
- `.claude/skills/sanity-best-practices/references/typegen.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/turbopack.md` (project-root detection)

## Code and environment inspected

| What | Finding |
|---|---|
| Repo layout | Flat. Next.js app at repo root. No `studio/`, no `web/`. |
| `package.json` | `next@16.3.4`, `react@19.2.8`, `@clerk/nextjs@^7.9.2`, tailwind v4, eslint 9, typescript 5. No `src/` dir. |
| `tsconfig.json` | `paths: { "@/*": ["./*"] }`, `include` is root-relative globs, `exclude: ["node_modules", "agent"]`. |
| `proxy.ts` | Next.js 16 proxy (the former `middleware.ts`). Runs `clerkMiddleware`, protects `/my-learning(.*)`. |
| `.env.local` | 6 Clerk vars. No Sanity vars. |
| `.env.example` | Committed, Clerk vars only. |
| `.gitignore` | Root-anchored patterns (`/node_modules`, `/.next/`). Ignores `.env*` except `.env.example`. |
| Tracked app source | `app/` (5 routes), `components/` (13 files), `public/`, 6 config files, `proxy.ts`. Small, clean move. |
| Node | v22.20.0 — meets the Studio's 22.12+ floor. |
| Sanity CLI | 8.10.0 via npx. Authenticated as **srikar@m / bunnyking828@gmail.com / provider github / id gYgQ5kqLz**. |
| Sanity MCP | Same account (`whoami` → `gYgQ5kqLz`). |
| Turbopack root | Detected from the nearest lock file. The root `package-lock.json` is found first, so no `turbopack.root` config is needed even with `studio/` nested. |

## Two blockers found before any of this can complete

**1. The authenticated account has no access to `bn544cp3`.**

`sanity projects list` and MCP `list_projects` both return only 3 projects — `wd39d3pw`, `g1ty34ai`, `eqhvqbgm` — none of them `bn544cp3`. MCP `list_datasets` on `bn544cp3` fails:

```
Unauthorized - User is missing required grant sanity.project.datasets/read
```

The project does exist: an unauthenticated query to `bn544cp3.api.sanity.io` returns HTTP 200, versus a 404 "Dataset not found" for a bogus id. So `bn544cp3` is real but owned by a different account — likely a different identity provider for the same email, since one email can map to one Sanity account per provider.

Confirmed by running the real command in a scratch directory:

```
$ npx sanity@latest init --yes --project bn544cp3 --dataset production --template clean --typescript --output-path studio
✔ You are logged in as bunnyking828@gmail.com using GitHub
✔ Fetching existing projects
 »   Error: Given project ID (bn544cp3) not found, or you do not have access to it
```

The user confirmed `bn544cp3` is the intended project and `ojX2W8U9D` the org. That org is also not reachable — `list_organizations` returns only `oHlvfnral` (srikar@m) and `oaigyas8R` (Maheswari@s).

Everything in Phase B and the deploy checks (`sanity init`, `schemas deploy`, `sanity deploy`, `cors add`) will fail until this is resolved. Resolution is one of:

- `npx sanity logout && npx sanity login` with the account that owns `bn544cp3`, then re-run `npx sanity@latest mcp configure` so MCP follows, or
- invite `bunnyking828@gmail.com` (github) to `bn544cp3` as an administrator, or
- confirm a different project id is the intended target.

**2. The `production` dataset is currently public.**

An unauthenticated GROQ query against `bn544cp3`/`production` returns `200` with a result body. AGENTS.md §12 requires a private dataset with a server-held read token. The dataset must be switched to private (`npx sanity dataset visibility set production private`, or via Sanity Manage). That also needs project access, so it follows blocker 1.

The dataset is empty (`*[0]` → `null`), so nothing is lost by flipping visibility.

**Phase A (tooling guards) and the app-side file authoring in Phase C do not depend on either blocker and can proceed.**

## Decisions and assumptions

1. **Standalone Studio, never embedded.** Per AGENTS.md §5 and `nextjs.md` §1. With the app at the repo root this needs care — see "Cost of the flat layout" below.
2. **No `defineLive`.** `nextjs.md` presents the Live Content API as the default, but `defineLive` takes a `browserToken` and ships a Sanity token to the browser. AGENTS.md §5 and §12 are explicit — "The browser holds no token." Vertex pages are read-only and content changes are not live-critical, so this pass uses a server-only client plus a `sanityFetch` helper with Next.js tag/time revalidation instead. Visual Editing and Presentation are out of scope and would need this revisited.
3. **`apiVersion` is a hard-coded constant**, not an env var, per `get-started.md`. Value: `2026-09-11` (today, UTC).
4. **`sanity/` not `src/sanity/`.** The app has no `src/` dir and `@/*` maps to `./*`. Adding `src/` now would churn every import in 18 files for no gain.
5. **TypeGen glob is scoped, not bare `**`.** `../**/*.{ts,tsx}` would walk the app's `node_modules`, `agent/`, and `.agents/`. Use `../{app,components,sanity}/**/*.{ts,tsx}`.
6. **~~No root `package.json`~~ — superseded.** The flat layout means the root `package.json` *is* the app's. The Studio gets its own nested `studio/package.json`.

7. **TypeGen artifacts: commit `sanity.types.ts`, ignore `studio/schema.json`.** `typegen.md` Option A — types are available right after `git pull` and CI needs no extra step. `schema.json` is regenerated noise.
8. **`.env.local` and `.env.example` stay at the repo root**, where Next.js reads them. `.env.example` remains the canonical committed list per AGENTS.md §12.
9. **No app files move at all.** The app keeps its exact current layout.

### Cost of the flat layout (the user's call, recorded here)

Nesting `studio/` inside the Next.js project root means the app's tooling would otherwise sweep up Studio source. Three guards are required and must stay in place:

- `tsconfig.json` → `exclude: ["node_modules", "agent", "studio"]`, because `include` is `**/*.ts` / `**/*.tsx`.
- `eslint.config.mjs` → `globalIgnores` gains `"studio/**"` and `"agent/**"`.
- `.gitignore` → `/studio/node_modules`, `/studio/dist`, `/studio/.sanity`, `/studio/schema.json`.

Turbopack root detection turned out **not** to need `turbopack.root`: it resolves upward and finds the root `package-lock.json` first.

One consequence has no clean guard: `sanity init` run from the repo root now detects a Next.js app and switches to its **embedded** Studio flow, which AGENTS.md §5 forbids. Workaround: scaffold the Studio in a temp directory outside the repo, then move `studio/` in.

## Files touched

### Phase A — isolate the nested Studio from the app's tooling (done)

No files move. Instead, three config edits keep `studio/` out of the app's type check, lint, and git:

- `.gitignore` — add `/studio/node_modules`, `/studio/dist`, `/studio/.sanity`, `/studio/schema.json`.
- `tsconfig.json` — `exclude: ["node_modules", "agent", "studio"]`; add `sanity.types.ts` to `include` (`typegen.md`, tsconfig Requirements).
- `eslint.config.mjs` — `globalIgnores` gains `"studio/**"` and `"agent/**"`.

### Phase B — Studio (new, `studio/`)

Scaffolded in a temp dir outside the repo (to dodge the embedded-Studio flow), then moved to `studio/`. Created by the CLI: `sanity.config.ts`, `sanity.cli.ts`, `package.json`, `tsconfig.json`, `schemaTypes/index.ts` (empty array), `static/`, `.gitignore`, `eslint.config.mjs`.

Then edited:

`studio/sanity.cli.ts` — merge in the TypeGen block, with paths one level up instead of `../web`:

```typescript
import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: { projectId: 'bn544cp3', dataset: 'production' },
  typegen: {
    enabled: true,
    path: '../{app,components,sanity}/**/*.{ts,tsx}',
    schema: 'schema.json',
    generates: '../sanity.types.ts',
    overloadClientMethods: true,
  },
})
```

`studio/package.json` — add `"typegen": "sanity schemas extract --force && sanity typegen generate"`.

### Phase C — app wiring (new files under `sanity/`)

`sanity/env.ts` — client-safe config, fails loudly on missing values. Exports `projectId`, `dataset`, and `apiVersion = '2026-09-11'` as a hard-coded constant. Holds no secret, so a client component may import it safely.

`sanity/client.ts` — server-only read client:

```typescript
import 'server-only'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from './env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
  token: process.env.SANITY_API_READ_TOKEN, // private dataset; server only
})
```

`sanity/fetch.ts` — the fetch helper. `import 'server-only'`, wrapping `client.fetch` with `next: { revalidate, tags }` (`nextjs.md` §3, "Manual sanityFetch Helper"). Default revalidate 60; tags take precedence over revalidate when present.

`sanity/image.ts` — `@sanity/image-url` builder exporting `urlFor`. No `server-only` guard: it takes no token and a client component may need it.

`.env.example` and `.env.local` — append:

```
# Sanity — project id and dataset are client-safe. The read token is server-only.
NEXT_PUBLIC_SANITY_PROJECT_ID=bn544cp3
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=
```

`.env.example` keeps the token blank; the two non-secret values are filled in.

`package.json` — add deps `next-sanity`, `@sanity/image-url`, `server-only`. Do **not** add `@sanity/client`, `groq`, or `@portabletext/react` separately — `next-sanity` re-exports them (`get-started.md`, Phase 3 Step 2).

`sanity.types.ts` — generated by TypeGen, committed.

## Requirements

- Studio is standalone in `studio/`, never mounted at a Next.js route.
- The Next.js app keeps building and serving exactly as it does today after the move — Clerk auth, design-system page, home, sign-in/sign-up all unchanged.
- Sanity reads happen server-side only.
- TypeGen runs end to end from `studio/` and writes `sanity.types.ts`.
- `http://localhost:3000` is registered as a CORS origin with credentials.
- No file outside the moved set changes behaviour.

## Security considerations

- `SANITY_API_READ_TOKEN` is unprefixed and read only from modules carrying `import 'server-only'`. It never appears in `sanity/env.ts`, which client components may import transitively.
- `sanity/client.ts` is `server-only`, so an accidental client import is a build error, not a leaked token.
- No `defineLive` / `browserToken` (decision 2) — that is the one Sanity pattern that would legitimately put a token in the browser, and AGENTS.md forbids it.
- The dataset must end this work **private** (blocker 2). A private dataset with a public `NEXT_PUBLIC_SANITY_PROJECT_ID` is fine — the project id is not a credential.
- `.env.local` stays gitignored; `.env.example` is committed with the secret left blank.
- Clerk's `CLERK_SECRET_KEY` keeps its existing server-only handling; the move does not touch it.

## Acceptance criteria

1. The Next.js app stays at the repo root; `studio/` exists as a nested standalone app.
2. `git status` shows no renames — no app file moved.
3. At the root: `npx tsc --noEmit` clean, `npm run lint` clean, `npm run build` succeeds.
4. At the root: `npm run dev` serves `/`, `/design-system`, `/sign-in` with a clean browser console.
5. In `studio`: `npm run dev` serves the Studio on :3333 and it connects to `bn544cp3`/`production`.
6. In `studio`: `npm run typegen` writes `../sanity.types.ts` and reports the queries it scanned.
7. `npx sanity schemas deploy` and `npx sanity deploy` both succeed. The Studio deploy is what the Context MCP will later require (AGENTS.md §12).
8. A server-side `sanityFetch` returns without a 401 against the now-private dataset.
9. Dataset visibility is `private`.

## Checks to run

From the repo root:

```bash
npm install
npx tsc --noEmit
npm run lint
npm run build
npm run dev
```

From `studio/`:

```bash
npm install
npm run typegen
npx sanity schemas deploy
npx sanity deploy
npx sanity cors add http://localhost:3000 --credentials
npx sanity dataset visibility set production private
npm run dev
```

Report real output. A deploy counts as passed only if it actually ran.

## Manual test steps

1. `npm run dev`, then open http://localhost:3000. Home page renders as before.
2. Click through to `/design-system` via in-app navigation, not the URL bar — this exercises the client-side route transition where env and bundling traps surface (`get-started.md`, Smoke Test).
3. Open the browser console. No `ReferenceError: process is not defined`, no hard reload.
4. Reload `/design-system` directly from the URL bar — exercises SSR.
5. Visit `/my-learning` while signed out. Clerk redirects to sign-in, confirming `proxy.ts` still works.
6. Sign in, confirm the redirect back.
7. In a second terminal: `cd studio && npm run dev`, then open http://localhost:3333. Studio loads, top-right shows the `production` dataset, content pane is empty (no schema types yet).
8. `cd studio && npm run typegen` regenerates `web/sanity.types.ts`.
9. In devtools Network tab on any page, search responses for the read token value. It must not appear.
