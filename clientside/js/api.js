/**
 * api.js
 * ---------------------------------------------------------------
 * Shared helpers used by every client-side page:
 *   - API_BASE    : base URL of the RESTful API
 *   - getJSON()   : Promise-based wrapper around fetch() with
 *                   friendly error handling
 *   - formatting helpers for dates and money
 *   - escapeHtml(): keeps text coming from the database safe to
 *                   insert into the DOM
 * ---------------------------------------------------------------
 */

const API_BASE = "http://localhost:3030/api";

/**
 * Sends a GET request to an API endpoint and resolves with the
 * parsed JSON body. Rejects with an Error carrying the message
 * returned by the API when the response is not OK.
 *
 * @param {string} path e.g. "/events/upcoming"
 */
async function getJSON(path) {
  const response = await fetch(API_BASE + path);

  let payload = null;
  try {
    payload = await response.json();
  } catch (parseError) {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload && payload.error
        ? payload.error
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return payload;
}

/** "2026-11-07" -> "7 November 2026" */
function formatFullDate(isoDate) {
  const parts = String(isoDate).slice(0, 10).split("-");
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${Number(parts[2])} ${months[Number(parts[1]) - 1]} ${parts[0]}`;
}

/** "2026-11-07" -> { day: "07", month: "Nov" } used by the date boxes */
function dateParts(isoDate) {
  const parts = String(isoDate).slice(0, 10).split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return { day: parts[2], month: months[Number(parts[1]) - 1] };
}

/** "19:00:00" -> "7:00 pm" */
function formatTime(sqlTime) {
  const [hourText, minuteText] = String(sqlTime).split(":");
  let hour = Number(hourText);
  const suffix = hour >= 12 ? "pm" : "am";
  hour = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour}:${minuteText} ${suffix}`;
}

/** 45 -> "$45.00"; 0 -> "Free entry" */
function formatPrice(value) {
  const amount = Number(value);
  return amount === 0 ? "Free entry" : `$${amount.toFixed(2)}`;
}

/** 27350 -> "$27,350" */
function formatMoney(value) {
  return "$" + Number(value).toLocaleString("en-AU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/** True when an event date is earlier than today */
function isPastEvent(isoDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(String(isoDate).slice(0, 10) + "T00:00:00") < today;
}

/** Escapes text before it is written into innerHTML */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Builds a link to the event detail page for a given event id */
function eventLink(eventId) {
  return `event.html?id=${encodeURIComponent(eventId)}`;
}
