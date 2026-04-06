import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, User, Phone, FileText, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Appointment {
  id: number;
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
  status: "pending" | "confirmed" | "completed";
  createdAt: string;
  updatedAt: string;
}

interface AppointmentStats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
}

const SERVICES = [
  "general-checkup",
  "cleaning",
  "root-canal",
  "crown",
  "implant",
  "whitening",
  "braces",
  "other",
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AppointmentsList() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
  });
  const [selectedService, setSelectedService] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("moaser_admin_token");

      if (!token) {
        setError("Not authenticated");
        return;
      }

      const response = await fetch(`${API_URL}/api/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const data = await response.json();
      setAppointments(data.appointments || []);

      // Calculate stats
      const totalAppointments = data.appointments?.length || 0;
      const pendingAppointments =
        data.appointments?.filter((a: Appointment) => a.status === "pending")
          .length || 0;
      const confirmedAppointments =
        data.appointments?.filter((a: Appointment) => a.status === "confirmed")
          .length || 0;
      const completedAppointments =
        data.appointments?.filter((a: Appointment) => a.status === "completed")
          .length || 0;

      setStats({
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load appointments"
      );
      console.error("Error loading appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    id: number,
    newStatus: string
  ) => {
    try {
      const token = localStorage.getItem("moaser_admin_token");

      const response = await fetch(`${API_URL}/api/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update appointment");
      }

      await loadAppointments();
      toast({
        title: "Success",
        description: `Appointment status changed to ${newStatus}.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this appointment?")) {
      return;
    }

    try {
      const token = localStorage.getItem("moaser_admin_token");

      const response = await fetch(`${API_URL}/api/appointments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete appointment");
      }

      await loadAppointments();
      toast({
        title: "Success",
        description: "Appointment deleted successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to delete appointment",
        variant: "destructive",
      });
    }
  };

  const filteredAppointments =
    selectedService === "all"
      ? appointments
      : appointments.filter((a) => a.service === selectedService);

  if (loading) {
    return <p className="text-center text-muted-foreground py-8">Loading appointments...</p>;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-destructive py-8">{error}</p>
          <Button onClick={loadAppointments} className="mx-auto block">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">
                {stats.totalAppointments}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Total Appointments
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {stats.pendingAppointments}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats.confirmedAppointments}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Confirmed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats.completedAppointments}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter by Service */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter by Service</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {SERVICES.map((service) => (
                <SelectItem key={service} value={service}>
                  {service}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">
                No appointments yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment, index) => (
            <Card key={appointment.id} className="overflow-hidden">
              <CardContent className="pt-6">
                {/* Appointment Number */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      Appointment #{index + 1}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Created:{" "}
                      {new Date(appointment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${STATUS_COLORS[appointment.status]} border`}
                  >
                    {STATUS_LABELS[appointment.status]}
                  </Badge>
                </div>

                {/* Appointment Details */}
                <div className="grid gap-4 sm:grid-cols-2 mb-4">
                  {/* Name */}
                  <div className="flex gap-3">
                    <User className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{appointment.name}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex gap-3">
                    <Phone className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{appointment.phone}</p>
                    </div>
                  </div>

                  {/* Service */}
                  <div className="flex gap-3">
                    <div className="w-5 h-5 text-secondary shrink-0 mt-0.5">
                      💉
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Service</p>
                      <p className="font-medium">{appointment.service}</p>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex gap-3">
                    <Calendar className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Appointment Date & Time
                      </p>
                      <p className="font-medium">
                        {new Date(appointment.date).toLocaleDateString()} at{" "}
                        {appointment.time}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {appointment.notes && (
                  <div className="flex gap-3 mb-4 p-3 bg-muted rounded-lg">
                    <FileText className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">
                        Notes
                      </p>
                      <p className="text-sm">{appointment.notes}</p>
                    </div>
                  </div>
                )}

                {/* Status Update */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <label className="text-sm font-medium">Update Status:</label>
                  <Select
                    value={appointment.status}
                    onValueChange={(value) =>
                      handleStatusChange(appointment.id, value)
                    }
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(appointment.id)}
                    className="ltr:ml-auto rtl:mr-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
