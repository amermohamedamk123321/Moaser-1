// localStorage-based store for before/after images and admin credentials

import demoBefore1 from "@/assets/demo-before-1.jpg";
import demoAfter1 from "@/assets/demo-after-1.jpg";
import demoBefore2 from "@/assets/demo-before-2.jpg";
import demoAfter2 from "@/assets/demo-after-2.jpg";

export interface BeforeAfterImage {
  id: string;
  title: string;
  titleFa: string;
  beforeImage: string;
  afterImage: string;
  category: string;
  createdAt: string;
}

const STORAGE_KEY = "moaser_before_after";
const ADMIN_KEY = "moaser_admin_creds";
const LOGIN_ATTEMPTS_KEY = "moaser_login_attempts";

// Default demo images - always available as fallback (using bundled imports)
export const DEFAULT_IMAGES: BeforeAfterImage[] = [
  {
    id: "demo-1",
    title: "Dental Implant Transformation",
    titleFa: "تحول ایمپلنت دندان",
    beforeImage: demoBefore1,
    afterImage: demoAfter1,
    category: "implant",
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "demo-2",
    title: "Smile Design Makeover",
    titleFa: "بازسازی طراحی لبخند",
    beforeImage: demoBefore2,
    afterImage: demoAfter2,
    category: "cosmetic",
    createdAt: "2025-01-01T00:00:00.000Z",
  },
];

// --- Before/After CRUD ---
export function getBeforeAfterImages(): BeforeAfterImage[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed: BeforeAfterImage[] = JSON.parse(stored);
      // Return stored data only if it has valid entries with real images
      if (
        parsed.length > 0 &&
        parsed.every((img) => img.beforeImage && img.afterImage && img.beforeImage !== "/placeholder.svg")
      ) {
        return parsed;
      }
    } catch {
      // corrupted data, fall through to defaults
    }
  }
  // Always reset to defaults if stored data is empty, invalid, or has placeholders
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_IMAGES));
  return DEFAULT_IMAGES;
}

// Force reset to default demo images (useful for debugging)
export function resetBeforeAfterToDefaults(): BeforeAfterImage[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_IMAGES));
  return DEFAULT_IMAGES;
}

export function addBeforeAfterImage(img: Omit<BeforeAfterImage, "id" | "createdAt">): BeforeAfterImage {
  const images = getBeforeAfterImages();
  const newImg: BeforeAfterImage = {
    ...img,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  images.push(newImg);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
  return newImg;
}

export function removeBeforeAfterImage(id: string): void {
  const images = getBeforeAfterImages().filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
}

// --- Admin credentials ---
interface AdminCreds {
  username: string;
  passwordHash: string;
}

// Simple hash for localStorage-only demo (NOT production-grade)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function initAdmin(): Promise<void> {
  const existing = localStorage.getItem(ADMIN_KEY);
  if (!existing) {
    const hash = await hashPassword("admin123");
    const creds: AdminCreds = { username: "admin", passwordHash: hash };
    localStorage.setItem(ADMIN_KEY, JSON.stringify(creds));
  }
}

export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  const stored = localStorage.getItem(ADMIN_KEY);
  if (!stored) {
    await initAdmin();
    return verifyAdmin(username, password);
  }
  const creds: AdminCreds = JSON.parse(stored);
  const hash = await hashPassword(password);
  return creds.username === username && creds.passwordHash === hash;
}

export async function updateAdminCredentials(newUsername: string, newPassword: string): Promise<void> {
  const hash = await hashPassword(newPassword);
  const creds: AdminCreds = { username: newUsername, passwordHash: hash };
  localStorage.setItem(ADMIN_KEY, JSON.stringify(creds));
}

export function getAdminUsername(): string {
  const stored = localStorage.getItem(ADMIN_KEY);
  if (!stored) return "admin";
  return JSON.parse(stored).username;
}

// --- Brute-force protection ---
interface LoginAttempts {
  count: number;
  lastAttempt: number;
  lockedUntil: number | null;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

export function getLoginAttempts(): LoginAttempts {
  const stored = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
  if (!stored) return { count: 0, lastAttempt: 0, lockedUntil: null };
  return JSON.parse(stored);
}

export function isLockedOut(): { locked: boolean; remainingSeconds: number } {
  const attempts = getLoginAttempts();
  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    return { locked: true, remainingSeconds: Math.ceil((attempts.lockedUntil - Date.now()) / 1000) };
  }
  if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify({ count: 0, lastAttempt: 0, lockedUntil: null }));
  }
  return { locked: false, remainingSeconds: 0 };
}

export function recordFailedAttempt(): void {
  const attempts = getLoginAttempts();
  const newCount = attempts.count + 1;
  const lockedUntil = newCount >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_DURATION : null;
  localStorage.setItem(
    LOGIN_ATTEMPTS_KEY,
    JSON.stringify({ count: newCount, lastAttempt: Date.now(), lockedUntil })
  );
}

export function resetLoginAttempts(): void {
  localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify({ count: 0, lastAttempt: 0, lockedUntil: null }));
}
