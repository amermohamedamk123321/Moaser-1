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
import {
  getAppointments,
  updateAppointmentStatus,
  getAppointmentStats,
  Appointment,
  AppointmentStatus,
} from "@/lib/appointmentsStore";
import { Calendar, Clock, User, Phone, FileText, Trash2 } from "lucide-react";
import { deleteAppointment } from "@/lib/appointmentsStore";
import { toast } from "@/hooks/use-toast";

const SERVICES = [
  "maxillofacial",
  "implants",
  "digital",
  "rootcanal",
  "cosmetic",
  "orthodontics",
  "prosthodontics",
  "whitening",
  "emergency",
];

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  completed: "bg-green-100 text-green-800 border-green-300",
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
};

export default function AppointmentsList() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0 });
  const [selectedService, setSelectedService] = useState<string>("all");

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = () => {
    setAppointments(getAppointments());
    setStats(getAppointmentStats());
  };

  const handleStatusChange = (id: number, newStatus: AppointmentStatus) => {
    const updated = updateAppointmentStatus(id, newStatus);
    if (updated) {
      loadAppointments();
      toast({
        title: "Status Updated",
        description: `Appointment status changed to ${newStatus}.`,
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      deleteAppointment(id);
      loadAppointments();
      toast({
        title: "Deleted",
        description: "Appointment has been deleted.",
      });
    }
  };

  const filteredAppointments =
    selectedService === "all"
      ? appointments
      : appointments.filter((a) => a.service === selectedService);

  const getServiceLabel = (service: string): string => {
    const key = `appointment.s${service.charAt(0).toUpperCase() + service.slice(1)}`;
    return t(key) || service;
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground mt-1">Total Appointments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-sm text-muted-foreground mt-1">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.confirmed}</div>
              <p className="text-sm text-muted-foreground mt-1">Confirmed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
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
                  {getServiceLabel(service)}
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
              <p className="text-center text-muted-foreground py-8">No appointments yet.</p>
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
                      Created: {new Date(appointment.createdAt).toLocaleDateString()}
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
                    <div className="w-5 h-5 text-secondary shrink-0 mt-0.5">💉</div>
                    <div>
                      <p className="text-sm text-muted-foreground">Service</p>
                      <p className="font-medium">{getServiceLabel(appointment.service)}</p>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex gap-3">
                    <Calendar className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Appointment Date & Time</p>
                      <p className="font-medium">
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {appointment.notes && (
                  <div className="flex gap-3 mb-4 p-3 bg-muted rounded-lg">
                    <FileText className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Notes</p>
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
                      handleStatusChange(appointment.id, value as AppointmentStatus)
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
