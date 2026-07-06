import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, Send } from "lucide-react";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type Rating = "poor" | "average" | "excellent" | "";
type WaitRating = "very_long" | "long" | "appropriate" | "";

interface SurveyData {
  doctorBehavior: Rating;
  diagnosisQuality: Rating;
  assistantBehavior: Rating;
  staffBehavior: Rating;
  cleanliness: Rating;
  waitingTime: WaitRating;
  suggestions: string;
}

const surveyKeys: { key: keyof Omit<SurveyData, "waitingTime" | "suggestions">; qKey: string }[] = [
  { key: "doctorBehavior", qKey: "q1" },
  { key: "diagnosisQuality", qKey: "q2" },
  { key: "assistantBehavior", qKey: "q3" },
  { key: "staffBehavior", qKey: "q4" },
  { key: "cleanliness", qKey: "q5" },
];

const ratingMap: Record<Rating, number> = {
  "poor": 1,
  "average": 2,
  "excellent": 3,
  "": 0,
};

const waitingTimeMap: Record<WaitRating, number> = {
  "very_long": 1,
  "long": 2,
  "appropriate": 3,
  "": 0,
};

export default function PatientSurveyForm() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [survey, setSurvey] = useState<SurveyData>({
    doctorBehavior: "",
    diagnosisQuality: "",
    assistantBehavior: "",
    staffBehavior: "",
    cleanliness: "",
    waitingTime: "",
    suggestions: "",
  });

  const setField = (key: keyof SurveyData, value: string) => {
    setSurvey((prev) => ({ ...prev, [key]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allRated = surveyKeys.every((sq) => survey[sq.key] !== "");
    if (!allRated) {
      toast.error("Please rate all questions");
      return;
    }

    if (!survey.waitingTime) {
      toast.error("Please rate the waiting time");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        q1: ratingMap[survey.doctorBehavior],
        q2: ratingMap[survey.diagnosisQuality],
        q3: ratingMap[survey.assistantBehavior],
        q4: ratingMap[survey.staffBehavior],
        q5: ratingMap[survey.cleanliness],
        waitingTime: waitingTimeMap[survey.waitingTime],
        suggestions: survey.suggestions || null,
      };

      const response = await fetch(`${API_URL}/api/surveys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit survey");
      }

      setSubmitted(true);
      toast.success(t("patientSurvey.toastTitle"), {
        description: t("patientSurvey.toastDesc"),
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit survey"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnother = () => {
    setSubmitted(false);
    setSurvey({
      doctorBehavior: "",
      diagnosisQuality: "",
      assistantBehavior: "",
      staffBehavior: "",
      cleanliness: "",
      waitingTime: "",
      suggestions: "",
    });
  };

  if (submitted) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background py-12">
        <AnimatedSection className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <AnimatedItem>
              <div className="mb-8">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-accent mb-6">
                  <CheckCircle className="h-10 w-10 text-secondary" />
                </div>
                <h2 className="font-heading text-3xl font-bold text-foreground mb-3">
                  {t("patientSurvey.thankYou")}
                </h2>
                <p className="text-muted-foreground">
                  {t("patientSurvey.thankYouDesc")}
                </p>
              </div>
            </AnimatedItem>
            <AnimatedItem>
              <Button
                onClick={handleSubmitAnother}
                className="mt-6"
              >
                {t("patientSurvey.submitAnother")}
              </Button>
            </AnimatedItem>
          </div>
        </AnimatedSection>
      </section>
    );
  }

  return (
    <section className="relative py-24 lg:py-32 bg-gradient-to-br from-background via-muted/50 to-background">
      <AnimatedSection className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-12 text-center">
            <AnimatedItem>
              <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl mb-4">
                {t("patientSurvey.title")}
              </h1>
            </AnimatedItem>
            <AnimatedItem>
              <p className="text-muted-foreground whitespace-pre-line">
                {t("patientSurvey.subtitle")}
              </p>
            </AnimatedItem>
          </div>

          <AnimatedItem variant="fadeUp" delay={0.2}>
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

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                <Send className="h-4 w-4" />
                {loading ? "Submitting..." : t("contact.submit")}
              </Button>
            </form>
          </AnimatedItem>
        </div>
      </AnimatedSection>
    </section>
  );
}
