// script.js - Lab 6: Campus Event Board (CEREBRO 2026)
// Loaded with <script src="script.js" defer></script>, so the DOM is
// already parsed when this file runs.
"use strict"; // catches silent mistakes such as using an undeclared variable


/* ================================================================
   SECTION A - Language basics & logic
   ================================================================ */

// A2: variables. const by default, let only when the value changes. No var.
const PAGE_TITLE = "CEREBRO 2026";   // string
const LOW_SEATS_LIMIT = 5;           // number
const DEBUG = true;                  // boolean (turn off to silence console output)
const EVENTS_URL = "events.json";    // B7: where the data lives
const FAKE_DELAY_MS = 800;           // B7: lets you SEE the "Loading..." state; set to 0 when done

let eventsData = [];                 // let: reassigned once the fetch finishes
let searchTerm = "";                 // let: changes on every keystroke

// A3: the events array is the single source of truth. Each event is an
// object { id, title, date, seats, online, venue, description }. It now
// lives in events.json (B7) and is loaded into eventsData by loadEvents().


// A4: control flow - if / else if / else labels an event by seats left
function getStatus(seats) {
  if (seats === 0) {
    return "Full";
  } else if (seats < LOW_SEATS_LIMIT) {
    return "Few left";
  } else {
    return "Open";
  }
}

// A6: function with a parameter and a return value.
// A8: scope - `options` and `niceDate` exist ONLY inside this function.
// A const is block/function scoped, so code outside cannot see it.
function formatDate(isoDate) {
  const options = { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" };
  const niceDate = new Date(isoDate).toLocaleDateString("en-IN", options);
  return niceDate;
}

// A6: returns a readable one-line string for an event
function formatEvent(ev) {
  const where = ev.online ? "Online" : "On campus";
  const plural = ev.seats === 1 ? "seat" : "seats";
  return `${ev.title} | ${formatDate(ev.date)} | ${ev.seats} ${plural} (${getStatus(ev.seats)}) | ${where}`;
}

// A5 + A7: loop over every event once, plus arrow functions with array methods
function logSummary(events) {
  console.log(`${PAGE_TITLE}: ${events.length} events loaded`);

  // A5: for...of walks the array, one event per pass
  for (const ev of events) {
    if (DEBUG) console.log(formatEvent(ev));   // A6: use the returned string
  }

  // A7: arrow function + filter -> new array of events that still have seats
  const available = events.filter(ev => ev.seats > 0);
  // A7: arrow function + map -> new array of just the titles
  const titles = available.map(ev => ev.title);
  console.log("Events with seats left:", titles);

  console.table(events); // B9: inspect the data in the Console
}


/* ================================================================
   SECTION B - DOM, events, fetch & validation
   ================================================================ */

// B1: select elements once, store each in a const
const eventGrid    = document.querySelector(".event-grid");
const statusBox    = document.getElementById("events-status");   // the one getElementById
const searchInput  = document.querySelector("#search");
const navToggle    = document.querySelector(".nav-toggle");
const navLinks     = document.querySelector("#primary-nav-list");
const regForm      = document.querySelector("#registration form");
const nameInput    = document.querySelector("#name");
const eventSelect  = document.querySelector("#event");
const formFields   = document.querySelectorAll("#registration input, #registration select");


// B3: textContent + setAttribute to show the current state of the list
// state is "loading" | "success" | "error"; CSS styles [data-state="..."]
function showStatus(message, state) {
  statusBox.textContent = message;           // B3: read & change content
  statusBox.setAttribute("data-state", state); // B3: setAttribute
}

// B2: build ONE card from ONE event object (createElement / textContent / appendChild)
function createCard(ev) {
  const status = getStatus(ev.seats);

  const card = document.createElement("article");
  card.setAttribute("data-id", ev.id);
  card.setAttribute("title", formatEvent(ev));   // A6 result used as a tooltip

  const heading = document.createElement("h3");
  heading.textContent = ev.title;

  const time = document.createElement("time");
  time.setAttribute("datetime", ev.date);
  time.textContent = formatDate(ev.date);

  const badge = document.createElement("span");
  badge.classList.add("badge");
  badge.textContent = status;                    // "Full" / "Few left" / "Open"
  badge.classList.add(status === "Full" ? "badge-full" : status === "Few left" ? "badge-few" : "badge-open");

  const description = document.createElement("p");
  description.textContent = ev.description;

  const meta = document.createElement("p");
  meta.classList.add("meta");
  meta.textContent = `${ev.venue} | ${ev.seats} seats left${ev.online ? " | Online" : ""}`;

  const rsvp = document.createElement("button");
  rsvp.type = "button";
  rsvp.classList.add("rsvp");
  rsvp.setAttribute("data-id", ev.id);           // B5: handler reads this later
  rsvp.textContent = "RSVP";

  // B3: reflect state - toggle a .full class, change the label, use style
  card.classList.toggle("full", ev.seats === 0);
  if (ev.seats === 0) {
    rsvp.textContent = "Event full";
    rsvp.disabled = true;
    card.style.opacity = "0.7";
  }

  card.append(heading, time, " ", badge, description, meta);

  // optional external link (keeps the a[href^="https"] styling from Lab 4 in use)
  if (ev.link) {
    const more = document.createElement("p");
    const a = document.createElement("a");
    a.setAttribute("href", ev.link.url);
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener");
    a.textContent = ev.link.label;
    more.append("More info: ", a);
    card.appendChild(more);
  }

  card.appendChild(rsvp);
  return card;
}

// B2 + B6: render the (optionally filtered) events into the grid
function renderEvents(message) {
  eventGrid.replaceChildren(); // clear old cards

  const term = searchTerm.trim().toLowerCase();
  // A7: arrow function + filter again, now driven by the search box
  const visible = eventsData.filter(ev => ev.title.toLowerCase().includes(term));

  // A5: loop - one card per visible event
  for (const ev of visible) {
    eventGrid.appendChild(createCard(ev));
  }

  if (visible.length === 0) {
    showStatus(`No events match "${searchInput.value.trim()}". Press Esc to clear the search.`, "success");
  } else {
    showStatus(message || `Showing ${visible.length} of ${eventsData.length} events.`, "success");
  }
}

// B7: fetch + await, with three visible states: loading, success, error
async function loadEvents() {
  showStatus("Loading events...", "loading");             // state 1: loading
  try {
    await new Promise(resolve => setTimeout(resolve, FAKE_DELAY_MS)); // demo delay only
    const response = await fetch(EVENTS_URL);
    if (!response.ok) {
      // fetch only rejects on network failure, so a 404/500 must be turned into an error by hand
      throw new Error(`HTTP ${response.status}`);
    }
    eventsData = await response.json();
    renderEvents();                                        // state 2: success
    logSummary(eventsData);
  } catch (error) {
    console.error("Could not load events:", error);       // B9: details for developers
    // state 3: error - a friendly message for the user, details stay in the Console
    showStatus(
      "Sorry, we couldn't load the events right now. Please refresh the page or try again later.",
      "error"
    );
  }
}


// B4: hamburger button toggles the nav links with classList.toggle
navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");       // toggle returns true if class is now present
  navToggle.setAttribute("aria-expanded", String(isOpen)); // keep screen readers in sync
});

