// script.js - Labs 6 and 7: Campus Event Board (CEREBRO 2026)
// Lab 6 = language basics + DOM + fetch + forms. Lab 7 = JSON & XML (see the LAB 7 block near the bottom).
// Loaded with <script src="script.js" defer></script>, so the DOM is
// already parsed when this file runs.
"use strict"; // catches silent mistakes such as using an undeclared variable

/* ================================================================
   SECTION A - Language basics & logic
   ================================================================ */

// A2: variables. const by default, let only when the value changes. No var.
const PAGE_TITLE = "CEREBRO 2026"; // string
const LOW_SEATS_LIMIT = 5; // number
const DEBUG = true; // boolean (turn off to silence console output)
const EVENTS_URL = "events.json"; // B7: where the data lives
const FAKE_DELAY_MS = 0; // B7 demo delay (was 800 to screenshot "Loading..."); 0 = no artificial wait

let eventsData = []; // let: reassigned once the fetch finishes
let searchTerm = ""; // let: changes on every keystroke

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
  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  };
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
    if (DEBUG) console.log(formatEvent(ev)); // A6: use the returned string
  }

  // A7: arrow function + filter -> new array of events that still have seats
  const available = events.filter((ev) => ev.seats > 0);
  // A7: arrow function + map -> new array of just the titles
  const titles = available.map((ev) => ev.title);
  console.log("Events with seats left:", titles);

  console.table(events); // B9: inspect the data in the Console
}

/* ================================================================
   SECTION B - DOM, events, fetch & validation
   ================================================================ */

// B1: select elements once, store each in a const
const eventGrid = document.querySelector(".event-grid");
const statusBox = document.getElementById("events-status"); // the one getElementById
const searchInput = document.querySelector("#search");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector("#primary-nav-list");
const regForm = document.querySelector("#registration form");
const nameInput = document.querySelector("#name");
const eventSelect = document.querySelector("#event");
const formFields = document.querySelectorAll(
  "#registration input, #registration select",
);

// B3: textContent + setAttribute to show the current state of the list
// state is "loading" | "success" | "error"; CSS styles [data-state="..."]
function showStatus(message, state) {
  statusBox.textContent = message; // B3: read & change content
  statusBox.setAttribute("data-state", state); // B3: setAttribute
}

// B2: build ONE card from ONE event object (createElement / textContent / appendChild)
function createCard(ev) {
  const status = getStatus(ev.seats);

  const card = document.createElement("article");
  card.setAttribute("data-id", ev.id);
  card.setAttribute("title", formatEvent(ev)); // A6 result used as a tooltip

  const heading = document.createElement("h3");
  heading.textContent = ev.title;

  const time = document.createElement("time");
  time.setAttribute("datetime", ev.date);
  time.textContent = formatDate(ev.date);

  const badge = document.createElement("span");
  badge.classList.add("badge");
  badge.textContent = status; // "Full" / "Few left" / "Open"
  badge.classList.add(
    status === "Full"
      ? "badge-full"
      : status === "Few left"
        ? "badge-few"
        : "badge-open",
  );

  const description = document.createElement("p");
  description.textContent = ev.description;

  const meta = document.createElement("p");
  meta.classList.add("meta");
  meta.textContent = `${ev.venue} | ${ev.seats} seats left | ${ev.free ? "Free entry" : "Paid"}${ev.online ? " | Online" : ""}`;

  const rsvp = document.createElement("button");
  rsvp.type = "button";
  rsvp.classList.add("rsvp");
  rsvp.setAttribute("data-id", ev.id); // B5: handler reads this later
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
  const visible = eventsData.filter((ev) =>
    ev.title.toLowerCase().includes(term),
  );

  // A5: loop - one card per visible event
  for (const ev of visible) {
    eventGrid.appendChild(createCard(ev));
  }

  if (visible.length === 0) {
    showStatus(
      `No events match "${searchInput.value.trim()}". Press Esc to clear the search.`,
      "success",
    );
  } else {
    showStatus(
      message || `Showing ${visible.length} of ${eventsData.length} events.`,
      "success",
    );
  }
}

// B7: fetch + await, with three visible states: loading, success, error
async function loadEvents() {
  showStatus("Loading events...", "loading"); // state 1: loading
  try {
    await new Promise((resolve) => setTimeout(resolve, FAKE_DELAY_MS)); // demo delay only
    const response = await fetch(EVENTS_URL);
    if (!response.ok) {
      // fetch only rejects on network failure, so a 404/500 must be turned into an error by hand
      throw new Error(`HTTP ${response.status}`);
    }
    // Lab 7 B3: clone() lets us read the SAME response twice - once as raw text
    // (for the round-trip check and size report), once parsed with res.json().
    const rawJsonText = await response.clone().text();
    const parsed = await response.json(); // Lab 7 B1: JSON text -> JavaScript objects
    if (!Array.isArray(parsed))
      throw new Error("events.json must contain an array");
    eventsData = parsed.filter(isValidEvent); // Lab 7 C2: keep only events that obey the rules
    if (eventsData.length < parsed.length) {
      console.warn(
        `${parsed.length - eventsData.length} event(s) in events.json broke the schema rules and were skipped`,
      );
    }
    renderEvents(); // state 2: success
    logSummary(eventsData);
    runLab7Demos(rawJsonText); // Lab 7: B2, B3, B4, B5
  } catch (error) {
    console.error("Could not load events:", error); // B9: details for developers
    // state 3: error - a friendly message for the user, details stay in the Console
    showStatus(
      "Sorry, we couldn't load the events right now. Please refresh the page or try again later.",
      "error",
    );
  }
}

