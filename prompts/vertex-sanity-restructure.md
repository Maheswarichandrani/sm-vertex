# Vertex — Sanity restructure (remove embedded Studio, stand up `studio/`)

> Corrective pass over `prompts/vertex-sanity-setup.md`. That prompt was approved and
> only Phase A + Phase C landed; Phase B was blocked on Sanity account access. In the
> meantime `sanity init` was run from the repo root, which triggered Next.js's
> **embedded Studio** flow and scattered template files across the app. This pass
> removes that, completes Phase B, and reshapes the app-side modules to `sanity/lib/`.

## Goal

1. Delete the embedded Studio that `sanity init` scaffolded at the repo root.
2. Scaffold the standalone Studio workspace at `studio/` (project `bn544cp3`, dataset `production`).
3. Move the app-side Sanity modules into `sanity/lib/`, adding `token.ts` and `queries.ts`.
4. Flip `production` to a private dataset and put a server-only read token in `.env.local`.
5. Wire TypeGen from `studio/` so it writes `sanity.types.ts` at the repo root.

Out of scope, unchanged from the prior prompt: the Vertex content schema
(course/module/lesson/instructor/category/video/progress/agent-context), sample content,
search, the Context document, ingestion, Visual Editing, Presentation. Studio ships with
an empty `schemaTypes` array. `studio/scripts/` is **not** created this pass — it belongs
to the ingestion work (AGENTS.md §9).

## Skills read

- `.claude/skills/sanity-best-practices/SKILL.md`
- `.claude/skills/sanity-best-practices/references/get-started.md`
- `.claude/skills/sanity-best-practices/references/project-structure.md`
- `.claude/skills/sanity-best-practices/references/nextjs.md`
- `.claude/skills/sanity-best-practices/references/typegen.md`

(Carried from `vertex-sanity-setup.md`; the decisions they drove are restated below.)

## Code and environment inspected

| What | Finding |
|---|---|
| Sanity CLI auth | **`chandranimaheswari13@gmail.com`** — `sanity debug` confirms. |
| `sanity projects list` | `bn544cp3` "sm-vertex" **now visible**. Prior blocker 1 is cleared. |
| `sanity datasets list -p bn544cp3` | One dataset: `production`. |
| Public read probe | `GET https://bn544cp3.api.sanity.io/v2026-09-11/data/query/production?query=*[0]` → **HTTP 200 unauthenticated**. Dataset is still public. Blocker 2 open. |
| Sanity **MCP** auth | **Stale** — `whoami` returns `Your bearer token is invalid or expired`. MCP holds the old account's token; the CLI relogin did not update it. |
| `.env.local` | Sanity project id + dataset filled. `SANITY_API_READ_TOKEN` is **empty**. |
| `studio/` | Does not exist. Phase B never ran. |
| Embedded Studio present | `app/studio/[[...tool]]/page.tsx`, root `sanity.config.ts` (`basePath: '/studio'`, `'use client'`), root `sanity.cli.ts`, `sanity/lib/{client,image,live}.ts`, `sanity/schemaTypes/index.ts`, `sanity/structure.ts`. |
| Import graph | Nothing under `app/` or `components/` imports any `sanity/*` module yet. Only `sanity.config.ts` imports `./sanity/env`. **Deletion is free.** |
| Phase C files (keep) | `sanity/{env,client,fetch,image}.ts` — server-only client with token, `sanityFetch` with tag/time revalidation, `urlFor`. |
| Phase A guards (already in place) | `tsconfig.json` `exclude: ["node_modules","agent","studio"]` + `sanity.types.ts` in `include`; `eslint.config.mjs` `globalIgnores` has `studio/**` and `agent/**`; `.gitignore` has `/studio/{node_modules,dist,.sanity,schema.json}`. |
| Root `package.json` | Carries Studio-only deps from the embedded flow: `sanity@^5.31.2`, `@sanity/vision@^5.31.2`, `styled-components@^6.5.3`. |
| Node | v22.20.0 — meets the Studio's 22.12+ floor. |

### Duplicate clients to resolve

| File | Origin | Fate |
|---|---|---|
| `sanity/client.ts` | Phase C, approved | → `sanity/lib/client.ts` |
| `sanity/lib/client.ts` | embedded template, `useCdn`, no token | delete |
| `sanity/lib/image.ts` | embedded template | delete (Phase C `image.ts` wins) |
| `sanity/lib/live.ts` | embedded template, `defineLive` | delete — `defineLive` takes a `browserToken`, and AGENTS.md §5/§12 say the browser holds no token |

## Decisions and assumptions

