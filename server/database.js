import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "evaluations.db");

let db;

// Initialize database connection
function initializeDatabase() {
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("Error opening database:", err);
    } else {
      console.log("Connected to SQLite database");
      createTable();
    }
  });
}

// Create table if it doesn't exist
function createTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS doctor_evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      docKey TEXT NOT NULL,
      behavior TEXT NOT NULL,
      competence TEXT NOT NULL,
      treatmentQuality TEXT NOT NULL,
      explanation TEXT NOT NULL,
      followUp TEXT NOT NULL,
      overallSatisfaction TEXT NOT NULL,
      comments TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.run(sql, (err) => {
    if (err) {
      console.error("Error creating table:", err);
    } else {
      console.log("Table ensured");
    }
  });
}

// Insert evaluation (with parameterized query for SQL injection prevention)
function insertEvaluation(evaluation) {
  const sql = `
    INSERT INTO doctor_evaluations (docKey, behavior, competence, treatmentQuality, explanation, followUp, overallSatisfaction, comments)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    evaluation.docKey,
    evaluation.behavior,
    evaluation.competence,
    evaluation.treatmentQuality,
    evaluation.explanation,
    evaluation.followUp,
    evaluation.overallSatisfaction,
    evaluation.comments,
  ];

  db.run(sql, params, function (err) {
    if (err) {
      console.error("Error inserting evaluation:", err);
    } else {
      console.log("Evaluation inserted with ID:", this.lastID);
    }
  });
}

// Get all evaluations
function getAllEvaluations() {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM doctor_evaluations ORDER BY createdAt DESC";
    db.all(sql, (err, rows) => {
      if (err) {
        console.error("Error fetching evaluations:", err);
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}

// Get evaluations by doctor (with parameterized query)
function getEvaluationsByDoctor(docKey) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM doctor_evaluations WHERE docKey = ? ORDER BY createdAt DESC";
    db.all(sql, [docKey], (err, rows) => {
      if (err) {
        console.error("Error fetching evaluations for doctor:", err);
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}

export { initializeDatabase, insertEvaluation, getAllEvaluations, getEvaluationsByDoctor };
