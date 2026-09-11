# Clerk authentication setup

## Goal

Wire Clerk into the Vertex web workspace: SDK install, provider, root proxy (Next 16's renamed
middleware), auth controls in the existing header, and a committed `.env.example`. Browsing stays
public; only `/my-learning` is gated. No Sanity, no progress writes, no PostHog in this pass.

## Skills / docs read

- `AGENTS.md` §5 (auth is Clerk through Next.js middleware; secret key server-only; publishable key
  is the only value that reaches the browser), §7 (Clerk only — not Sanity auth; browsing public,
  gate only what a feature marks protected; per-user state keys off the Clerk user id and is written
  only through a server route), §12 (env rules, committed `.env.example`), §13 (checks).
- `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` — **"Starting with Next.js 16,
  Middleware is now called Proxy."** File is `proxy.ts` at project root, exporting `proxy` (named or
  default) plus `config.matcher`.
- Clerk setup instructions supplied in the request (CLI flow, app `app_3JBCMpP5h9VjKQHXnXZLVU1lgCn`,
  matcher rule, `auth()` is async on Next 15+, `ClerkProvider` inside `<body>`).

## Code inspected

- `package.json` — single root workspace, `next@16.3.4`, `react@19.2.8`, npm (`package-lock.json`).
  No Studio workspace exists yet, so "web workspace" is the repo root for now.
- `app/layout.tsx` — root layout, fonts on `<html>`, `<body className="min-h-full flex flex-col …">`.
- `components/ui/SiteHeader.tsx` — header with a static `<Avatar initials="C">` and a non-functional
  bell button. The avatar is the slot the real user control belongs in.
- `components/ui/Avatar.tsx` — its own comment already says it is a placeholder "until Clerk".
- No `proxy.ts`, no `middleware.ts`, no `.env*`, no `components.json` (so the shadcn step is skipped).

## Decisions and assumptions

1. **`proxy.ts`, not `middleware.ts`.** Next 16 renamed it. If `clerk init` emits `middleware.ts`
   (it may still assume Next 15), rename to `proxy.ts` and export `proxy`, keeping `clerkMiddleware`
   as the handler. Verify against Clerk's installed SDK before renaming — if `@clerk/nextjs` ships a
   Next-16 proxy entrypoint, use theirs.
2. **Matcher** includes Clerk's auto-proxy path once, after the API matcher: `'/(api|trpc)(.*)'`
   then `'/__clerk/:path*'`.
3. **Gating.** `createRouteMatcher(['/my-learning(.*)'])` → `auth.protect()`. Home, `/courses`,
   course/lesson/instructor pages stay public. Future `/api/progress` gets added to this list when
   that route lands.
4. **Header controls.** Replace the static `Avatar` in `SiteHeader` with `<Show when="signed-out">`
   → sign-in + sign-up, `<Show when="signed-in">` → `<UserButton />`. Styling follows the existing
   design tokens: sign-in as a text link at the header's 16px medium weight, sign-up reusing the
   project `Button`, `UserButton` appearance sized to the measured 50px circle so header height and
   the 21px gap do not shift. `Avatar.tsx` stays (used elsewhere for instructor/course art).
5. **Env.** `clerk init` writes real keys to `.env.local` (gitignored — confirm `.gitignore` covers
   `.env*`). I add a committed `.env.example` listing `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and
   `CLERK_SECRET_KEY` with empty values, as the canonical list §12 asks for. `.gitignore:34` is
   `.env*`, which would swallow it, so a `!.env.example` negation is added right after it.
6. **No custom sign-in pages.** Clerk's hosted/modal flow is enough; the design has no sign-in
   screen. Revisit when a reference image exists.
7. `clerk auth login` opens a browser flow the user must complete themselves.

## Files expected to touch

| File | Change |
| --- | --- |
| `package.json` / lockfile | `@clerk/nextjs` added by `clerk init` |
| `app/layout.tsx` | `<ClerkProvider>` wrapping the contents of `<body>` (inside, never around `<html>`) |
| `proxy.ts` (new) | `clerkMiddleware` + route matcher + `config.matcher` |
| `components/ui/SiteHeader.tsx` | auth controls replace the placeholder avatar |
| `.env.example` (new) | canonical, valueless key list |
| `.env.local` | written by the CLI, gitignored, never read or printed |
| `.gitignore` | add `!.env.example` after the existing `.env*` rule |

## Requirements

- `ClerkProvider` sits inside `<body>`.
- `auth()` is awaited everywhere (Next 15+ async API).
- Import from `@clerk/nextjs`, never `@clerk/clerk-react`.
- Header and page layout are visually unchanged when signed out except that the avatar slot now
  holds real controls; the 96px header height and side padding stay exactly as measured.
- Responsive down to mobile — controls collapse without wrapping the header.

## Security

- `CLERK_SECRET_KEY` is server-only; it appears in no client component and no `NEXT_PUBLIC_*` name.
- Route protection lives in `proxy.ts`, not in client code.
- No Sanity/write tokens are introduced here; progress writes remain out of scope.
- `.env.local` is never read or echoed; `.env.example` carries names only, no values.

## Acceptance criteria

1. `npx tsc --noEmit` clean.
2. `npm run lint` clean.
3. `npm run build` succeeds (root config and server code changed).
4. `clerk doctor` reports no issues.
5. Signed out: header shows sign-in and sign-up; visiting `/my-learning` redirects to sign-in.
6. Signed in: header shows `UserButton`; `/my-learning` renders.
7. `/` and `/courses` load signed out.

## Checks to run

`npx tsc --noEmit`, `npm run lint`, `npm run build`, `clerk doctor`, `npm run dev`.
Studio checks do not apply — no Studio workspace in this change.

## Manual test steps

1. `npm run dev`, open `http://localhost:3000`.
2. Confirm the header renders sign-in and sign-up in the avatar slot, layout unshifted.
3. Navigate to `/my-learning` while signed out → redirected to Clerk sign-in.
4. Sign up as the first test user; confirm redirect back and a user button in the header.
5. Open the user button → profile and sign-out work.
6. Revisit `/my-learning` signed in → renders.
7. Sign out → header returns to sign-in/sign-up.
8. Narrow the viewport to ~375px → header controls still fit on one row.
