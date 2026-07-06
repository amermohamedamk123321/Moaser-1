import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "evaluations.db");

let db;
let SQL;
let initialized = false;

// Initialize database connection
async function initializeDatabase() {
  try {
    SQL = await initSqlJs();
    
    // Load existing database file if it exists
    if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath);
      db = new SQL.Database(buffer);
      console.log("Connected to existing SQLite database");
    } else {
      db = new SQL.Database();
      console.log("Created new SQLite database");
    }
    
    createTables();
    initialized = true;
  } catch (err) {
    console.error("Error initializing database:", err);
    throw err;
  }
}

// Save database to file
function saveDatabase() {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error("Error saving database:", err);
  }
}

// Create all tables if they don't exist
function createTables() {
  const adminTableSql = `
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      email TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      isActive BOOLEAN DEFAULT 1
    )
  `;

  const appointmentsTableSql = `
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      service TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const doctorsTableSql = `
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      docKey TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      specialty TEXT,
      status TEXT DEFAULT 'active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const evaluationsTableSql = `
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
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const surveysTableSql = `
    CREATE TABLE IF NOT EXISTS patient_surveys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      docKey TEXT,
      q1 INTEGER NOT NULL,
      q2 INTEGER NOT NULL,
      q3 INTEGER NOT NULL,
      q4 INTEGER NOT NULL,
      q5 INTEGER NOT NULL,
      waitingTime INTEGER,
      suggestions TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const patientFeedbackSurveysTableSql = `
    CREATE TABLE IF NOT EXISTS patient_feedback_surveys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      docKey TEXT NOT NULL,
      doctorFeedback TEXT,
      q1 TEXT NOT NULL,
      q2 TEXT NOT NULL,
      q3 TEXT NOT NULL,
      q4 TEXT NOT NULL,
      q5 TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    db.run(adminTableSql);
    db.run(appointmentsTableSql);
    db.run(doctorsTableSql);
    db.run(evaluationsTableSql);
    db.run(surveysTableSql);
    db.run(patientFeedbackSurveysTableSql);
    saveDatabase();
    console.log("Database tables ensured");

    // Initialize doctors if none exist
    initializeDoctors();
  } catch (err) {
    console.error("Error creating tables:", err);
  }
}

// Initialize default doctors
function initializeDoctors() {
  try {
    const stmt = db.prepare("SELECT COUNT(*) as count FROM doctors");
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();

    if (result.count === 0) {
      const defaultDoctors = [
        { docKey: 'doc1', name: 'Dr. Ahmad', specialty: 'General Dentistry' },
        { docKey: 'doc2', name: 'Dr. Fatima', specialty: 'Orthodontics' },
        { docKey: 'doc3', name: 'Dr. Mohammed', specialty: 'Implants' },
      ];

      for (const doc of defaultDoctors) {
        try {
          const insertStmt = db.prepare(`
            INSERT INTO doctors (docKey, name, specialty, status)
            VALUES (?, ?, ?, 'active')
          `);
          insertStmt.bind([doc.docKey, doc.name, doc.specialty]);
          insertStmt.step();
          insertStmt.free();
        } catch (err) {
          console.error(`Error inserting doctor ${doc.docKey}:`, err);
        }
      }
      saveDatabase();
      console.log("Default doctors initialized");
    }
  } catch (err) {
    console.error("Error initializing doctors:", err);
  }
}

