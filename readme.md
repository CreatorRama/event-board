# CEREBRO 2026 — Lab 5 (Part A + Part B)

## Files
- **index.html** — page markup. Unchanged from Lab 4 except for the
  Part B layout changes below (nothing was changed for Part A).
- **base.css** — Lab 3/4 work, untouched.
- **style.css** — Lab 3/4 rules followed by two new sections,
  **LAB 5 — Part A** and **LAB 5 — Part B**, appended at the end.

## index.html changes (Part B only)
- `<nav id="site-nav">` was moved out of `<header>` to be its own
  top-level sibling (alongside `<header>`, `<main>`, `<footer>`), so
  it can be its own CSS Grid region.
- A hamburger `<button class="nav-toggle">` was added inside `<nav>`;
  the link list got a second class, `.nav-links`, so CSS can show/hide
  it by width. The button's click behaviour is left for a later lab —
  today it's purely a visual state (hidden on wide screens, shown on
  phones).
- The three event `<article>`s are wrapped in `<div class="event-grid">`
  so the responsive card grid only applies to them, not the paragraph
  or table around them.

## style.css — Part A: design system & the box model
- `* { box-sizing: border-box; }` — first rule, so padding/border
  count *inside* every element's declared width.
- `:root` custom properties — `--brand`, `--accent`, `--ink`, `--paper`,
  `--card-bg`, `--overlay` (one each of hex / `hsl()` / `rgb()` / a
  semi-transparent value), plus the font stack and a type scale
  (`--step-h1` uses `clamp()` for a fluid heading).
- `#main` is the centred page container (`width: min(90%, 60rem)`);
  `section` uses the 4-value padding/margin shorthand.
- `.events article` is the card component (padding, border, radius,
  soft `box-shadow`).
- `h1 + img` is the hero photo (the only `<img>` right after an
  `<h1>`) — `object-fit: cover` + one `calc()` on its width.
- `section:first-of-type a[href="#events"]` is hidden with
  `display: none` — the "reveal later" element for A9.

## style.css — Part B: Grid layout & responsive design
- `body` is the Grid container. Mobile-first base:
  `"header" "nav" "main" "footer"` stacked in one column.
- `#site-nav` is `position: sticky; top: 0;` so it stays pinned while
  scrolling, at every screen width.
- `.event-grid` — `repeat(auto-fit, minmax(15rem, 1fr))` + `gap`, no
  media query: it reflows from many columns down to one on its own.
- `.nav-toggle` / `.nav-links` — hamburger shown / links hidden by
  default (phone), swapped at the first breakpoint.
- **`@media (min-width: 40rem)`** — header + nav share a row (two
  columns); the full link row replaces the hamburger.
- **`@media (min-width: 64rem)`** — nav becomes a sidebar next to
  `main` (`align-self: start` keeps it from stretching to match
  main's height, so the sticky positioning still has room to work).

## Still to do (manual, not code)
- **B8** — open DevTools device mode, resize phone → desktop, confirm
  both breakpoints kick in, and take the two screenshots.
- **B9** — run `style.css` through jigsaw.w3.org/css-validator and fix
  anything it flags.