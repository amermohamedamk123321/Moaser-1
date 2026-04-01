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
      createTables();
    }
  });
}

// Create all tables if they don't exist
function createTables() {
  // Admin users table
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

  // Appointments table
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

  // Doctor evaluations table
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

  db.run(adminTableSql, (err) => {
    if (err) {
      console.error("Error creating admin_users table:", err);
    } else {
      console.log("admin_users table ensured");
    }
  });

  db.run(appointmentsTableSql, (err) => {
    if (err) {
      console.error("Error creating appointments table:", err);
    } else {
      console.log("appointments table ensured");
    }
  });

  db.run(evaluationsTableSql, (err) => {
    if (err) {
      console.error("Error creating doctor_evaluations table:", err);
    } else {
      console.log("doctor_evaluations table ensured");
    }
  });
}

// ===== ADMIN USER FUNCTIONS =====

function getAdminUserByUsername(username) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM admin_users WHERE username = ? AND isActive = 1";
    db.get(sql, [username], (err, row) => {
      if (err) {
        console.error("Error fetching admin user:", err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function createAdminUser(username, passwordHash, email = null) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO admin_users (username, passwordHash, email)
      VALUES (?, ?, ?)
    `;
    db.run(sql, [username, passwordHash, email], function (err) {
      if (err) {
        console.error("Error creating admin user:", err);
        reject(err);
      } else {
        resolve({ id: this.lastID, username, email });
      }
    });
  });
}

function updateAdminPassword(userId, passwordHash) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE admin_users 
      SET passwordHash = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    db.run(sql, [passwordHash, userId], function (err) {
      if (err) {
        console.error("Error updating admin password:", err);
        reject(err);
      } else {
        resolve({ success: true });
      }
    });
  });
}

// ===== APPOINTMENTS FUNCTIONS =====

function createAppointment(appointmentData) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO appointments (name, phone, service, date, time, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `;
    const params = [
      appointmentData.name,
      appointmentData.phone,
      appointmentData.service,
      appointmentData.date,
      appointmentData.time,
      appointmentData.notes || ""
    ];
    db.run(sql, params, function (err) {
      if (err) {
        console.error("Error creating appointment:", err);
        reject(err);
      } else {
        resolve({ id: this.lastID, ...appointmentData });
      }
    });
  });
}

function getAllAppointments(page = 1, limit = 20, status = null) {
  return new Promise((resolve, reject) => {
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

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error("Error fetching appointments:", err);
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}

function getAppointmentById(id) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM appointments WHERE id = ?";
    db.get(sql, [id], (err, row) => {
      if (err) {
        console.error("Error fetching appointment:", err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function updateAppointment(id, updates) {
  return new Promise((resolve, reject) => {
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
      return resolve({ success: false, message: "No valid fields to update" });
    }

    values.push(id);
    const sql = `UPDATE appointments SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;

    db.run(sql, values, function (err) {
      if (err) {
        console.error("Error updating appointment:", err);
        reject(err);
      } else {
        resolve({ success: true, changes: this.changes });
      }
    });
  });
}

function deleteAppointment(id) {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM appointments WHERE id = ?";
    db.run(sql, [id], function (err) {
      if (err) {
        console.error("Error deleting appointment:", err);
        reject(err);
      } else {
        resolve({ success: true, changes: this.changes });
      }
    });
  });
}

function getAppointmentStats() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        COUNT(*) as totalAppointments,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingAppointments,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmedAppointments,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedAppointments
      FROM appointments
    `;
    db.get(sql, (err, row) => {
      if (err) {
        console.error("Error fetching appointment stats:", err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// ===== DOCTOR EVALUATIONS FUNCTIONS =====

function insertEvaluation(evaluation) {
  return new Promise((resolve, reject) => {
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
      evaluation.comments || ""
    ];
    db.run(sql, params, function (err) {
      if (err) {
        console.error("Error inserting evaluation:", err);
        reject(err);
      } else {
        resolve({ id: this.lastID, ...evaluation });
      }
    });
  });
}

function getAllEvaluations(page = 1, limit = 50) {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    const sql = "SELECT * FROM doctor_evaluations ORDER BY createdAt DESC LIMIT ? OFFSET ?";
    db.all(sql, [limit, offset], (err, rows) => {
      if (err) {
        console.error("Error fetching evaluations:", err);
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}

function getEvaluationsByDoctor(docKey, page = 1, limit = 50) {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    const sql = "SELECT * FROM doctor_evaluations WHERE docKey = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?";
    db.all(sql, [docKey, limit, offset], (err, rows) => {
      if (err) {
        console.error("Error fetching evaluations for doctor:", err);
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}

function getEvaluationById(id) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM doctor_evaluations WHERE id = ?";
    db.get(sql, [id], (err, row) => {
      if (err) {
        console.error("Error fetching evaluation:", err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function deleteEvaluation(id) {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM doctor_evaluations WHERE id = ?";
    db.run(sql, [id], function (err) {
      if (err) {
        console.error("Error deleting evaluation:", err);
        reject(err);
      } else {
        resolve({ success: true, changes: this.changes });
      }
    });
  });
}

function getEvaluationStats() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        COUNT(*) as totalEvaluations,
        AVG(CASE WHEN overallSatisfaction = 'excellent' THEN 3 
                 WHEN overallSatisfaction = 'average' THEN 2 
                 ELSE 1 END) as averageSatisfaction
      FROM doctor_evaluations
    `;
    db.get(sql, (err, row) => {
      if (err) {
        console.error("Error fetching evaluation stats:", err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
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
