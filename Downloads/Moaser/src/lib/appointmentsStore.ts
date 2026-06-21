export type AppointmentStatus = "pending" | "confirmed" | "completed";

export interface Appointment {
  id: number;
  name: string;
  phone: string;
  service: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notes: string;
  status: AppointmentStatus;
  createdAt: string; // ISO timestamp
}

const STORAGE_KEY = "moaser_appointments";

/**
 * Get all appointments from localStorage
 */
export function getAppointments(): Appointment[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const appointments = JSON.parse(data) as Appointment[];
    // Sort by date ascending (upcoming appointments first)
    return appointments.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
  } catch (error) {
    console.error("Error reading appointments from localStorage:", error);
    return [];
  }
}

/**
 * Add a new appointment to localStorage
 */
export function addAppointment(
  name: string,
  phone: string,
  service: string,
  date: string,
  time: string,
  notes: string
): Appointment {
  const appointment: Appointment = {
    id: Date.now(),
    name,
    phone,
    service,
    date,
    time,
    notes,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const appointments = getAppointments();
  appointments.push(appointment);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));

  return appointment;
}

/**
 * Update appointment status
 */
export function updateAppointmentStatus(
  id: number,
  status: AppointmentStatus
): Appointment | null {
  const appointments = getAppointments();
  const appointment = appointments.find((a) => a.id === id);

  if (!appointment) return null;

  appointment.status = status;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));

  return appointment;
}

/**
 * Delete an appointment
 */
export function deleteAppointment(id: number): boolean {
  const appointments = getAppointments();
  const filtered = appointments.filter((a) => a.id !== id);

  if (filtered.length === appointments.length) return false; // Not found

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Get appointments filtered by doctor/service
 */
export function getAppointmentsByService(service: string): Appointment[] {
  return getAppointments().filter((a) => a.service === service);
}

/**
 * Get appointment statistics
 */
export function getAppointmentStats(): {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
} {
  const appointments = getAppointments();
  return {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  };
}
