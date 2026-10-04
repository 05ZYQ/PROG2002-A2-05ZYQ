/**
 * event_db.js
 * ---------------------------------------------------------------
 * Database connection module for the Kindred City Charity website.
 * Creates a connection pool to the MySQL database "charityevents_db"
 * and exports a query helper used by the API layer (app.js).
 *
 * PROG2002 Web Development II - Assignment 2
 * ---------------------------------------------------------------
 */

const mysql = require("mysql2");

// Pool configuration. Update user/password to match your local MySQL setup.
const pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",            // <-- change to your MySQL root password
  database: "charityevents_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Runs a parameterised SQL statement and returns the result rows.
 * Placeholder values (?) are escaped by the driver, which protects
 * the endpoint against SQL injection.
 *
 * @param {string} sql      SQL statement with optional ? placeholders
 * @param {Array}  params   values for the placeholders
 * @returns {Promise<Array>} query result rows
 */
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) {
        console.error("[event_db] query failed:", err.message);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

module.exports = { runQuery, pool };
