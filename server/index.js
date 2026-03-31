import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase, insertEvaluation, getAllEvaluations, getEvaluationsByDoctor } from "./database.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:8080",
  credentials: true,
}));
app.use(express.json());

// Initialize database on startup
initializeDatabase();

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// POST /api/evaluations - Submit a new doctor evaluation
app.post("/api/evaluations", (req, res) => {
  try {
    const { selectedDoctor, behavior, competence, treatmentQuality, explanation, followUp, overallSatisfaction, comments } = req.body;

    // Validate docKey
    const validDocKeys = ["doc1", "doc2", "doc3", "doc4", "doc5", "doc6", "doc7"];
    if (!selectedDoctor || !validDocKeys.includes(selectedDoctor)) {
      return res.status(400).json({ error: "Invalid doctor selection" });
    }

    // Validate ratings
    const validRatings = ["poor", "average", "excellent"];
    const ratings = [behavior, competence, treatmentQuality, explanation, followUp, overallSatisfaction];
    if (!ratings.every(rating => validRatings.includes(rating))) {
      return res.status(400).json({ error: "Invalid rating values" });
    }

    // Insert into database
    insertEvaluation({
      docKey: selectedDoctor,
      behavior,
      competence,
      treatmentQuality,
      explanation,
      followUp,
      overallSatisfaction,
      comments: comments || "",
    });

    res.json({ success: true, message: "Evaluation submitted successfully" });
  } catch (error) {
    console.error("Error submitting evaluation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/evaluations - Fetch all evaluations (optionally filtered by doctor)
app.get("/api/evaluations", (req, res) => {
  try {
    // Check for admin authentication
    const adminSession = req.query.adminSession;
    if (adminSession !== process.env.ADMIN_SESSION_TOKEN) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const docKey = req.query.docKey;
    let evaluations;

    if (docKey) {
      evaluations = getEvaluationsByDoctor(docKey);
    } else {
      evaluations = getAllEvaluations();
    }

    res.json({ success: true, evaluations });
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
