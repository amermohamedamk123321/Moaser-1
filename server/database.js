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

  try {
    db.run(adminTableSql);
    db.run(appointmentsTableSql);
    db.run(evaluationsTableSql);
    saveDatabase();
    console.log("Database tables ensured");
  } catch (err) {
    console.error("Error creating tables:", err);
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

export {
  initializeDatabase,
  // Admin
  getAdminUserByUsername,
  createAdminUser,
  updateAdminPassword,
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
  getEvaluationStats
};
