import dotenv from "dotenv";
import { initializeDatabase, createAppointment, insertEvaluation } from "./database.js";
import fs from "fs";
import path from "path";

dotenv.config();

/**
 * Migration script to import localStorage data to SQLite database
 * Usage: node server/migrate-data.js <path-to-json-file>
 * 
 * Expected JSON format:
 * {
 *   "appointments": [...],
 *   "evaluations": [...]
 * }
 */

async function migrateData() {
  try {
    // Initialize database
    initializeDatabase();

    // Wait for database to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get filepath from command line arguments
    const filePath = process.argv[2];

    if (!filePath) {
      console.log("Usage: node server/migrate-data.js <path-to-json-file>");
      console.log("Example: node server/migrate-data.js ./data-backup.json");
      process.exit(1);
    }

    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    // Read and parse JSON file
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    console.log("🔄 Starting data migration...\n");

    let appointmentCount = 0;
    let evaluationCount = 0;

    // Migrate appointments
    if (Array.isArray(jsonData.appointments) && jsonData.appointments.length > 0) {
      console.log(`📝 Migrating ${jsonData.appointments.length} appointments...`);
      for (const apt of jsonData.appointments) {
        try {
          await createAppointment({
            name: apt.name,
            phone: apt.phone,
            service: apt.service,
            date: apt.date,
            time: apt.time,
            notes: apt.notes || "",
          });
          appointmentCount++;
        } catch (error) {
          console.warn(`⚠️  Failed to migrate appointment: ${apt.name}`, error.message);
        }
      }
      console.log(`✅ Successfully migrated ${appointmentCount} appointments\n`);
    }

    // Migrate evaluations
    if (Array.isArray(jsonData.evaluations) && jsonData.evaluations.length > 0) {
      console.log(`📊 Migrating ${jsonData.evaluations.length} evaluations...`);
      for (const eval of jsonData.evaluations) {
        try {
          await insertEvaluation({
            docKey: eval.selectedDoctor || eval.docKey,
            behavior: eval.behavior,
            competence: eval.competence,
            treatmentQuality: eval.treatmentQuality,
            explanation: eval.explanation,
            followUp: eval.followUp,
            overallSatisfaction: eval.overallSatisfaction,
            comments: eval.comments || "",
          });
          evaluationCount++;
        } catch (error) {
          console.warn(`⚠️  Failed to migrate evaluation`, error.message);
        }
      }
      console.log(`✅ Successfully migrated ${evaluationCount} evaluations\n`);
    }

    console.log("✨ Migration complete!");
    console.log(`📊 Summary:`);
    console.log(`   - Appointments migrated: ${appointmentCount}`);
    console.log(`   - Evaluations migrated: ${evaluationCount}`);
    console.log(`\n✅ Data has been successfully migrated to the database.`);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

migrateData();
