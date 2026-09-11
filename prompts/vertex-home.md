# Vertex home page (measured rebuild)

Supersedes the first pass, which was built from visual estimation and missed the framed column,
the striped gutters, the warm canvas, and every real dimension. This version is built from
measurements taken off `design/vertex-home.png` with `sharp`.

## Goal

Reproduce `design/vertex-home.png` at `/`. Presentational only — no Sanity, Clerk, PostHog or data
fetching. Course content is a local typed array so it can be swapped for a GROQ fetch later.

## Skills / docs read

- AGENTS.md §3 (reference image is the source of truth, reuse components, responsive to mobile),
  §5, §13, §14.
- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` — App Router page
  conventions and `<Link>`.
- No Sanity/Clerk/Context skill applies: nothing here reaches a datastore or an LLM.

## Method

The PNG is 1024×1536 and is treated as **1:1 CSS px at a 1024px viewport**. Geometry came from
column/row luminance profiles and bounding boxes; type sizes were derived from measured cap heights
(Playfair cap ≈ 0.70em, Inter cap ≈ 0.727em).

**Colour caveat, resolved:** the home PNG's button samples ≈ `#E4633F`, not the documented
`#F97316`. Sampling the *design-system* sheet settled it — its swatch labelled `#F97316` renders as
`#F6621A`, and `#0F172A` renders as `#151A26`. Both exports carry the same shift, so **the
documented tokens are authoritative** and no new orange is introduced. The warm background is a
separate matter: the home canvas samples `#FBF8F5` (R>G>B) while Neutral 50 is the cool `#FAFAFC`
(B>R). That difference is real and directional, not a shift, so it becomes a new token.

## Measured spec

**Frame** — vertical hairlines at x=29 and x=994 → a **966px centred column** with 1px side borders.
Outside it, 45° `///` stripes, 13px horizontal period, ~1.5px line. Implemented as a striped outer
wrapper plus an opaque canvas column, so the stripes simply disappear below the max width.

> **Width override.** The brief sets the content column to **1440px**, wider than the 966px the
> reference was measured against. Component sizes and type stay exactly as measured — the export's
> type (16px nav, 68px hero) reads as 1:1 web values, not a scaled-down 1440px artboard, so
> rescaling them would inflate the design rather than match it. Only the horizontal container
> dimensions scale by 1440/966 ≈ 1.49 at `xl`: header padding 42 → 63, section padding 52 → 78,
> search max-width 748 → 1115, subtitle max-width 440 → 656. Below `xl` the measured values hold.

**Header** — 96px tall, bottom hairline, 42px side padding. Logo mark 32px + wordmark. Nav 16px
medium, "Courses" active at x=245, "My Learning" at x=346. Bell 24px, avatar 50px circle, 21px gap.

**Hero** — centred, 68px below the header.
| Element | Size | Position |
| --- | --- | --- |
| Eyebrow pill | 209×39, radius 10, 13px uppercase, ~0.12em tracking | top y=165 |
| `h1` | Playfair bold **68px / 74px**, 2 lines | cap top y=242 |
| Subtitle | 20px / 33px, 2 lines, neutral-500 | top y=408 |
| CTA | **231×65**, radius 12, 28px padding, 18px label, 24px gap, 20px arrow | top y=500 |
| Search | **748×88**, radius 12, 24px icon at 27px inset, 20px placeholder, 64×42 kbd at 24px inset | top y=602 |

Full-width divider at y=742.

**Courses** — 52px side padding (content 858px). "All Courses" Playfair **28px**, cap top y=802.
"View all courses" 17px primary + 16px arrow, right aligned. Grid 3 × ~275px, **16px gap**.

Card: **374px tall**, radius 16, hairline border. Padding 32 top / 28 sides. Logo tile **72×72**
(radius 16) at y=888 — Next.js is a dark tile with a white "N", TypeScript a blue tile with "TS",
**Docker is a bare illustration with no tile**. Title Playfair **24px** at y=995; description
15px/25px at y=1044. Footer divider at y=1156 **inset 18px** (10px wider than the 28px body
padding, reproduced with a negative inline margin); meta row 16px icons + 12px labels.

