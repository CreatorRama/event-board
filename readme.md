# CEREBRO 2026: Campus Event Board (Labs 3 to 6)

Event page for the IIIT Vadodara (Gandhinagar campus) tech fest. Built up lab by lab:
HTML and CSS in Labs 3 to 5, and **JavaScript interactivity in Lab 6**.

**Live site:** [add GitHub Pages link if enabled]

## Run it locally

`fetch()` does not work on `file://` URLs, so opening `index.html` by double-clicking
will show the "couldn't load events" message. Serve the folder instead:

- VS Code: right-click `index.html` and choose **Open with Live Server**, or
- Terminal: `python -m http.server 8000`, then open <http://localhost:8000>

## Files

| File | Purpose |
|---|---|
| `index.html` | Page markup. Event cards are no longer hard-coded; they are built by JavaScript. |
| `script.js` | **Lab 6.** All behaviour: data handling, rendering, events, fetch, form validation. |
| `events.json` | **Lab 6.** The event data (single source of truth for the cards). |
| `base.css` | Lab 3/4 base styles (reset, typography, link states). |
| `style.css` | Lab 3/4 selectors, Lab 5 design system and layout, plus the Lab 6 block at the end. |
| `thankyou.html`, `thankyou.css` | Page shown after a valid registration. |

## Lab 6: JavaScript

### Section A: Language basics & logic (`script.js`)
- **A1** `script.js` is linked just before `</body>` with `defer`.
- **A2** `const` by default, `let` only for values that change (`eventsData`, `searchTerm`). No `var`.
  Uses a string, number and boolean.
- **A3** Each event is an object `{ id, title, date, seats, online, venue, description }`; the array
  of them drives the whole page.
- **A4** `getStatus(seats)` uses `if / else if / else`: `Full` (0 seats), `Few left` (under 5), `Open`.
- **A5** `for...of` loops walk the events array (rendering and console summary).
- **A6** `formatDate(isoDate)` and `formatEvent(ev)` take a parameter and return a string.
- **A7** Arrow functions with array methods: `events.filter(ev => ev.seats > 0)`,
  `.map(ev => ev.title)`, and the search filter.
- **A8** Variables are kept in the smallest scope that works (for example `options` and `niceDate`
  exist only inside `formatDate`).

### Section B: Interactivity
- **B1** Elements are selected with `querySelector` / `querySelectorAll` (and one `getElementById`).
- **B2** `createCard()` builds each card with `createElement`, `textContent` and `appendChild`.
  The `.event-grid` container in the HTML starts empty.
- **B3** State is shown with `textContent`, `classList.add/toggle`, `style` and `setAttribute`
  (a full event gets a `.full` class, a disabled button and a red badge).
- **B4** The hamburger button toggles the nav links with `classList.toggle("open")` and keeps
  `aria-expanded` in sync.
- **B5** One click listener on the grid reads `event.target` to find which RSVP button was clicked
  (event bubbling). RSVP highlights the card and pre-selects that event in the form.
- **B6** The search box filters cards on every `input`; pressing **Escape** (`keydown`) clears it.
- **B7** `events.json` is loaded with `fetch` + `await`. Three states: **Loading...**, render on
  success, and a friendly message on failure (`try / catch`, plus a check of `response.ok`).
- **B8** The registration form uses `required`, `type="email"` and `pattern`, plus a custom
  `setCustomValidity` rule (name must be at least 2 characters after trimming). Submit is blocked with
  `checkValidity()` + `preventDefault()` and the message is shown beside the field. The server must
  still re-validate, because client-side checks can be bypassed.
- **B9** `console.log`, `console.table` and `console.error` are used to inspect the data and handlers.

### Testing notes
- `FAKE_DELAY_MS` at the top of `script.js` adds a short delay so the Loading state is visible
  for screenshots. Set it to `0` for normal use.
- To see the error state, temporarily point `EVENTS_URL` at a file that does not exist.

## Lab 5: design system & layout (`style.css`)

### Part A: design system & the box model
- `* { box-sizing: border-box; }` so padding and border count inside every declared width.
- `:root` custom properties for the palette (hex, `hsl()`, `rgb()` and a semi-transparent
  overlay), the font stack and a rem-based type scale (`--step-h1` uses `clamp()`).
- `#main` is the centred page container (`width: min(90%, 60rem)`); `section` uses the
  four-value padding/margin shorthand.
- `.events article` is the card component (padding, border, radius, soft `box-shadow`).
- `h1 + img` styles the hero image (`calc()` width, fixed height, `object-fit: contain`).
- The second hero link is hidden with `display: none` (to be revealed later).

### Part B: Grid layout & responsive design
- `body` is the Grid container; mobile-first base stacks header, nav, main, footer in one column.
- `.event-grid` uses `repeat(auto-fit, minmax(15rem, 1fr))` with `gap`, so it reflows with no media query.
- `.nav-toggle` / `.nav-links`: hamburger shown and links hidden on phones.
- `@media (min-width: 40rem)`: header and nav share a row, links replace the hamburger.
- `@media (min-width: 64rem)`: wider page container and more space between nav links; the nav stays
  a single horizontal bar.

## Lab 6 additions to `style.css`
Appended at the end of the file: search bar, fetch-state colours (`[data-state]`), status badges,
`.full` / `.selected` card states, the hamburger open state, and form validation styling
(`.field-error`, `form.was-validated`).

## Submission checklist
- [ ] Screenshots: events rendered from data; search filter; loading / success / error states;
      form error, then fixed
- [ ] `NOTES.pdf` with answers and the final `script.js` appendix
- [ ] Repository link and (optional) Pages link added above
- [ ] Readable commit history