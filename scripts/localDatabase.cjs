#!/usr/bin/env node

/**
 * Local SQLite Database Manager
 * This script manages a local SQLite database file for the Nubank Tracker application.
 * It can be used in a Node.js environment to persist data to a file.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, '..', 'data', 'nubank_tracker.db');

// Create database directory if it doesn't exist
const fs = require('fs');
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
console.log('Attempting to connect to database at:', DB_PATH);
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database at:', DB_PATH);
    initializeTables();
  }
});

// Create tables if they don't exist
function initializeTables() {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table ready.');
    }
  });

  // Create applications table
  db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      initial_value REAL NOT NULL,
      start_date DATETIME NOT NULL,
      user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('Error creating applications table:', err.message);
    } else {
      console.log('Applications table ready.');
    }
  });

  // Create history table
  db.run(`
    CREATE TABLE IF NOT EXISTS history (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      date DATETIME NOT NULL,
      gross_value REAL NOT NULL,
      net_value REAL NOT NULL,
      user_id INTEGER,
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('Error creating history table:', err.message);
    } else {
      console.log('History table ready.');
    }
  });
}

// User operations
function createUser(username, password, callback) {
  const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  stmt.run([username, password], function(err) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, this.lastID);
    }
  });
  stmt.finalize();
}

function authenticateUser(username, password, callback) {
  console.log('Attempting to authenticate user:', username);
  const stmt = db.prepare('SELECT id, password FROM users WHERE username = ?');
  stmt.get(username, (err, row) => {
    if (err) {
      console.error('Database error during authentication:', err);
      callback(err, null);
    } else if (!row) {
      console.log('User not found in database:', username);
      callback(null, null); // User not found
    } else {
      console.log('User found, checking password. Stored password:', row.password, 'Provided password:', password);
      if (row.password !== password) {
        console.log('Password mismatch for user:', username);
        callback(null, null); // Password mismatch
      } else {
        console.log('Authentication successful for user:', username);
        callback(null, row.id); // Success
      }
    }
  });
  stmt.finalize();
}

function getUserById(id, callback) {
  const stmt = db.prepare('SELECT id, username FROM users WHERE id = ?');
  stmt.get(id, (err, row) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, row);
    }
  });
  stmt.finalize();
}

// Application operations
function createApplication(application, userId, callback) {
  const stmt = db.prepare('INSERT INTO applications (id, name, initial_value, start_date, user_id) VALUES (?, ?, ?, ?, ?)');
  stmt.run([
    application.id,
    application.name,
    application.initialValue,
    application.startDate instanceof Date ? application.startDate.toISOString() : application.startDate,
    userId
  ], function(err) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, { ...application, id: this.lastID });
    }
  });
  stmt.finalize();
}

function getApplications(userId, callback) {
  const stmt = db.prepare('SELECT id, name, initial_value as initialValue, start_date as startDate FROM applications WHERE user_id = ? ORDER BY start_date DESC');
  stmt.all(userId, (err, rows) => {
    if (err) {
      callback(err, null);
    } else {
      try {
        const processedRows = rows.map(row => {
          // Ensure startDate is properly parsed
          let startDate = row.startDate;
          if (typeof startDate === 'string') {
            const parsedDate = new Date(startDate);
            if (!isNaN(parsedDate.getTime())) {
              startDate = parsedDate;
            } else {
              console.warn("Invalid date format in database for application:", row.id, startDate);
              startDate = new Date(); // Fallback to current date
            }
          }
          
          return {
            ...row,
            startDate: startDate
          };
        });
        callback(null, processedRows);
      } catch (processError) {
        console.error("Error processing applications:", processError);
        callback(processError, null);
      }
    }
  });
  stmt.finalize();
}

function updateApplication(application, userId, callback) {
  const stmt = db.prepare('UPDATE applications SET name = ?, initial_value = ?, start_date = ? WHERE id = ? AND user_id = ?');
  stmt.run([
    application.name,
    application.initialValue,
    application.startDate instanceof Date ? application.startDate.toISOString() : application.startDate,
    application.id,
    userId
  ], function(err) {
    if (err) {
      callback(err);
    } else {
      // Check if any rows were affected
      if (this.changes > 0) {
        callback(null, application);
      } else {
        callback(new Error('Application not found or not owned by user'));
      }
    }
  });
  stmt.finalize();
}

function deleteApplication(id, userId, callback) {
  const stmt = db.prepare('DELETE FROM applications WHERE id = ? AND user_id = ?');
  stmt.run([id, userId], function(err) {
    if (err) {
      callback(err);
    } else {
      // Check if any rows were affected
      if (this.changes > 0) {
        callback(null);
      } else {
        callback(new Error('Application not found or not owned by user'));
      }
    }
  });
  stmt.finalize();
}

// History operations
function createHistoryEntry(history, userId, callback) {
  const stmt = db.prepare('INSERT INTO history (id, application_id, date, gross_value, net_value, user_id) VALUES (?, ?, ?, ?, ?, ?)');
  stmt.run([
    history.id,
    history.applicationId,
    history.date instanceof Date ? history.date.toISOString() : history.date,
    history.grossValue,
    history.netValue,
    userId
  ], function(err) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, { ...history, id: this.lastID });
    }
  });
  stmt.finalize();
}

function getHistoryEntries(applicationId, userId, callback) {
  const stmt = db.prepare('SELECT id, application_id as applicationId, date, gross_value as grossValue, net_value as netValue FROM history WHERE application_id = ? AND user_id = ? ORDER BY date DESC');
  stmt.all([applicationId, userId], (err, rows) => {
    if (err) {
      callback(err, null);
    } else {
      try {
        const processedRows = rows.map(row => {
          // Ensure date is properly parsed
          let date = row.date;
          if (typeof date === 'string') {
            const parsedDate = new Date(date);
            if (!isNaN(parsedDate.getTime())) {
              date = parsedDate;
            } else {
              console.warn("Invalid date format in database for history entry:", row.id, date);
              date = new Date(); // Fallback to current date
            }
          }
          
          return {
            ...row,
            date: date
          };
        });
        callback(null, processedRows);
      } catch (processError) {
        console.error("Error processing history entries:", processError);
        callback(processError, null);
      }
    }
  });
  stmt.finalize();
}

function updateHistoryEntry(history, userId, callback) {
  const stmt = db.prepare('UPDATE history SET date = ?, gross_value = ?, net_value = ? WHERE id = ? AND user_id = ?');
  stmt.run([
    history.date instanceof Date ? history.date.toISOString() : history.date,
    history.grossValue,
    history.netValue,
    history.id,
    userId
  ], function(err) {
    if (err) {
      callback(err);
    } else {
      // Check if any rows were affected
      if (this.changes > 0) {
        callback(null, history);
      } else {
        callback(new Error('History entry not found or not owned by user'));
      }
    }
  });
  stmt.finalize();
}

function deleteHistoryEntry(id, userId, callback) {
  const stmt = db.prepare('DELETE FROM history WHERE id = ? AND user_id = ?');
  stmt.run([id, userId], function(err) {
    if (err) {
      callback(err);
    } else {
      // Check if any rows were affected
      if (this.changes > 0) {
        callback(null);
      } else {
        callback(new Error('History entry not found or not owned by user'));
      }
    }
  });
  stmt.finalize();
}

// Close database connection
function closeDatabase() {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
  });
}

// Export functions
module.exports = {
  createUser,
  authenticateUser,
  getUserById,
  createApplication,
  getApplications,
  updateApplication,
  deleteApplication,
  createHistoryEntry,
  getHistoryEntries,
  updateHistoryEntry,
  deleteHistoryEntry,
  closeDatabase
};

// If run directly, show database info
if (require.main === module) {
  console.log('Nubank Tracker Local Database Manager');
  console.log('Database file:', DB_PATH);
  
  // Show tables
  db.serialize(() => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
      if (err) {
        console.error('Error listing tables:', err.message);
      } else {
        console.log('Tables in database:');
        rows.forEach(row => console.log('- ' + row.name));
      }
    });
  });
  
  // Close after a short delay to allow queries to complete
  setTimeout(closeDatabase, 1000);
}