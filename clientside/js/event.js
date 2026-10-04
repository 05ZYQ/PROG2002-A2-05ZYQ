/**
 * event.js
 * ---------------------------------------------------------------
 * Event detail page logic:
 *   1. reads the event id from the URL query string (?id=3)
 *   2. validates the id before calling the API
 *   3. calls GET /api/events/:id and renders every detail
 *   4. calculates the fundraising progress bar
 *   5. opens the "under construction" dialog for the Register button
 * ---------------------------------------------------------------
 */

const loadingMessage = document.getElementById("loading-message");
const errorMessage = document.getElementById("error-message");
const content = document.getElementById("event-content");
const modalBackdrop = document.getElementById("modal-backdrop");

/** Reads ?id=... from the address bar. */
function readEventIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

/** Shows the error banner and hides the rest of the page. */
function failWith(message) {
  loadingMessage.classList.add("hidden");
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

/** Writes all API values into the page. */
function renderEvent(event) {
  const past = isPastEvent(event.event_date);
  const goal = Number(event.fundraising_goal);
  const raised = Number(event.amount_raised);
  const percent = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  // header
  const statusTag = document.getElementById("status-tag");
  statusTag.textContent = past ? "Past event" : "Upcoming event";
  statusTag.className = "tag " + (past ? "tag-past" : "tag-upcoming");

  document.getElementById("category-text").textContent = event.category_name;
  document.getElementById("event-name").textContent = event.event_name;
  document.getElementById("event-summary").textContent =
    `${formatFullDate(event.event_date)} at ${formatTime(event.start_time)} · ` +
    `${event.venue}, ${event.location}`;

  // body
  document.getElementById("event-description").textContent = event.event_description;

  document.getElementById("progress-fill").style.width = percent + "%";
  document.getElementById("raised-figure").textContent =
    `${formatMoney(raised)} raised (${percent}%)`;
  document.getElementById("goal-figure").textContent = `Goal: ${formatMoney(goal)}`;
  document.getElementById("progress-note").textContent =
    percent >= 100
      ? "This event has reached its fundraising goal. Thank you for the support!"
      : `${formatMoney(Math.max(goal - raised, 0))} still needed to reach the goal.`;

  // fact list
  document.getElementById("fact-date").textContent = formatFullDate(event.event_date);
  document.getElementById("fact-time").textContent = formatTime(event.start_time);
  document.getElementById("fact-venue").textContent = event.venue;
  document.getElementById("fact-location").textContent = event.location;
  document.getElementById("fact-category").textContent = event.category_name;
  document.getElementById("fact-org").textContent = event.org_name;
  document.getElementById("fact-price").textContent = formatPrice(event.ticket_price);
  document.getElementById("org-contact").textContent =
    `${event.org_name} (${event.contact_email} / ${event.contact_phone})`;

  document.getElementById("footer-note").textContent =
    "Event data retrieved from GET /api/events/" + event.event_id + ".";

  loadingMessage.classList.add("hidden");
  content.classList.remove("hidden");
}

/** Loads the event requested in the URL. */
async function loadEvent() {
  const eventId = readEventIdFromUrl();

  if (!eventId) {
    failWith(
      "No event was selected. Please open an event from the home page or the search page."
    );
    return;
  }
  if (!/^\d+$/.test(eventId)) {
    failWith("The event id in the address bar is not valid.");
    return;
  }

  try {
    const event = await getJSON("/events/" + eventId);

    if (event.is_suspended === 1) {
      failWith("This event has been suspended and is not open to the public.");
      return;
    }
    renderEvent(event);
  } catch (err) {
    failWith(
      "The event details could not be loaded (" + err.message + ")."
    );
  }
}

// --- "Register" dialog -------------------------------------------
document.getElementById("register-button").addEventListener("click", () => {
  modalBackdrop.classList.remove("hidden");
});

document.getElementById("modal-close").addEventListener("click", () => {
  modalBackdrop.classList.add("hidden");
});

// Clicking the dark backdrop (but not the dialog itself) also closes it.
modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) {
    modalBackdrop.classList.add("hidden");
  }
});

// Escape key closes the dialog.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    modalBackdrop.classList.add("hidden");
  }
});

document.addEventListener("DOMContentLoaded", loadEvent);
