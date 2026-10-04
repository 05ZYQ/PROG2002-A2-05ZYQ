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
// Start the server
// ---------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Kindred City Charity API is running on http://localhost:${PORT}`);
});
