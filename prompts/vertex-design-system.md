# Vertex design system implementation

> Backfilled after the fact — AGENTS.md's `prompts/` + approval workflow
> (sections 2 and 4) was not yet present in this file when this task was
> executed. Recorded here for the trail; process is followed from here on.

## Goal

Implement the Vertex design system from `design/vertext-designsystem.png`
into the Next.js app: design tokens (color, type scale, spacing, radius,
shadow), the component set shown in the reference (buttons, inputs, badges,
status indicators, progress bar, cards, navigation, icons), and a living
style-guide page that renders all of it.

## Skills / docs read

- `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md` —
  confirmed `next/font/google` variable-font pattern already used in the
  scaffolded `app/layout.tsx` (Geist) carries over unchanged to Playfair
  Display + Inter.
- Skimmed `node_modules/next/dist/docs/index.md` and the `01-app` doc tree —
  no other breaking-change notices applicable to a static styling task.

## Code inspected before writing

- `app/layout.tsx`, `app/globals.css`, `app/page.tsx` — stock
  `create-next-app` output (Tailwind v4, Geist fonts).
- `package.json` / `tsconfig.json` — Next 16.3.4, React 19, Tailwind v4,
  `@/*` path alias to repo root, no icon library installed.
- No existing `components/` directory — greenfield.

## Decisions & assumptions

- Tailwind v4 `@theme` tokens in `globals.css` for colors/radius/shadows/fonts,
  plus explicit `.text-*` utility classes for the named type-scale styles
  (Display 1/2, Heading 1-3, Body Large/Body/Small) since Tailwind has no
  first-class named type-scale concept.
- No icon library added (none was installed, network install not required
  for the task) — hand-built a small SVG icon set matching the spec (24×24
  grid, 2px stroke, rounded caps, outline + filled variants).
- Interpreted "implement this design system" as: build the reusable
  component primitives **and** a style-guide page (`app/page.tsx`) that
  demonstrates every section of the reference image 1:1, since there's no
  existing product page to apply the tokens to yet.
- Button "hover" state expressed via CSS `:hover`, not a separate visual
  component state; "disabled" via the native `disabled` attribute.

## Files touched

- `app/globals.css` — full token system + type-scale utility classes.
- `app/layout.tsx` — swapped Geist → Playfair Display / Inter.
- `app/page.tsx` — rewrote scaffold into the style-guide page.
- `components/ui/icons.tsx`, `Button.tsx`, `Input.tsx`, `Select.tsx`,
  `Badge.tsx`, `StatusIndicator.tsx`, `ProgressBar.tsx`, `Card.tsx`,
  `Navigation.tsx` — new.
- `tsconfig.json` — added `agent` to `exclude`; the pre-existing
  `agent/skills/create-agent-with-sanity-context/references/ecommerce/**`
  sample app was being swept into the app's TS program by the `**/*.tsx`
  include glob and its lowercase `components/ui/button.tsx` /
  `badge.tsx` collided case-insensitively with the new
  `components/ui/Button.tsx` / `Badge.tsx` on Windows' case-insensitive
  filesystem. That reference folder isn't part of the Next.js app, so
  excluding it is the correct fix rather than renaming the new components.

## Requirements covered

Sections 01–14 of the reference: colors, typography, type scale, spacing,
radius/shadows, icons (outline + filled), buttons (4 variants × 3 states),
inputs (search + select), badges/tags, status indicators, progress bar,
cards (course/lesson-video/lesson/resource), navigation (navbar/breadcrumbs/
pagination), principles.

## Security considerations

None — static presentational UI, no data fetching, no user input handled
beyond uncontrolled form elements in the style guide.

## Acceptance criteria

- `next build` succeeds.
- `eslint` clean.
- Page renders and matches the reference's tokens, type scale, spacing
  values, and component states.

## Checks run

- `npx next build` — passed (see below for the fix needed to get there).
- `npx eslint app components` — passed after removing one unused
  destructured var.
- `next dev` started, `curl localhost:3000` returned 200 with expected
  markup (`Design System`, `Get Started`) present. No headless browser
  (`chromium-cli`, Playwright) available in this environment, so no
  screenshot was taken — flagged explicitly rather than claimed.

## Manual test steps

1. `npm run dev`
2. Open `http://localhost:3000`
3. Confirm each numbered section (01 Colors … 14 Principles) renders and
   matches `design/vertext-designsystem.png`.
4. Hover/disable-check the buttons in section 07; tab through the search
   input and select in section 08 to confirm focus states.