// B4: hamburger button toggles the nav links with classList.toggle
navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open"); // toggle returns true if class is now present
  navToggle.setAttribute("aria-expanded", String(isOpen)); // keep screen readers in sync
});

// B5: event object + bubbling. ONE listener on the grid handles every RSVP button.
// A click on a button bubbles up to the grid, and event.target tells us which element was hit.
eventGrid.addEventListener("click", (event) => {
  console.log(
    "clicked element:",
    event.target.tagName,
    "| listener on:",
    event.currentTarget.className,
  );

  const button = event.target.closest(".rsvp"); // ignore clicks anywhere else in the grid
  if (!button || button.disabled) return;

  // highlight only the card that was chosen
  for (const card of eventGrid.querySelectorAll("article")) {
    card.classList.toggle("selected", card.contains(button));
  }

  eventSelect.value = button.dataset.id; // pre-select the event in the form
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
    nameInput.setCustomValidity(
      "Please enter a name with at least 2 characters.",
    );
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
    event.preventDefault(); // stop the submit
    for (const field of formFields) showFieldError(field);
    regForm.querySelector(":invalid").focus(); // jump to the first problem
    console.warn("Form blocked: fix the highlighted fields.");
  }
  // NOTE: this is only a convenience for the user. The server must
  // validate again because anyone can bypass JavaScript.
});

/* ================================================================
   LAB 7 - JSON & XML
   ================================================================ */

const EVENTS_XML_URL = "events.xml";
const xmlTitleBox = document.querySelector("#xml-title");
const roundTripBox = document.querySelector("#roundtrip-result");
const roundTripOut = document.querySelector("#roundtrip-output");
const sizeBox = document.querySelector("#size-report");

// C2: the three rules every event must obey (the idea of a schema):
//   1. title is required: a non-empty string
//   2. seats is a whole number, 0 or more (0 means "Full")
//   3. date is an ISO-8601 string, YYYY-MM-DD, and a real calendar date
// Validate BEFORE the rest of the code uses the data, so one bad record
// cannot show "undefined" on a card or crash the page.
function isValidEvent(ev) {
  const hasTitle = typeof ev.title === "string" && ev.title.trim() !== "";
  const hasSeats = Number.isInteger(ev.seats) && ev.seats >= 0;
  const hasIsoDate =
    typeof ev.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(ev.date) &&
    !Number.isNaN(Date.parse(ev.date));
  return hasTitle && hasSeats && hasIsoDate;
}

// B2: read single values from the parsed JSON (index + dot access)
function logValueAccess(events) {
  console.log("First event title:", events[0].title); // events[0].title
  console.log("Seats of last event:", events[events.length - 1].seats); // last index = length - 1
}

// B3: round trip  object -> text -> object
function showRoundTrip(rawJsonText) {
  const text = JSON.stringify(eventsData, null, 2); // object -> text (2-space indent)
  const again = JSON.parse(text); // text -> object
  const fileText = rawJsonText.replace(/\r\n/g, "\n").trim();
  const sameAsFile = text === fileText;
  const sameData = JSON.stringify(again) === JSON.stringify(eventsData);

  roundTripOut.textContent = text; // printed inside the <details> block
  roundTripBox.textContent = sameAsFile
    ? "Round trip: JSON.stringify(events) is identical to events.json. (object -> text -> object)"
    : `Round trip: data is the same (${sameData}), but the text differs from events.json in formatting.`;
  console.log(
    "JSON.stringify(events, null, 2) matches events.json:",
    sameAsFile,
  );
}

// B4: load events.xml, parse it with DOMParser, read the first <title>
async function loadXml() {
  const response = await fetch(EVENTS_XML_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const xmlText = await response.text();
  const xmlDoc = new DOMParser().parseFromString(xmlText, "application/xml");
  // XML must be well-formed: if not, the parser returns a <parsererror> document
  if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
    throw new Error("events.xml is not well-formed");
  }

  const firstTitle = xmlDoc.getElementsByTagName("title")[0].textContent; // XML access
  const firstId = xmlDoc.getElementsByTagName("event")[0].getAttribute("id"); // id is an attribute
  xmlTitleBox.textContent = `First event title read from events.xml: ${firstTitle} (id attribute: ${firstId})`;
  console.log(
    "XML first title:",
    firstTitle,
    "| event elements:",
    xmlDoc.getElementsByTagName("event").length,
  );
  return xmlText;
}

// B5: size check - bytes of the text as it was sent (TextEncoder counts UTF-8 bytes)
const byteSize = (text) => new TextEncoder().encode(text).length; // arrow function

function showSizes(jsonText, xmlText) {
  const jsonBytes = byteSize(jsonText);
  const xmlBytes = byteSize(xmlText);
  const larger = xmlBytes > jsonBytes ? "events.xml" : "events.json";
  sizeBox.textContent = `Size: events.json = ${jsonBytes} bytes | events.xml = ${xmlBytes} bytes | larger: ${larger}`;
  console.log(sizeBox.textContent);
}

async function runLab7Demos(rawJsonText) {
  logValueAccess(eventsData);
  showRoundTrip(rawJsonText);
  try {
    const xmlText = await loadXml();
    showSizes(rawJsonText, xmlText);
  } catch (error) {
    // an XML problem must not break the event cards, so it gets its own message
    console.error("Could not load events.xml:", error);
    xmlTitleBox.textContent =
      "Could not read events.xml (see the Console for details).";
  }
}

// start everything
loadEvents();
