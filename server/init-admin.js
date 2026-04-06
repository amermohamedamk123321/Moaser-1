import dotenv from "dotenv";
import { initializeDatabase, getAdminUserByUsername, createAdminUser } from "./database.js";
import { hashPassword } from "./utils/passwordHash.js";

dotenv.config();

async function initializeAdmin() {
  try {
    // Initialize database
    initializeDatabase();

    // Wait for database to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));

    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin@123";
    const adminEmail = process.env.ADMIN_EMAIL || "admin@moaser-clinic.com";

    // Check if admin already exists
    const existingAdmin = await getAdminUserByUsername(adminUsername);
    
    if (existingAdmin) {
      console.log(`✓ Admin user '${adminUsername}' already exists`);
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(adminPassword);

    // Create admin user
    const admin = await createAdminUser(adminUsername, passwordHash, adminEmail);
    console.log(`✓ Admin user created successfully:`);
    console.log(`  Username: ${admin.username}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  NOTE: Change the password immediately in production!`);
  } catch (error) {
    console.error("Error initializing admin:", error);
    process.exit(1);
  }
}

initializeAdmin();
