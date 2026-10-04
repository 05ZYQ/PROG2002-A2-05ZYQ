/**
 * app.js
 * ---------------------------------------------------------------
 * RESTful API for the Kindred City Charity events website.
 * Built with Node.js + ExpressJS (PROG2002 Web Development II, A2).
 *
 * Endpoints (all read-only in Assessment 2):
 *   GET /                    - service welcome message
 *   GET /api/events/upcoming - active, upcoming events for the home page
 *   GET /api/categories      - all event categories (search filter)
 *   GET /api/events/filter   - search events by date, location, category
 *   GET /api/events/:id      - full details of one event
 * ---------------------------------------------------------------
 */

const express = require("express");
const { runQuery } = require("./event_db");

const app = express();
const PORT = process.env.PORT || 3030;

// ---------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------
app.use(express.json());

// Simple request logger - helps demonstrate the request/response flow.
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.originalUrl}`);
  next();
});

// ---------------------------------------------------------------
// Home page data: every event that is active, not suspended and
// still in the future, joined with its category and organisation.
// ---------------------------------------------------------------
app.get("/api/events/upcoming", async (req, res) => {
  try {
    const sql = `
      SELECT  e.event_id,
              e.event_name,
              e.event_description,
              e.event_date,
              e.start_time,
              e.venue,
              e.location,
              e.ticket_price,
              e.fundraising_goal,
              e.amount_raised,
              e.event_image,
              c.category_name,
              o.org_name
      FROM event e
      JOIN category c     ON c.category_id = e.category_id
      JOIN organisation o ON o.org_id = e.org_id
      WHERE e.is_active = 1
        AND e.is_suspended = 0
        AND e.event_date >= CURDATE()
      ORDER BY e.event_date ASC`;
    const rows = await runQuery(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve upcoming events." });
  }
});

// ---------------------------------------------------------------
// Categories: used to build the drop-down filter on the search page.
// ---------------------------------------------------------------
app.get("/api/categories", async (req, res) => {
  try {
    const rows = await runQuery(
      "SELECT category_id, category_name, category_description FROM category ORDER BY category_name ASC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve categories." });
  }
});

// ---------------------------------------------------------------
// Search: filter active events by date (from), location and category.
// Any combination of the three criteria is accepted; when a criterion
// is not supplied it is simply left out of the WHERE clause.
//   /api/events/filter?date=2026-11-01&location=east&category=2
// ---------------------------------------------------------------
app.get("/api/events/filter", async (req, res) => {
  const { date, location, category } = req.query;

  // --- validation -------------------------------------------------
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res
      .status(400)
      .json({ error: "Invalid date. Use the YYYY-MM-DD format." });
  }
  if (category && !/^\d+$/.test(category)) {
    return res
      .status(400)
      .json({ error: "Invalid category. The category id must be a number." });
  }

  // --- build the query with parameter placeholders (no SQL injection) --
  const conditions = ["e.is_active = 1", "e.is_suspended = 0"];
  const params = [];

  if (date) {
    conditions.push("e.event_date >= ?");
    params.push(date);
  }
  if (location) {
    conditions.push("(e.location LIKE ? OR e.venue LIKE ?)");
    params.push(`%${location}%`, `%${location}%`);
  }
  if (category) {
    conditions.push("e.category_id = ?");
    params.push(category);
  }

  const sql = `
    SELECT  e.event_id,
            e.event_name,
            e.event_description,
            e.event_date,
            e.start_time,
            e.venue,
            e.location,
            e.ticket_price,
            e.fundraising_goal,
            e.amount_raised,
            e.event_image,
            c.category_name,
            o.org_name
    FROM event e
    JOIN category c     ON c.category_id = e.category_id
    JOIN organisation o ON o.org_id = e.org_id
    WHERE ${conditions.join(" AND ")}
    ORDER BY e.event_date ASC`;

  try {
    const rows = await runQuery(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to search events." });
  }
});

// ---------------------------------------------------------------
// One event: full detail for the event page, including the hosting
// organisation and the fundraising goal / progress figures.
// NOTE: this parameterised route is declared last so that
// "/api/events/upcoming" and "/api/events/filter" are matched first.
// ---------------------------------------------------------------
app.get("/api/events/:id", async (req, res) => {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: "Invalid event id." });
  }

  const sql = `
    SELECT  e.event_id,
            e.event_name,
            e.event_description,
            e.event_date,
            e.start_time,
            e.venue,
            e.location,
            e.ticket_price,
            e.fundraising_goal,
            e.amount_raised,
            e.event_image,
            e.is_active,
            e.is_suspended,
            c.category_id,
            c.category_name,
            c.category_description,
            o.org_id,
            o.org_name,
            o.org_mission,
            o.contact_email,
            o.contact_phone
    FROM event e
    JOIN category c     ON c.category_id = e.category_id
    JOIN organisation o ON o.org_id = e.org_id
    WHERE e.event_id = ?`;

  try {
    const rows = await runQuery(sql, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Event not found." });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve the event." });
  }
});

// ---------------------------------------------------------------
// Fallback handlers
// ---------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found." });
});

app.use((err, req, res, next) => {
  console.error("[api] unexpected error:", err.message);
  res.status(500).json({ error: "Unexpected server error." });
});

// ---------------------------------------------------------------
// Start the server
// ---------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Kindred City Charity API is running on http://localhost:${PORT}`);
});
