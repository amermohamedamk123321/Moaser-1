import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import {
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
} from "./database.js";
import { hashPassword, verifyPassword } from "./utils/passwordHash.js";
import { generateToken, verifyToken } from "./utils/jwtToken.js";
import { authMiddleware } from "./middleware/auth.js";
import {
  validateLoginData,
  validateChangePasswordData,
  validateAppointmentData,
  validateEvaluationData
} from "./middleware/validation.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { loginLimiter, apiLimiter, publicLimiter } from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Initialize database
initializeDatabase();

// ===== HEALTH CHECK =====
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ===== ADMIN AUTHENTICATION ROUTES =====

// POST /api/admin/login - Admin login
app.post("/api/admin/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    const validation = validateLoginData({ username, password });
    if (!validation.isValid) {
      return res.status(400).json({ error: "Invalid credentials", errors: validation.errors });
    }

    // Get admin user
    const admin = await getAdminUserByUsername(username);
    if (!admin) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Verify password
    const passwordMatch = await verifyPassword(password, admin.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Generate JWT token
    const token = generateToken(admin.id, admin.username);

    res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/logout - Admin logout (token invalidation handled on frontend)
app.post("/api/admin/logout", authMiddleware, (req, res) => {
  try {
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/change-password - Change admin password
app.post("/api/admin/change-password", authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Validate input
    const validation = validateChangePasswordData({ oldPassword, newPassword });
    if (!validation.isValid) {
      return res.status(400).json({ error: "Invalid input", errors: validation.errors });
    }

    // Get admin user
    const admin = await getAdminUserByUsername(req.user.username);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Verify old password
    const passwordMatch = await verifyPassword(oldPassword, admin.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Old password is incorrect" });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await updateAdminPassword(admin.id, newPasswordHash);

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===== APPOINTMENTS ROUTES =====

// GET /api/appointments - Get all appointments (admin only)
app.get("/api/appointments", authMiddleware, apiLimiter, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || null;

    const appointments = await getAllAppointments(page, limit, status);
    res.json({ success: true, appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/appointments/:id - Get single appointment (admin only)
app.get("/api/appointments/:id", authMiddleware, async (req, res) => {
  try {
    const appointment = await getAppointmentById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json({ success: true, appointment });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/appointments/:id - Update appointment (admin only)
app.patch("/api/appointments/:id", authMiddleware, apiLimiter, async (req, res) => {
  try {
    const { status, notes, date, time } = req.body;
    
    // Validate only the fields being updated
    const updates = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (date) updates.date = date;
    if (time) updates.time = time;

    const result = await updateAppointment(req.params.id, updates);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({ success: true, message: "Appointment updated successfully" });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/appointments/:id - Delete appointment (admin only)
app.delete("/api/appointments/:id", authMiddleware, apiLimiter, async (req, res) => {
  try {
    const result = await deleteAppointment(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json({ success: true, message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/appointments - Create new appointment (public)
app.post("/api/appointments", publicLimiter, async (req, res) => {
  try {
    const { name, phone, service, date, time, notes } = req.body;

    // Validate input
    const validation = validateAppointmentData({ name, phone, service, date, time, notes });
    if (!validation.isValid) {
      return res.status(400).json({ error: "Validation failed", errors: validation.errors });
    }

    const appointment = await createAppointment({ name, phone, service, date, time, notes });
    res.status(201).json({ success: true, appointment });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===== DOCTOR EVALUATIONS ROUTES =====

// POST /api/evaluations - Submit evaluation (public)
app.post("/api/evaluations", publicLimiter, async (req, res) => {
  try {
    const { docKey, behavior, competence, treatmentQuality, explanation, followUp, overallSatisfaction, comments } = req.body;

    // Validate input
    const validation = validateEvaluationData({ docKey, behavior, competence, treatmentQuality, explanation, followUp, overallSatisfaction, comments });
    if (!validation.isValid) {
      return res.status(400).json({ error: "Validation failed", errors: validation.errors });
    }

    const evaluation = await insertEvaluation({
      docKey,
      behavior,
      competence,
      treatmentQuality,
      explanation,
      followUp,
      overallSatisfaction,
      comments: comments || ""
    });

    res.status(201).json({ success: true, evaluation });
  } catch (error) {
    console.error("Error submitting evaluation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/evaluations - Get all evaluations (admin only)
app.get("/api/evaluations", authMiddleware, apiLimiter, async (req, res) => {
  try {
    const docKey = req.query.docKey || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    let evaluations;
    if (docKey) {
      evaluations = await getEvaluationsByDoctor(docKey, page, limit);
    } else {
      evaluations = await getAllEvaluations(page, limit);
    }

    res.json({ success: true, evaluations });
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/evaluations/:id - Get single evaluation (admin only)
app.get("/api/evaluations/:id", authMiddleware, async (req, res) => {
  try {
    const evaluation = await getEvaluationById(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ error: "Evaluation not found" });
    }
    res.json({ success: true, evaluation });
  } catch (error) {
    console.error("Error fetching evaluation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/evaluations/:id - Delete evaluation (admin only)
app.delete("/api/evaluations/:id", authMiddleware, apiLimiter, async (req, res) => {
  try {
    const result = await deleteEvaluation(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Evaluation not found" });
    }
    res.json({ success: true, message: "Evaluation deleted successfully" });
  } catch (error) {
    console.error("Error deleting evaluation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===== DASHBOARD STATS ROUTE =====

// GET /api/stats - Get dashboard statistics (admin only)
app.get("/api/stats", authMiddleware, apiLimiter, async (req, res) => {
  try {
    const appointmentStats = await getAppointmentStats();
    const evaluationStats = await getEvaluationStats();

    res.json({
      success: true,
      stats: {
        appointments: appointmentStats,
        evaluations: evaluationStats
      }
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===== ERROR HANDLING =====
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
