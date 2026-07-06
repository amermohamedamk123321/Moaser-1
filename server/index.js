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
} from "./database.js";
import { hashPassword, verifyPassword } from "./utils/passwordHash.js";
import { generateToken, verifyToken } from "./utils/jwtToken.js";
import { authMiddleware } from "./middleware/auth.js";
import {
  validateLoginData,
  validateChangePasswordData,
  validateAppointmentData,
  validateEvaluationData,
  validateSurveyData,
  validateFeedbackSurveyData
} from "./middleware/validation.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { loginLimiter, apiLimiter, publicLimiter } from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    "https://moaserdentalhospital.com",
    "https://www.moaserdentalhospital.com",
    "http://localhost:5173"
  ],
  credentials: true,
}));
app.use(express.json());

// Initialize database (async)
let dbReady = false;
initializeDatabase().then(() => {
  dbReady = true;
  console.log("Database ready");
}).catch(err => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});

// Middleware to check database readiness
app.use((req, res, next) => {
  if (!dbReady && req.path !== '/health') {
    return res.status(503).json({ error: "Database initializing" });
  }
  next();
});

// ===== HEALTH CHECK =====
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// ===== DOCTOR ROUTES =====

// GET /api/doctors - Get all doctors (admin only)
app.get("/api/doctors", authMiddleware, apiLimiter, async (req, res) => {
  try {
    const doctors = await getAllDoctors();
    res.json({ success: true, doctors });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/doctors/:docKey - Get specific doctor (admin only)
app.get("/api/doctors/:docKey", authMiddleware, apiLimiter, async (req, res) => {
  try {
    const doctor = await getDoctorByKey(req.params.docKey);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    res.json({ success: true, doctor });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/doctors - Create new doctor (admin only)
app.post("/api/doctors", authMiddleware, apiLimiter, async (req, res) => {
  try {
    const { docKey, name, specialty } = req.body;

    if (!docKey || !name) {
      return res.status(400).json({ error: "docKey and name are required" });
    }

    const doctor = await createDoctor(docKey, name, specialty || null);
    res.status(201).json({ success: true, doctor });
  } catch (error) {
    console.error("Error creating doctor:", error);
    res.status(500).json({ error: "Internal server error" });
  }
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

// ===== PATIENT SURVEYS ROUTES =====

// POST /api/surveys - Submit survey (public)
app.post("/api/surveys", publicLimiter, async (req, res) => {
  try {
    const { q1, q2, q3, q4, q5, waitingTime, suggestions } = req.body;

    // Validate input
    const validation = validateSurveyData({ q1, q2, q3, q4, q5, waitingTime, suggestions });
    if (!validation.isValid) {
      return res.status(400).json({ error: "Validation failed", errors: validation.errors });
    }

    const survey = await insertSurvey(q1, q2, q3, q4, q5, waitingTime, suggestions);
    res.status(201).json({ success: true, survey });
  } catch (error) {
    console.error("Error submitting survey:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/surveys - Get all surveys (admin only)
app.get("/api/surveys", authMiddleware, apiLimiter, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const docKey = req.query.docKey || null;

    const surveys = await getAllSurveys(page, limit, docKey);
    const stats = await getSurveyStats(docKey);

    res.json({ success: true, surveys, stats });
  } catch (error) {
    console.error("Error fetching surveys:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/surveys/:id - Get single survey (admin only)
app.get("/api/surveys/:id", authMiddleware, async (req, res) => {
  try {
    const survey = await getSurveyById(req.params.id);
    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }
    res.json({ success: true, survey });
  } catch (error) {
    console.error("Error fetching survey:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/surveys/:id - Delete survey (admin only)
app.delete("/api/surveys/:id", authMiddleware, apiLimiter, async (req, res) => {
  try {
    const result = await deleteSurvey(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Survey not found" });
    }
    res.json({ success: true, message: "Survey deleted successfully" });
  } catch (error) {
    console.error("Error deleting survey:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/surveys/:docKey/messages - Get all messages for a doctor (admin only)
app.get("/api/surveys/:docKey/messages", authMiddleware, apiLimiter, async (req, res) => {
  try {
    const messages = await getSurveyMessagesByDoctor(req.params.docKey);
    res.json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching survey messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===== PATIENT FEEDBACK SURVEYS ROUTES =====

// POST /api/patient-feedback-surveys - Submit feedback survey (public)
app.post("/api/patient-feedback-surveys", publicLimiter, async (req, res) => {
  try {
    const { docKey, doctorFeedback, q1, q2, q3, q4, q5 } = req.body;

    // Validate input
    const validation = validateFeedbackSurveyData({ docKey, doctorFeedback, q1, q2, q3, q4, q5 });
    if (!validation.isValid) {
      return res.status(400).json({ error: "Validation failed", errors: validation.errors });
    }

    const feedback = await insertFeedbackSurvey({
      docKey,
      doctorFeedback: doctorFeedback || null,
      q1,
      q2,
      q3,
      q4,
      q5
    });

    res.status(201).json({ success: true, feedback });
  } catch (error) {
    console.error("Error submitting feedback survey:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/patient-feedback-surveys - Get all feedback surveys (admin only)
app.get("/api/patient-feedback-surveys", authMiddleware, apiLimiter, async (req, res) => {
  try {
    const docKey = req.query.docKey || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    let feedbackSurveys;
    if (docKey) {
      feedbackSurveys = await getFeedbackSurveysByDoctor(docKey, page, limit);
    } else {
      feedbackSurveys = await getAllFeedbackSurveys(page, limit);
    }

    const stats = await getFeedbackSurveyStats();

    res.json({ success: true, feedbackSurveys, stats });
  } catch (error) {
    console.error("Error fetching feedback surveys:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/patient-feedback-surveys/:id - Get single feedback survey (admin only)
app.get("/api/patient-feedback-surveys/:id", authMiddleware, async (req, res) => {
  try {
    const feedbackSurvey = await getFeedbackSurveyById(req.params.id);
    if (!feedbackSurvey) {
      return res.status(404).json({ error: "Feedback survey not found" });
    }
    res.json({ success: true, feedbackSurvey });
  } catch (error) {
    console.error("Error fetching feedback survey:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/patient-feedback-surveys/:id - Delete feedback survey (admin only)
app.delete("/api/patient-feedback-surveys/:id", authMiddleware, apiLimiter, async (req, res) => {
  try {
    const result = await deleteFeedbackSurvey(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Feedback survey not found" });
    }
    res.json({ success: true, message: "Feedback survey deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback survey:", error);
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
