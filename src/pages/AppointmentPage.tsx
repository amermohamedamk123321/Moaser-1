import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Phone, CheckCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

export default function AppointmentPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    service: "",
    notes: "",
  });

  const services = [
    { value: "maxillofacial", label: t("appointment.sMaxillofacial") },
    { value: "implants", label: t("appointment.sImplants") },
    { value: "digital", label: t("appointment.sDigital") },
    { value: "rootcanal", label: t("appointment.sRootCanal") },
    { value: "cosmetic", label: t("appointment.sCosmetic") },
    { value: "orthodontics", label: t("appointment.sOrthodontics") },
    { value: "prosthodontics", label: t("appointment.sProsthodontics") },
    { value: "whitening", label: t("appointment.sWhitening") },
    { value: "emergency", label: t("appointment.sEmergency") },
  ];

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "14:00", "14:30", "15:00",
    "15:30", "16:00", "16:30", "17:00",
  ];

  const setField = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast({
      title: t("appointment.toastTitle"),
      description: t("appointment.toastDesc"),
    });
  };

  // Get tomorrow's date as min for date picker
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "var(--hero-gradient)", opacity: 0.06 }} />

          <AnimatedSection className="container relative mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <AnimatedItem>
                <span className="inline-block text-sm font-semibold uppercase tracking-widest text-secondary mb-4">
                  {t("appointment.tag")}
                </span>
              </AnimatedItem>
              <AnimatedItem>
                <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl mb-4">
                  {t("appointment.title")}
                </h1>
              </AnimatedItem>
              <AnimatedItem>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  {t("appointment.subtitle")}
                </p>
              </AnimatedItem>
            </div>

            <AnimatedItem>
              <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 sm:p-10 shadow-card">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent">
                      <CheckCircle className="h-10 w-10 text-secondary" />
                    </div>
                    <h2 className="font-heading text-2xl font-bold text-foreground mb-3">
                      {t("appointment.successTitle")}
                    </h2>
                    <p className="text-muted-foreground mb-8 max-w-md">
                      {t("appointment.successDesc")}
                    </p>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => navigate("/")}>
                        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                        {t("appointment.backHome")}
                      </Button>
                      <Button onClick={() => setSubmitted(false)}>
                        {t("appointment.bookAnother")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2">
                          <User className="h-4 w-4 text-secondary" />
                          {t("appointment.nameLabel")}
                        </Label>
                        <Input
                          id="name"
                          required
                          value={form.name}
                          onChange={(e) => setField("name", e.target.value)}
                          placeholder={t("appointment.namePlaceholder")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-secondary" />
                          {t("appointment.phoneLabel")}
                        </Label>
                        <Input
                          id="phone"
                          required
                          type="tel"
                          dir="ltr"
                          value={form.phone}
                          onChange={(e) => setField("phone", e.target.value)}
                          placeholder="07XX XXX XXX"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        {t("appointment.serviceLabel")}
                      </Label>
                      <Select
                        value={form.service}
                        onValueChange={(v) => setField("service", v)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("appointment.servicePlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="date" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-secondary" />
                          {t("appointment.dateLabel")}
                        </Label>
                        <Input
                          id="date"
                          required
                          type="date"
                          dir="ltr"
                          min={minDate}
                          value={form.date}
                          onChange={(e) => setField("date", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-secondary" />
                          {t("appointment.timeLabel")}
                        </Label>
                        <Select
                          value={form.time}
                          onValueChange={(v) => setField("time", v)}
                          required
                        >
                          <SelectTrigger dir="ltr">
                            <SelectValue placeholder={t("appointment.timePlaceholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                {slot}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">{t("appointment.notesLabel")}</Label>
                      <Textarea
                        id="notes"
                        rows={3}
                        value={form.notes}
                        onChange={(e) => setField("notes", e.target.value)}
                        placeholder={t("appointment.notesPlaceholder")}
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full">
                      {t("appointment.submitBtn")}
                    </Button>
                  </form>
                )}
              </div>
            </AnimatedItem>
          </AnimatedSection>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
