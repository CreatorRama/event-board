# CEREBRO 2026: Campus Event Board (Labs 3 to 7)

Event page for the IIIT Vadodara (Gandhinagar campus) tech fest. Built up lab by lab:
HTML and CSS in Labs 3 to 5, **JavaScript interactivity in Lab 6**, and **JSON & XML data formats in Lab 7**.

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
| `script.js` | **Lab 6/7.** All behaviour: data handling, rendering, events, fetch, form validation, JSON/XML demos. |
| `events.json` | **Lab 6/7.** The event data (single source of truth for the cards), now with a `free` flag. |
| `events.xml` | **Lab 7.** The same events written as XML (`id` is an attribute, everything else is an element). |
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
- `FAKE_DELAY_MS` at the top of `script.js` is `0`. Raise it (for example to `800`) to make the Loading state
  visible for screenshots.
- To see the error state, temporarily point `EVENTS_URL` at a file that does not exist.

## Lab 7: JSON & XML

The same three events exist in two formats:

```
events.json   [ { "id": "quiz", "title": "Maths Quiz", "seats": 40, "free": true, ... } ]
events.xml    <event id="quiz"><title>Maths Quiz</title><seats>40</seats><free>true</free> ... </event>
```

### Section A: the data
- **A1/A2** `events.json` is an array of objects using a string (`title`), number (`seats`) and boolean (`free`).
- **A3/A4** `events.xml` starts with `<?xml version="1.0" encoding="UTF-8"?>`, has an `<events>` root and one
  `<event>` per item. `id` is an attribute (it identifies the event); all other fields are child elements.
- **A5** Dates are ISO-8601 strings (`2026-09-10`) in both files.

### Section B: using the data in the page (`script.js`, "LAB 7" block)
- **B1** Cards are rendered from `fetch("events.json")` + `res.json()`.
- **B2** `events[0].title` and `events[events.length - 1].seats` are logged in the Console.
- **B3** Round trip: `JSON.stringify(events, null, 2)` is printed in the "Data Formats Lab" section and
  compared with the text of `events.json`.
- **B4** `events.xml` is parsed with `DOMParser`; `getElementsByTagName("title")[0]` is shown on the page.
- **B5** The byte sizes of both files are measured and reported on the page.

### Section C: validate & decide
- **C1** Broken-on-purpose JSON (a trailing comma) is documented in `NOTES.pdf` with the validator error and the fix.
- **C2** `isValidEvent()` enforces three schema rules: `title` is a non-empty string, `seats` is a whole number
  of 0 or more, and `date` is an ISO `YYYY-MM-DD` date. Events that break a rule are skipped with a console warning.
- **C3** The page uses JSON (see `NOTES.pdf` for the reasoning).

### Lab 7 additions to `style.css`
Appended after the Lab 6 block: the result lines and the `<pre>` block of the "Data Formats Lab" section.

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
- [ ] Lab 7 screenshots: cards from events.json; XML title on the page; validator error and the one-character fix
- [ ] `NOTES.pdf` with the Lab 7 answers
- [ ] Repository link and (optional) Pages link added above
- [ ] Readable commit history