1. **Standalone Studio at `studio/`, never embedded.** AGENTS.md §5. User confirmed.
2. **App-side modules live in `sanity/lib/`, `env.ts` stays at `sanity/env.ts`.** User confirmed, matches the reference structure.
3. **`sanity/lib/token.ts` is a new server-only module** that reads and asserts `SANITY_API_READ_TOKEN`, so the assertion lives in one place and `client.ts` imports it. Carries `import 'server-only'`.
4. **`sanity/lib/queries.ts` is created as an empty, documented `defineQuery` home** — no queries yet, since no schema exists. It exists so the first page has an obvious place to add one and so the TypeGen glob has a target.
5. **Scaffold `studio/` in a temp directory outside the repo, then move it in.** Running `sanity init` from the repo root re-triggers the embedded flow — that is exactly how the current mess happened.
6. **Root `package.json` drops `sanity`, `@sanity/vision`, `styled-components`.** They belong to `studio/package.json`. `next-sanity`, `@sanity/image-url`, `server-only` stay in the app.
7. **`apiVersion` stays a hard-coded `'2026-09-11'` constant** in `sanity/env.ts`, per `get-started.md`. Not an env var.
8. **No `defineLive`** (carried from the prior prompt's decision 2). Server-only client + `sanityFetch` with Next.js tag/time revalidation instead.
9. **Dataset `production` flips to private.** User confirmed. It is empty (`*[0]` → `null`), so nothing is lost.
10. **A read token is created via the CLI and written only to `.env.local`.** `.env.example` keeps the key with a blank value.
11. **TypeGen glob stays scoped** — `../{app,components,sanity}/**/*.{ts,tsx}` — so it does not walk the app's `node_modules`, `agent/`, or `.agents/`.
12. **The Sanity MCP relogin is the user's step**, not mine: `npx sanity@latest mcp configure` then restart the MCP client. Nothing in this pass needs MCP; the Context MCP search work later does.

## Files touched

### Phase 1 — delete the embedded Studio

- `app/studio/` — remove the whole route.
- `sanity.config.ts` (root) — delete.
- `sanity.cli.ts` (root) — delete.
- `sanity/lib/client.ts`, `sanity/lib/image.ts`, `sanity/lib/live.ts` — delete.
- `sanity/schemaTypes/` — delete (it moves to `studio/schemaTypes/`).
- `sanity/structure.ts` — delete (it moves to `studio/structure.ts`).
- `package.json` — drop `sanity`, `@sanity/vision`, `styled-components`; run `npm install`.

### Phase 2 — app-side reshape to `sanity/lib/`

- `sanity/client.ts` → `sanity/lib/client.ts`, import path `../env`, token now from `./token`.
- `sanity/fetch.ts` → `sanity/lib/fetch.ts`, imports `./client`.
- `sanity/image.ts` → `sanity/lib/image.ts`, import path `../env`.
- `sanity/env.ts` — unchanged, stays put.
- `sanity/lib/token.ts` — **new**:

```typescript
import 'server-only'

/**
 * The Sanity read token. The dataset is private, so every read needs it.
 *
 * `server-only` is load-bearing: this module must never reach the browser.
 */
export const token = assertValue(
  process.env.SANITY_API_READ_TOKEN,
  'Missing environment variable: SANITY_API_READ_TOKEN',
)
```

- `sanity/lib/queries.ts` — **new**, empty `defineQuery` home with a comment explaining that queries land here once the schema exists.

End state:

```
sanity/
  lib/
    client.ts    server-only, token, perspective 'published'
    fetch.ts     server-only, sanityFetch with tags/revalidate
    image.ts     urlFor, no token, client-safe
    queries.ts   defineQuery home (empty this pass)
    token.ts     server-only read token
  env.ts         projectId, dataset, apiVersion — client-safe
```

### Phase 3 — the standalone Studio at `studio/`

Scaffolded outside the repo, then moved in:

```
npx sanity@latest init --yes --project bn544cp3 --dataset production \
  --template clean --typescript --output-path <temp>/studio
```

CLI-created: `sanity.config.ts`, `sanity.cli.ts`, `package.json`, `tsconfig.json`,
`schemaTypes/index.ts` (empty array), `static/`, `.gitignore`, `eslint.config.mjs`.

Then edited:

`studio/env.ts` — **new**, so the config does not inline the ids:

```typescript
export const projectId = assertValue(
  process.env.SANITY_STUDIO_PROJECT_ID,
  'Missing environment variable: SANITY_STUDIO_PROJECT_ID',
)
export const dataset = assertValue(
  process.env.SANITY_STUDIO_DATASET,
  'Missing environment variable: SANITY_STUDIO_DATASET',
)
```

(The Studio's Vite build only exposes `SANITY_STUDIO_*` vars, which is why these are
prefixed differently from the app's `NEXT_PUBLIC_SANITY_*`.)

`studio/.env` (gitignored) and `studio/.env.example` (committed) — `SANITY_STUDIO_PROJECT_ID=bn544cp3`, `SANITY_STUDIO_DATASET=production`.

`studio/sanity.cli.ts` — merge in the TypeGen block:

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

### Phase 4 — dataset, token, CORS

- `sanity dataset visibility set production private` (run from `studio/`).
- Create a **Viewer**-role read token, paste into `.env.local` `SANITY_API_READ_TOKEN`.
- `sanity cors add http://localhost:3000 --credentials`.
- `.env.example` — unchanged; it already lists all three Sanity keys with the token blank.

### Phase 5 — generated types

- `sanity.types.ts` at the repo root — generated by `npm run typegen` in `studio/`, committed (`typegen.md` Option A). With an empty schema this is a near-empty file; it exists so `tsconfig.json`'s `include` entry resolves.

## Requirements

- No Studio code is reachable from a Next.js route. `/studio` 404s.
- The app builds and serves exactly as today — Clerk auth, home, design-system, sign-in, sign-up all unchanged.
- Every Sanity read is server-side. `sanity/lib/{client,fetch,token}.ts` all carry `import 'server-only'`.
- `sanity/env.ts` and `sanity/lib/image.ts` stay client-safe (no token).
- TypeGen runs end to end from `studio/` and writes `../sanity.types.ts`.
- `production` is private. **Verified by divergence, not status code**: Sanity filters documents out for an anonymous caller and still answers `200` with `result: []`, so a status check on an empty dataset proves nothing. The real proof is an anonymous read returning `[]` while the token returns the document.
- `http://localhost:3000` is a CORS origin with credentials.
- The three Phase A guards stay in place (tsconfig exclude, eslint ignore, gitignore).

## Security considerations

- `SANITY_API_READ_TOKEN` is unprefixed and read in exactly one module, `sanity/lib/token.ts`, which is `server-only`. An accidental client import is a build error, not a leaked credential.
- No `defineLive` / `browserToken` — the one Sanity pattern that legitimately puts a token in the browser, and the one AGENTS.md §5 forbids.
- The dataset ends this pass **private**. A public `NEXT_PUBLIC_SANITY_PROJECT_ID` is fine — a project id is not a credential.
- Token role is **Viewer** (read), not Editor. The write token for progress (AGENTS.md §7) is a later pass and stays server-route-only.
- `.env.local` and `studio/.env` stay gitignored; `.env.example` and `studio/.env.example` are committed with secrets blank.
- Clerk's `CLERK_SECRET_KEY` handling is untouched.
- The token is never echoed into a command log, a prompt file, or a commit.

## Acceptance criteria

1. `app/studio/`, root `sanity.config.ts`, root `sanity.cli.ts`, `sanity/lib/live.ts`, `sanity/schemaTypes/`, `sanity/structure.ts` are gone.
2. `sanity/` matches the end-state tree above.
3. `studio/` exists as a standalone workspace with its own `package.json` and `node_modules`.
4. `npm run typegen` in `studio/` succeeds and writes `sanity.types.ts`.
5. Root `npx tsc --noEmit` passes; `npm run lint` passes; `npm run build` passes.
6. Studio dev server boots at `http://localhost:3333` and loads the (empty) Content pane.
7. With a document present, an anonymous GROQ against `production` returns `result: []` while the same query with `SANITY_API_READ_TOKEN` returns the document.
8. Root `package.json` has no `sanity`, `@sanity/vision`, or `styled-components`.

## Checks to run (AGENTS.md §13)

From the repo root:

```
npx tsc --noEmit
npm run lint
npm run build
npm run dev          # boot, confirm / and /design-system render, /studio 404s
```

From `studio/`:

```
npm run typegen
npm run dev          # localhost:3333
npx sanity schemas deploy
npx sanity deploy    # required before the Context MCP will serve the dataset (AGENTS.md §12)
```

Visibility check:

```
curl -s -o /dev/null -w "%{http_code}" \
  "https://bn544cp3.api.sanity.io/v2026-09-11/data/query/production?query=*%5B0%5D"
# expect 401
```

## Manual test steps

1. `npm run dev` at the root. Open `http://localhost:3000` — home renders as before.
2. Open `http://localhost:3000/design-system` — renders as before.
3. Open `http://localhost:3000/studio` — **404**. No Studio in the app.
4. Sign in via `/sign-in` — Clerk flow unchanged; `/my-learning` still gated by `proxy.ts`.
5. `cd studio && npm run dev`. Open `http://localhost:3333` — Studio loads, logged in as `chandranimaheswari13@gmail.com`, Content pane empty (no schema yet).
6. Run the visibility check above — `private`, and an anonymous read sees no documents while a token read does.
7. `git status` — `studio/node_modules` and `studio/.env` are not listed.

## Needs the user

- **Sanity MCP relogin**: `npx sanity@latest mcp configure`, then restart the MCP client. Not needed for this pass; required for the Context MCP search work.
- **Deploy approval**: `npx sanity deploy` publishes a Studio at a `*.sanity.studio` hostname. It is required before the Context MCP serves the dataset (AGENTS.md §12), but it is an outward-facing action — confirm the hostname before I run it.