**Footer note** — hairline rules flexing out from a centred group: 20px star, 32px gap, 17px label,
24px gap. Rule at y=1301, spanning the 858px content width.

**Bar decoration** — `aria-hidden`, two clusters split by a ~103px gap. Left heights
88/121/152/184/133/97; right 59/85/114/152/182/90/133/170. Each bar is a vertical
transparent→salmon gradient, blurred, clipped by the page edge.

## Decisions and assumptions

1. **New tokens only for the canvas**: `--color-canvas` `#FBF8F5`, `--color-canvas-line` `#EFE7E0`,
   `--color-canvas-card` `#FEFCFA`. Primary and neutral scales are untouched, so `/design-system`
   is unaffected.
2. **`CourseCard` gains `layout: "row" | "stacked"`.** The design-system sheet shows the horizontal
   card; the home page shows the stacked one. `row` stays the default so the showcase renders
   exactly as before — this is the fix for the first pass, which changed the shared card in place.
3. **`Navbar`'s `right` prop from the first pass is reverted.** The site header is its own component
   (96px, warm canvas, 42px padding) rather than the showcase's navbar with a slot bolted on.
4. **Avatar is initials, not a photo** — no asset exists and the real one arrives with Clerk's
   `<UserButton />`. Same 50px circle. Flagged.
5. **The Docker mark is a hand-authored SVG approximation** of the whale-and-containers logo; no
   brand asset exists in the repo and the PNG is too low-res to trace.
6. **Type sizes come from cap-height measurement**, so several fall outside the documented scale
   (68, 28, 24, 20, 17). The reference image outranks the scale per AGENTS.md §3.
7. **Server components throughout**; the search field is an uncontrolled input and `⌘ K` is a visual
   hint only. The bell is presentational per AGENTS.md §7.
8. Nav and CTA links point at `/courses` and `/my-learning`, which do not exist yet and will 404.

## Files touched

| File | Change |
| --- | --- |
| `app/globals.css` | canvas tokens + gutter stripe utility |
| `app/page.tsx` | rewritten to the measured spec |
| `components/ui/PageFrame.tsx` | new — column, side hairlines, striped gutters |
| `components/ui/SiteHeader.tsx` | new |
| `components/ui/Avatar.tsx` | new |
| `components/ui/CourseLogos.tsx` | rewritten — tiles for N/TS, bare illustration for Docker |
| `components/home/BarDecoration.tsx` | new |
| `components/ui/Card.tsx` | `CourseCard` gains `layout` |
| `components/ui/Navigation.tsx` | revert the `right` prop and inline avatar |
| `components/ui/Input.tsx` | keep `inputSize`, retune `lg` to 88px |

## Requirements

- Desktop matches the reference: framed column, striped gutters, and the measured geometry above.
- No horizontal overflow at 375px: grid 1 → 2 (md) → 3 (lg); hero type scales down; the frame's
  borders and stripes fall away below 966px; header padding tightens.
- Tokens only — no raw hex outside the brand marks' own colours.
- Semantic landmarks, ordered headings, `aria-hidden` decoration, accessible names on the bell and
  search, visible focus states.
- No new dependencies.

## Security considerations

None — static presentational page. No tokens, env vars, network calls, or server routes. The
placeholder data stays placeholder; no client-side fetch is introduced ahead of the server-side
Sanity client.

## Acceptance criteria

1. `/` reproduces the reference top to bottom at 1024px.
2. `/design-system` is visually unchanged (this is what `layout="row"` protects).
3. No horizontal overflow at 375px.
4. `next build` and `eslint` pass.

## Checks to run

- `npx eslint app components`
- `npx next build`
- `npm run dev`, load `/` and `/design-system`

## Manual test steps

1. `npm run dev`, open `http://localhost:3000/` at a 1024px-wide window.
2. Compare against `design/vertex-home.png` top to bottom.
3. Confirm the striped gutters and the column's side hairlines appear above 966px and vanish below.
4. Resize to 768 and 375 — no horizontal scroll, cards reflow.
5. Tab through logo → nav → bell → avatar → CTA → search → cards; every stop shows a focus ring.
6. Open `/design-system` and confirm the showcase, including its horizontal course card, is
   unchanged.
