/**
 * home.js
 * ---------------------------------------------------------------
 * Home page logic. Calls GET /api/events/upcoming when the page
 * loads, then renders one row per event into the DOM using the
 * date-box + summary layout defined in site.css.
 * ---------------------------------------------------------------
 */

/** Builds the HTML for a single event row. */
function buildEventRow(event) {
  const { day, month } = dateParts(event.event_date);
  const image = event.event_image
    ? `img/${encodeURIComponent(event.event_image.replace(".jpg", ".svg"))}`
    : "";

  return `
    <li class="event-row">
      <div class="date-box">
        <span class="day">${escapeHtml(day)}</span>
        <span class="month">${escapeHtml(month)}</span>
      </div>
      <div class="event-body">
        <h3><a href="${eventLink(event.event_id)}">${escapeHtml(event.event_name)}</a></h3>
        <p class="event-meta">
          <span class="tag tag-upcoming">Upcoming</span>
          ${escapeHtml(event.category_name)} &middot; ${escapeHtml(event.venue)},
          ${escapeHtml(event.location)} &middot; ${escapeHtml(formatTime(event.start_time))}
        </p>
        <p class="event-note">${escapeHtml(event.event_description)}</p>
        <p class="event-links">
          Tickets from <strong>${escapeHtml(formatPrice(event.ticket_price))}</strong>
          &nbsp;|&nbsp; <a href="${eventLink(event.event_id)}">View event details &rarr;</a>
        </p>
      </div>
      ${image ? `<div class="thumb"><img src="${image}" alt=""></div>` : ""}
    </li>`;
}

/** Fetches the upcoming events and writes them into the page. */
async function loadUpcomingEvents() {
  const list = document.getElementById("event-list");
  const status = document.getElementById("status-message");
  const error = document.getElementById("error-message");
  const empty = document.getElementById("empty-message");

  try {
    const events = await getJSON("/events/upcoming");

    status.classList.add("hidden");

    if (events.length === 0) {
      empty.classList.remove("hidden");
      return;
    }

    list.innerHTML = events
      .map(buildEventRow)
      .join("");

    // Show how many events the API returned.
    const summary = document.createElement("p");
    summary.className = "message info";
    summary.textContent = `${events.length} upcoming events found.`;
    list.parentNode.insertBefore(summary, list);
  } catch (err) {
    status.classList.add("hidden");
    error.textContent =
      "Sorry, the event list could not be loaded (" + err.message + "). " +
      "Please check that the API server is running.";
    error.classList.remove("hidden");
  }
}

document.addEventListener("DOMContentLoaded", loadUpcomingEvents);
