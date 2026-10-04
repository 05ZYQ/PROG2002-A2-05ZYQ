# Kindred City Charity - Dynamic Charity Events Website

A dynamic website for a fictional non-profit organisation, **Kindred City Charity**,
built for **PROG2002 Web Development II - Assignment 2**. The public can browse
upcoming charity events, search for events by date / location / category, and
open an event page that shows the full description, ticket price and the
fundraising goal versus progress.

## Tech stack

- **Database:** MySQL (`charityevents_db`)
- **Server:** Node.js + ExpressJS RESTful API (read-only GET endpoints)
- **Client:** HTML, CSS, JavaScript (DOM manipulation, fetch + Promises) - no frameworks

## Project structure

```
.
├── api/
│   ├── event_db.js     # MySQL connection pool + query helper
│   ├── app.js          # Express server and API endpoints
│   └── package.json
├── clientside/
│   ├── index.html      # Home page (org info + upcoming events)
│   ├── search.html     # Search page (date / location / category filters)
│   ├── event.html      # Event detail page (goal vs progress, Register dialog)
│   ├── css/site.css    # Shared stylesheet
│   ├── js/             # api.js (shared), home.js, search.js, event.js
│   └── img/            # Simple SVG illustrations per event
└── database/
    └── charityevents_db.sql   # Schema + sample data export
```

## Getting started

### 1. Create the database

Import the SQL export into MySQL (Workbench: File > Open SQL Script > Run, or):

```bash
mysql -u root -p < database/charityevents_db.sql
```

### 2. Configure the connection

Open `api/event_db.js` and set `user` / `password` for your local MySQL server.

### 3. Install and run

Requires Node.js 18+ (developed and tested on Node 20).

```bash
cd api
npm install
npm start
```

### 4. Open the website

Visit <http://localhost:3030> - the Express server serves both the website and
the API.

## API endpoints

| Method | Endpoint                | Purpose                                            |
|--------|-------------------------|----------------------------------------------------|
| GET    | `/api/events/upcoming`  | Active, upcoming events for the home page          |
| GET    | `/api/categories`       | Event categories for the search drop-down          |
| GET    | `/api/events/filter`    | Search by `date`, `location` and/or `category`     |
| GET    | `/api/events/:id`       | Full detail of one event for the event page        |

Example search call:

```
GET /api/events/filter?date=2026-11-01&location=west&category=1
```

## Features checklist

- Home page with hard-coded organisation information and a dynamic event list
  (past and suspended events are excluded automatically).
- Search page with one or more combined criteria, a Clear filters button,
  client-side validation messages and Past / Upcoming status tags.
- Event detail page reached via a URL query string (`event.html?id=3`),
  showing ticket information, the hosting organisation and a fundraising
  goal vs progress bar.
- Register button opens a dialog stating the feature is under construction
  (full registration arrives in Assessment 3).
- Navigation menu present on every page.