// Helper function to get results as array of objects
function getResults(stmt) {
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// ===== ADMIN USER FUNCTIONS =====

function getAdminUserByUsername(username) {
  try {
    const stmt = db.prepare("SELECT * FROM admin_users WHERE username = ? AND isActive = 1");
    stmt.bind([username]);
    const results = getResults(stmt);
    return results.length > 0 ? results[0] : null;
  } catch (err) {
    console.error("Error fetching admin user:", err);
    return null;
  }
}

function createAdminUser(username, passwordHash, email = null) {
  try {
    const stmt = db.prepare(`
      INSERT INTO admin_users (username, passwordHash, email)
      VALUES (?, ?, ?)
    `);
    stmt.bind([username, passwordHash, email]);
    stmt.step();
    stmt.free();
    saveDatabase();
    return { id: 1, username, email };
  } catch (err) {
    console.error("Error creating admin user:", err);
    throw err;
  }
}

function updateAdminPassword(userId, passwordHash) {
  try {
    const stmt = db.prepare(`
      UPDATE admin_users 
      SET passwordHash = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.bind([passwordHash, userId]);
    stmt.step();
    stmt.free();
    saveDatabase();
    return { success: true };
  } catch (err) {
    console.error("Error updating admin password:", err);
    throw err;
  }
}

// ===== DOCTORS FUNCTIONS =====

function createDoctor(docKey, name, specialty = null) {
  try {
    const stmt = db.prepare(`
      INSERT INTO doctors (docKey, name, specialty, status)
      VALUES (?, ?, ?, 'active')
    `);
    stmt.bind([docKey, name, specialty]);
    stmt.step();
    stmt.free();
    saveDatabase();
    return { docKey, name, specialty };
  } catch (err) {
    console.error("Error creating doctor:", err);
    throw err;
  }
}

function getAllDoctors() {
  try {
    const sql = "SELECT * FROM doctors WHERE status = 'active' ORDER BY name ASC";
    const stmt = db.prepare(sql);
    const results = getResults(stmt);
    return results;
  } catch (err) {
    console.error("Error fetching doctors:", err);
    return [];
  }
}

function getDoctorByKey(docKey) {
  try {
    const stmt = db.prepare("SELECT * FROM doctors WHERE docKey = ? AND status = 'active'");
    stmt.bind([docKey]);
    const results = getResults(stmt);
    return results.length > 0 ? results[0] : null;
  } catch (err) {
    console.error("Error fetching doctor:", err);
    return null;
  }
}

// ===== APPOINTMENTS FUNCTIONS =====

function createAppointment(appointmentData) {
  try {
    const stmt = db.prepare(`
      INSERT INTO appointments (name, phone, service, date, time, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `);
    stmt.bind([
      appointmentData.name,
      appointmentData.phone,
      appointmentData.service,
      appointmentData.date,
      appointmentData.time,
      appointmentData.notes || ""
    ]);
    stmt.step();
    stmt.free();
    saveDatabase();
    return appointmentData;
  } catch (err) {
    console.error("Error creating appointment:", err);
    throw err;
  }
}

function getAllAppointments(page = 1, limit = 20, status = null) {
  try {
    let sql = "SELECT * FROM appointments";
    const params = [];

    if (status) {
      sql += " WHERE status = ?";
      params.push(status);
    }

    sql += " ORDER BY createdAt DESC";
    
    const offset = (page - 1) * limit;
    sql += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = getResults(stmt);
    return results;
  } catch (err) {
    console.error("Error fetching appointments:", err);
    return [];
  }
}

function getAppointmentById(id) {
  try {
    const stmt = db.prepare("SELECT * FROM appointments WHERE id = ?");
    stmt.bind([id]);
    const results = getResults(stmt);
    return results.length > 0 ? results[0] : null;
  } catch (err) {
    console.error("Error fetching appointment:", err);
    return null;
  }
}

function updateAppointment(id, updates) {
  try {
    const allowedFields = ['status', 'notes', 'date', 'time'];
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return { success: false, message: "No valid fields to update" };
    }

    values.push(id);
    const sql = `UPDATE appointments SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    
    const stmt = db.prepare(sql);
    stmt.bind(values);
    stmt.step();
    stmt.free();
    saveDatabase();
    return { success: true, changes: 1 };
  } catch (err) {
    console.error("Error updating appointment:", err);
    throw err;
  }
}

function deleteAppointment(id) {
  try {
    const stmt = db.prepare("DELETE FROM appointments WHERE id = ?");
    stmt.bind([id]);
    stmt.step();
    stmt.free();
    saveDatabase();
    return { success: true, changes: 1 };
  } catch (err) {
    console.error("Error deleting appointment:", err);
    throw err;
  }
}

function getAppointmentStats() {
  try {
    const sql = `
      SELECT 
        COUNT(*) as totalAppointments,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingAppointments,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmedAppointments,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedAppointments
      FROM appointments
    `;
    const stmt = db.prepare(sql);
    stmt.step();
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  } catch (err) {
    console.error("Error fetching appointment stats:", err);
    return { totalAppointments: 0, pendingAppointments: 0, confirmedAppointments: 0, completedAppointments: 0 };
  }
}

// ===== DOCTOR EVALUATIONS FUNCTIONS =====

function insertEvaluation(evaluation) {
  try {
    const stmt = db.prepare(`
      INSERT INTO doctor_evaluations (docKey, behavior, competence, treatmentQuality, explanation, followUp, overallSatisfaction, comments)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.bind([
      evaluation.docKey,
      evaluation.behavior,
      evaluation.competence,
      evaluation.treatmentQuality,
      evaluation.explanation,
      evaluation.followUp,
      evaluation.overallSatisfaction,
      evaluation.comments || ""
    ]);
    stmt.step();
    stmt.free();
    saveDatabase();
    return evaluation;
  } catch (err) {
    console.error("Error inserting evaluation:", err);
    throw err;
  }
}

function getAllEvaluations(page = 1, limit = 50) {
  try {
    const offset = (page - 1) * limit;
    const sql = "SELECT * FROM doctor_evaluations ORDER BY createdAt DESC LIMIT ? OFFSET ?";
    const stmt = db.prepare(sql);
    stmt.bind([limit, offset]);
    const results = getResults(stmt);
    return results;
  } catch (err) {
    console.error("Error fetching evaluations:", err);
    return [];
  }
}

function getEvaluationsByDoctor(docKey, page = 1, limit = 50) {
  try {
    const offset = (page - 1) * limit;
    const sql = "SELECT * FROM doctor_evaluations WHERE docKey = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?";
    const stmt = db.prepare(sql);
    stmt.bind([docKey, limit, offset]);
    const results = getResults(stmt);
    return results;
  } catch (err) {
    console.error("Error fetching evaluations for doctor:", err);
    return [];
  }
}

function getEvaluationById(id) {
  try {
    const stmt = db.prepare("SELECT * FROM doctor_evaluations WHERE id = ?");
    stmt.bind([id]);
    const results = getResults(stmt);
    return results.length > 0 ? results[0] : null;
  } catch (err) {
    console.error("Error fetching evaluation:", err);
    return null;
  }
}

function deleteEvaluation(id) {
  try {
    const stmt = db.prepare("DELETE FROM doctor_evaluations WHERE id = ?");
    stmt.bind([id]);
    stmt.step();
    stmt.free();
    saveDatabase();
    return { success: true, changes: 1 };
  } catch (err) {
    console.error("Error deleting evaluation:", err);
    throw err;
  }
}

function getEvaluationStats() {
  try {
    const sql = `
      SELECT
        COUNT(*) as totalEvaluations,
        AVG(CASE WHEN overallSatisfaction = 'excellent' THEN 3
                 WHEN overallSatisfaction = 'average' THEN 2
                 ELSE 1 END) as averageSatisfaction
      FROM doctor_evaluations
    `;
    const stmt = db.prepare(sql);
    stmt.step();
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  } catch (err) {
    console.error("Error fetching evaluation stats:", err);
    return { totalEvaluations: 0, averageSatisfaction: 0 };
  }
}

// ===== PATIENT SURVEYS FUNCTIONS =====

// Helper function to convert rating to score (poor=1, average=2, excellent=3)
function convertRatingToScore(rating) {
  if (typeof rating === 'number') {
    return rating;
  }
  const ratingMap = {
    'poor': 1,
    'average': 2,
    'excellent': 3
  };
  return ratingMap[rating] || 1;
}

function insertSurvey(q1, q2, q3, q4, q5, waitingTime = null, suggestions = null, docKey = null) {
  try {
    const stmt = db.prepare(`
      INSERT INTO patient_surveys (docKey, q1, q2, q3, q4, q5, waitingTime, suggestions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.bind([docKey, q1, q2, q3, q4, q5, waitingTime, suggestions]);
    stmt.step();
    stmt.free();
    saveDatabase();
    return { docKey, q1, q2, q3, q4, q5, waitingTime, suggestions };
  } catch (err) {
    console.error("Error inserting survey:", err);
    throw err;
  }
}

function getAllSurveys(page = 1, limit = 50, docKey = null) {
  try {
    const offset = (page - 1) * limit;
    let sql = "SELECT * FROM patient_surveys";
    const params = [];

    if (docKey) {
      sql += " WHERE docKey = ?";
      params.push(docKey);
    }

    sql += " ORDER BY createdAt DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = getResults(stmt);
    return results;
  } catch (err) {
    console.error("Error fetching surveys:", err);
    return [];
  }
}

function getSurveyById(id) {
  try {
    const stmt = db.prepare("SELECT * FROM patient_surveys WHERE id = ?");
    stmt.bind([id]);
    const results = getResults(stmt);
    return results.length > 0 ? results[0] : null;
  } catch (err) {
    console.error("Error fetching survey:", err);
    return null;
  }
}

function deleteSurvey(id) {
  try {
    const stmt = db.prepare("DELETE FROM patient_surveys WHERE id = ?");
    stmt.bind([id]);
    stmt.step();
    stmt.free();
    saveDatabase();
    return { success: true, changes: 1 };
  } catch (err) {
    console.error("Error deleting survey:", err);
    throw err;
  }
}

function getSurveyStats(docKey = null) {
  try {
    let sql = `
      SELECT
        COUNT(*) as totalResponses,
        ROUND(AVG(q1), 2) as avgQ1,
        ROUND(AVG(q2), 2) as avgQ2,
        ROUND(AVG(q3), 2) as avgQ3,
        ROUND(AVG(q4), 2) as avgQ4,
        ROUND(AVG(q5), 2) as avgQ5,
        ROUND((SUM(q1) + SUM(q2) + SUM(q3) + SUM(q4) + SUM(q5)) * 100.0 / (COUNT(*) * 5 * 3), 1) as percentageOverall,
        ROUND(AVG(waitingTime), 2) as avgWaitingTime
      FROM patient_surveys
    `;

    const params = [];
    if (docKey) {
      sql += " WHERE docKey = ?";
      params.push(docKey);
    }

    const stmt = db.prepare(sql);
    if (params.length > 0) {
      stmt.bind(params);
    }
    stmt.step();
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  } catch (err) {
    console.error("Error fetching survey stats:", err);
    return { totalResponses: 0, avgQ1: 0, avgQ2: 0, avgQ3: 0, avgQ4: 0, avgQ5: 0, percentageOverall: 0, avgWaitingTime: 0 };
  }
}

function getSurveyMessagesByDoctor(docKey) {
  try {
    const messages = [];

    // Get suggestions from patient_surveys
    const suggestionsStmt = db.prepare(`
      SELECT suggestions as message, createdAt, 'suggestion' as type FROM patient_surveys
      WHERE docKey = ? AND suggestions IS NOT NULL AND suggestions != ''
      ORDER BY createdAt DESC
    `);
    suggestionsStmt.bind([docKey]);
    while (suggestionsStmt.step()) {
      messages.push(suggestionsStmt.getAsObject());
    }
    suggestionsStmt.free();

    // Get feedback from patient_feedback_surveys
    const feedbackStmt = db.prepare(`
      SELECT doctorFeedback as message, createdAt, 'feedback' as type FROM patient_feedback_surveys
      WHERE docKey = ? AND doctorFeedback IS NOT NULL AND doctorFeedback != ''
      ORDER BY createdAt DESC
    `);
    feedbackStmt.bind([docKey]);
    while (feedbackStmt.step()) {
      messages.push(feedbackStmt.getAsObject());
    }
    feedbackStmt.free();

    // Sort all messages by createdAt descending
    messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return messages;
  } catch (err) {
    console.error("Error fetching survey messages:", err);
    return [];
  }
}

// ===== PATIENT FEEDBACK SURVEYS FUNCTIONS =====

function insertFeedbackSurvey(feedback) {
  try {
    const stmt = db.prepare(`
      INSERT INTO patient_feedback_surveys (docKey, doctorFeedback, q1, q2, q3, q4, q5)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.bind([
      feedback.docKey,
      feedback.doctorFeedback || null,
      feedback.q1,
      feedback.q2,
      feedback.q3,
      feedback.q4,
      feedback.q5
    ]);
    stmt.step();
    stmt.free();
    saveDatabase();
    return feedback;
  } catch (err) {
    console.error("Error inserting feedback survey:", err);
    throw err;
  }
}

function getAllFeedbackSurveys(page = 1, limit = 50) {
  try {
    const offset = (page - 1) * limit;
    const sql = "SELECT * FROM patient_feedback_surveys ORDER BY createdAt DESC LIMIT ? OFFSET ?";
    const stmt = db.prepare(sql);
    stmt.bind([limit, offset]);
    const results = getResults(stmt);
    return results;
  } catch (err) {
    console.error("Error fetching feedback surveys:", err);
    return [];
  }
}

function getFeedbackSurveyById(id) {
  try {
    const stmt = db.prepare("SELECT * FROM patient_feedback_surveys WHERE id = ?");
    stmt.bind([id]);
    const results = getResults(stmt);
    return results.length > 0 ? results[0] : null;
  } catch (err) {
    console.error("Error fetching feedback survey:", err);
    return null;
  }
}

function getFeedbackSurveysByDoctor(docKey, page = 1, limit = 50) {
  try {
    const offset = (page - 1) * limit;
    const sql = "SELECT * FROM patient_feedback_surveys WHERE docKey = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?";
    const stmt = db.prepare(sql);
    stmt.bind([docKey, limit, offset]);
    const results = getResults(stmt);
    return results;
  } catch (err) {
    console.error("Error fetching feedback surveys for doctor:", err);
    return [];
  }
}

function deleteFeedbackSurvey(id) {
  try {
    const stmt = db.prepare("DELETE FROM patient_feedback_surveys WHERE id = ?");
    stmt.bind([id]);
    stmt.step();
    stmt.free();
    saveDatabase();
    return { success: true, changes: 1 };
  } catch (err) {
    console.error("Error deleting feedback survey:", err);
    throw err;
  }
}

function getFeedbackSurveyStats() {
  try {
    const sql = `
      SELECT
        COUNT(*) as totalFeedback,
        COUNT(DISTINCT docKey) as doctorsRated,
        SUM(CASE WHEN q1 = 'excellent' THEN 1 ELSE 0 END) as q1Excellent,
        SUM(CASE WHEN q1 = 'average' THEN 1 ELSE 0 END) as q1Average,
        SUM(CASE WHEN q1 = 'poor' THEN 1 ELSE 0 END) as q1Poor,
        SUM(CASE WHEN q2 = 'excellent' THEN 1 ELSE 0 END) as q2Excellent,
        SUM(CASE WHEN q2 = 'average' THEN 1 ELSE 0 END) as q2Average,
        SUM(CASE WHEN q2 = 'poor' THEN 1 ELSE 0 END) as q2Poor,
        SUM(CASE WHEN q3 = 'excellent' THEN 1 ELSE 0 END) as q3Excellent,
        SUM(CASE WHEN q3 = 'average' THEN 1 ELSE 0 END) as q3Average,
        SUM(CASE WHEN q3 = 'poor' THEN 1 ELSE 0 END) as q3Poor,
        SUM(CASE WHEN q4 = 'excellent' THEN 1 ELSE 0 END) as q4Excellent,
        SUM(CASE WHEN q4 = 'average' THEN 1 ELSE 0 END) as q4Average,
        SUM(CASE WHEN q4 = 'poor' THEN 1 ELSE 0 END) as q4Poor,
        SUM(CASE WHEN q5 = 'excellent' THEN 1 ELSE 0 END) as q5Excellent,
        SUM(CASE WHEN q5 = 'average' THEN 1 ELSE 0 END) as q5Average,
        SUM(CASE WHEN q5 = 'poor' THEN 1 ELSE 0 END) as q5Poor
      FROM patient_feedback_surveys
    `;
    const stmt = db.prepare(sql);
    stmt.step();
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  } catch (err) {
    console.error("Error fetching feedback survey stats:", err);
    return { totalFeedback: 0 };
  }
}

export {
  initializeDatabase,
  // Admin
  getAdminUserByUsername,
  createAdminUser,
  updateAdminPassword,
  // Doctors
  createDoctor,
  getAllDoctors,
  getDoctorByKey,
  // Appointments
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentStats,
  // Evaluations
  insertEvaluation,
  getAllEvaluations,
  getEvaluationsByDoctor,
  getEvaluationById,
  deleteEvaluation,
  getEvaluationStats,
  // Surveys
  insertSurvey,
  getAllSurveys,
  getSurveyById,
  deleteSurvey,
  getSurveyStats,
  getSurveyMessagesByDoctor,
  convertRatingToScore,
  // Feedback Surveys
  insertFeedbackSurvey,
  getAllFeedbackSurveys,
  getFeedbackSurveyById,
  getFeedbackSurveysByDoctor,
  deleteFeedbackSurvey,
  getFeedbackSurveyStats
};
