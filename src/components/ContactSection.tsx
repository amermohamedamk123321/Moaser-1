import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Facebook, Instagram, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";

type Rating = "poor" | "average" | "excellent" | "";
type WaitRating = "very_long" | "long" | "appropriate" | "";

interface SurveyData {
  doctorBehavior: Rating;
  diagnosisQuality: Rating;
  assistantBehavior: Rating;
  staffBehavior: Rating;
  waitingTime: WaitRating;
  cleanliness: Rating;
  suggestions: string;
}

const surveyKeys: { key: keyof Omit<SurveyData, "waitingTime" | "suggestions">; qKey: string }[] = [
  { key: "doctorBehavior", qKey: "q1" },
  { key: "diagnosisQuality", qKey: "q2" },
  { key: "assistantBehavior", qKey: "q3" },
  { key: "staffBehavior", qKey: "q4" },
  { key: "cleanliness", qKey: "q5" },
];

export default function ContactSection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [survey, setSurvey] = useState<SurveyData>({
    doctorBehavior: "",
    diagnosisQuality: "",
    assistantBehavior: "",
    staffBehavior: "",
    waitingTime: "",
    cleanliness: "",
    suggestions: "",
  });

  const setField = (key: keyof SurveyData, value: string) => {
    setSurvey((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast({ title: t("contact.toastTitle"), description: t("contact.toastDesc") });
  };

  const ratingOptions: { value: Rating; labelKey: string }[] = [
    { value: "poor", labelKey: "contact.poor" },
    { value: "average", labelKey: "contact.average" },
    { value: "excellent", labelKey: "contact.excellent" },
  ];

  const waitOptions: { value: WaitRating; labelKey: string }[] = [
    { value: "very_long", labelKey: "contact.veryLong" },
    { value: "long", labelKey: "contact.long" },
    { value: "appropriate", labelKey: "contact.appropriate" },
  ];

  return (
    <section id="contact" className="relative py-24 lg:py-32">
      <AnimatedSection className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <AnimatedItem>
            <span className="inline-block text-sm font-semibold uppercase tracking-widest text-secondary mb-4">
              {t("contact.tag")}
            </span>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl mb-6">
              {t("contact.title")}
            </h2>
          </AnimatedItem>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <AnimatedItem variant="fadeLeft">
            <div className="space-y-8">
              <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
                <h3 className="mb-6 font-heading text-xl font-bold text-foreground">{t("contact.infoTitle")}</h3>
                <div className="space-y-5">
                  <a href="tel:0780103030" className="flex items-center gap-4 group">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-secondary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("contact.phoneLabel")}</p>
                      <p className="font-semibold text-foreground" dir="ltr">0780 103 030</p>
                    </div>
                  </a>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-secondary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("contact.addressLabel")}</p>
                      <p className="font-medium text-foreground">{t("contact.address")}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-secondary transition-colors hover:bg-primary hover:text-primary-foreground">
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-secondary transition-colors hover:bg-primary hover:text-primary-foreground">
                      <Instagram className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-primary p-8 text-primary-foreground shadow-primary-lg">
                <h3 className="mb-3 font-heading text-xl font-bold">{t("contact.emergencyTitle")}</h3>
                <p className="text-primary-foreground/80 leading-relaxed">{t("contact.emergencyText")}</p>
                <a href="tel:0780103030">
                  <Button variant="hero" size="lg" className="mt-5">
                    <Phone className="h-4 w-4" />
                    {t("contact.callNow")}
                  </Button>
                </a>
              </div>
            </div>
          </AnimatedItem>

          <AnimatedItem variant="fadeRight">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
              <h3 className="mb-2 font-heading text-xl font-bold text-foreground">{t("contact.surveyTitle")}</h3>
              <p className="mb-6 text-sm text-muted-foreground">{t("contact.surveySubtitle")}</p>

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="mb-4 h-16 w-16 text-secondary" />
                  <h4 className="font-heading text-2xl font-bold text-foreground mb-2">{t("contact.thankYou")}</h4>
                  <p className="text-muted-foreground">{t("contact.thankYouDesc")}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {surveyKeys.map((sq) => (
                    <div key={sq.key}>
                      <p className="mb-2 text-sm font-medium text-foreground">{t(`contact.${sq.qKey}`)}</p>
                      <div className="flex gap-2">
                        {ratingOptions.map((opt) => (
                          <button
                            type="button"
                            key={opt.value}
                            onClick={() => setField(sq.key, opt.value)}
                            className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                              survey[sq.key] === opt.value
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-foreground hover:bg-accent"
                            }`}
                          >
                            {t(opt.labelKey)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">{t("contact.qWait")}</p>
                    <div className="flex gap-2">
                      {waitOptions.map((opt) => (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => setField("waitingTime", opt.value)}
                          className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                            survey.waitingTime === opt.value
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-foreground hover:bg-accent"
                          }`}
                        >
                          {t(opt.labelKey)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">{t("contact.suggestionsTitle")}</p>
                    <textarea
                      value={survey.suggestions}
                      onChange={(e) => setField("suggestions", e.target.value)}
                      rows={3}
                      maxLength={1000}
                      placeholder={t("contact.suggestionsPlaceholder")}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    <Send className="h-4 w-4" />
                    {t("contact.submit")}
                  </Button>
                </form>
              )}
            </div>
          </AnimatedItem>
        </div>
      </AnimatedSection>
    </section>
  );
}