// B5: event object + bubbling. ONE listener on the grid handles every RSVP button.
// A click on a button bubbles up to the grid, and event.target tells us which element was hit.
eventGrid.addEventListener("click", (event) => {
  console.log("clicked element:", event.target.tagName, "| listener on:", event.currentTarget.className);

  const button = event.target.closest(".rsvp");           // ignore clicks anywhere else in the grid
  if (!button || button.disabled) return;

  // highlight only the card that was chosen
  for (const card of eventGrid.querySelectorAll("article")) {
    card.classList.toggle("selected", card.contains(button));
  }

  eventSelect.value = button.dataset.id;                  // pre-select the event in the form
  nameInput.focus();
  console.log("RSVP for:", button.dataset.id);
});

// B6: react to typing - filter on every keystroke
searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderEvents();
});
// B6: Escape clears the search
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    searchInput.value = "";
    searchTerm = "";
    renderEvents();
  }
});


// B8: form validation.
// Built-in checks live in the HTML (required, type="email", pattern).
// Custom rule: the name must have at least 2 characters AFTER trimming spaces.
function validateName() {
  if (nameInput.value.trim().length < 2) {
    nameInput.setCustomValidity("Please enter a name with at least 2 characters.");
  } else {
    nameInput.setCustomValidity(""); // empty string = "this field is valid"
  }
}

// show (or clear) the message for one field in its own error <span>
function showFieldError(field) {
  const errorBox = document.getElementById(`${field.id}-error`);
  if (errorBox) errorBox.textContent = field.validationMessage; // "" when valid
}

nameInput.addEventListener("input", validateName);

// live feedback: once a field becomes valid, its message disappears immediately
for (const field of formFields) {
  field.addEventListener("input", () => showFieldError(field));
}

// the form has `novalidate`, so WE decide when to block the submit
regForm.addEventListener("submit", (event) => {
  validateName();
  regForm.classList.add("was-validated"); // CSS now shows red / green borders

  if (!regForm.checkValidity()) {
    event.preventDefault();               // stop the submit
    for (const field of formFields) showFieldError(field);
    regForm.querySelector(":invalid").focus(); // jump to the first problem
    console.warn("Form blocked: fix the highlighted fields.");
  }
  // NOTE: this is only a convenience for the user. The server must
  // validate again because anyone can bypass JavaScript.
});


// start everything
loadEvents();