/**
 * search.js
 * ---------------------------------------------------------------
 * Search page logic:
 *   1. fills the category drop-down from GET /api/categories
 *   2. validates the filter form with basic DOM manipulation
 *   3. calls GET /api/events/filter with the selected criteria
 *   4. renders the matching events (marked past or upcoming)
 *   5. "Clear filters" resets every field and clears the results
 * ---------------------------------------------------------------
 */

const form = document.getElementById("search-form");
const dateInput = document.getElementById("date-input");
const locationInput = document.getElementById("location-input");
const categoryInput = document.getElementById("category-input");
const clearButton = document.getElementById("clear-button");
const formMessage = document.getElementById("form-message");
const resultSummary = document.getElementById("result-summary");
const resultList = document.getElementById("result-list");

/** Shows or hides an element without touching any other class. */
function show(element) {
  element.classList.remove("hidden");
}

function hide(element) {
  element.classList.add("hidden");
}

/** Displays a validation or request error above the results. */
function showError(text) {
  formMessage.textContent = text;
  show(formMessage);
}

function clearError() {
  formMessage.textContent = "";
  hide(formMessage);
}

/** Loads the categories into the select element. */
async function loadCategories() {
  try {
    const categories = await getJSON("/categories");
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.category_id;
      option.textContent = category.category_name;
      categoryInput.appendChild(option);
    });
  } catch (err) {
    showError(
      "The event categories could not be loaded (" + err.message + ")."
    );
  }
}

/** Builds the query string from the filled-in fields only. */
function buildQueryString() {
  const params = new URLSearchParams();

  if (dateInput.value) params.append("date", dateInput.value);
  if (locationInput.value.trim()) params.append("location", locationInput.value.trim());
  if (categoryInput.value) params.append("category", categoryInput.value);

  const queryString = params.toString();
  return queryString ? "?" + queryString : "";
}

/**
 * Checks the form before sending the request.
 * @returns {string|null} an error message, or null when the form is valid
 */
function validateForm() {
  const hasDate = Boolean(dateInput.value);
  const hasLocation = Boolean(locationInput.value.trim());
  const hasCategory = Boolean(categoryInput.value);

  if (!hasDate && !hasLocation && !hasCategory) {
    return "Please choose at least one criterion: a date, a location or a category.";
  }

  if (hasLocation) {
    const location = locationInput.value.trim();
    if (location.length < 3) {
      return "Please enter at least three characters for the location.";
    }
    if (!/^[A-Za-z\s'-]+$/.test(location)) {
      return "The location may only contain letters, spaces, hyphens and apostrophes.";
    }
  }

  if (hasDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosen = new Date(dateInput.value + "T00:00:00");
    if (Number.isNaN(chosen.getTime())) {
      return "Please enter a valid date.";
    }
  }

  return null;
}

/** Renders the array of events returned by the API. */
function renderResults(events) {
  resultList.innerHTML = "";

  if (events.length === 0) {
    resultSummary.textContent =
      "No events matched your search. Try widening the date or choosing another category.";
    show(resultSummary);
    return;
  }

  resultSummary.textContent = `${events.length} matching event${
    events.length === 1 ? "" : "s"
  } found.`;
  show(resultSummary);

  events.forEach((event) => {
    const { day, month } = dateParts(event.event_date);
    const past = isPastEvent(event.event_date);
    const image = event.event_image
      ? `img/${encodeURIComponent(event.event_image.replace(".jpg", ".svg"))}`
      : "";

    const row = document.createElement("li");
    row.className = "event-row";
    row.innerHTML = `
      <div class="date-box">
        <span class="day">${escapeHtml(day)}</span>
        <span class="month">${escapeHtml(month)}</span>
      </div>
      <div class="event-body">
        <h3><a href="${eventLink(event.event_id)}">${escapeHtml(event.event_name)}</a></h3>
        <p class="event-meta">
          <span class="tag ${past ? "tag-past" : "tag-upcoming"}">${past ? "Past" : "Upcoming"}</span>
          ${escapeHtml(event.category_name)} &middot; ${escapeHtml(event.venue)},
          ${escapeHtml(event.location)} &middot; ${escapeHtml(formatFullDate(event.event_date))}
        </p>
        <p class="event-note">${escapeHtml(event.event_description)}</p>
        <p class="event-links">
          Tickets from <strong>${escapeHtml(formatPrice(event.ticket_price))}</strong>
          &nbsp;|&nbsp; <a href="${eventLink(event.event_id)}">View event details &rarr;</a>
        </p>
      </div>
      ${image ? `<div class="thumb"><img src="${image}" alt=""></div>` : ""}`;

    resultList.appendChild(row);
  });
}

/** Handles the form submission. */
async function handleSearch(event) {
  event.preventDefault();
  clearError();

  const validationMessage = validateForm();
  if (validationMessage) {
    showError(validationMessage);
    hide(resultSummary);
    resultList.innerHTML = "";
    return;
  }

  resultSummary.textContent = "Searching...";
  show(resultSummary);

  try {
    const events = await getJSON("/events/filter" + buildQueryString());
    renderResults(events);
  } catch (err) {
    hide(resultSummary);
    resultList.innerHTML = "";
    showError("The search could not be completed (" + err.message + ").");
  }
}

/** Resets every field and clears the results. */
function handleClear() {
  form.reset();
  resultList.innerHTML = "";
  clearError();
  hide(resultSummary);
  dateInput.focus();
}

// --- wiring ------------------------------------------------------
document.addEventListener("DOMContentLoaded", loadCategories);
form.addEventListener("submit", handleSearch);
clearButton.addEventListener("click", handleClear);
