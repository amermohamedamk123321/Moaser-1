import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle, UserRound, Home, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";
import { useNavigate } from "react-router-dom";

type Rating = "poor" | "average" | "excellent" | "";

interface DoctorSurveyData {
  selectedDoctor: string;
  behavior: Rating;
  competence: Rating;
  treatmentQuality: Rating;
  explanation: Rating;
  followUp: Rating;
  overallSatisfaction: Rating;
  comments: string;
}

const doctorOptions = [
  "doc1", "doc2", "doc3", "doc4", "doc5", "doc6", "doc7",
];

const surveyKeys: { key: keyof Omit<DoctorSurveyData, "selectedDoctor" | "comments">; qKey: string }[] = [
  { key: "behavior", qKey: "dq1" },
  { key: "competence", qKey: "dq2" },
  { key: "treatmentQuality", qKey: "dq3" },
  { key: "explanation", qKey: "dq4" },
  { key: "followUp", qKey: "dq5" },
  { key: "overallSatisfaction", qKey: "dq6" },
];

export default function DoctorEvaluationForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [survey, setSurvey] = useState<DoctorSurveyData>({
    selectedDoctor: "",
    behavior: "",
    competence: "",
    treatmentQuality: "",
    explanation: "",
    followUp: "",
    overallSatisfaction: "",
    comments: "",
  });

  const setField = (key: keyof DoctorSurveyData, value: string) => {
    setSurvey((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey.selectedDoctor) {
      toast({ title: t("doctorEval.selectDoctorWarning"), variant: "destructive" });
      return;
    }

    try {
      // Try to submit to backend API (via proxy in dev, or direct URL in production)
      try {
        const response = await fetch("/api/evaluations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(survey),
        });

        if (response.ok) {
          console.log("Evaluation submitted to backend");
        }
      } catch (apiError) {
        console.warn("Backend API unavailable, storing locally:", apiError);
      }

      // Always save to localStorage as fallback
      const evaluations = JSON.parse(localStorage.getItem("moaser_evaluations") || "[]");
      evaluations.push({
        ...survey,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("moaser_evaluations", JSON.stringify(evaluations));

      setSubmitted(true);
      toast({ title: t("doctorEval.toastTitle"), description: t("doctorEval.toastDesc") });
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      toast({ title: "Error", description: "Failed to submit evaluation. Please try again.", variant: "destructive" });
    }
  };

  const handleSubmitAnother = () => {
    setSurvey({
      selectedDoctor: "",
      behavior: "",
      competence: "",
      treatmentQuality: "",
      explanation: "",
      followUp: "",
      overallSatisfaction: "",
      comments: "",
    });
    setSubmitted(false);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const ratingOptions: { value: Rating; labelKey: string }[] = [
    { value: "poor", labelKey: "contact.poor" },
    { value: "average", labelKey: "contact.average" },
    { value: "excellent", labelKey: "contact.excellent" },
  ];

  return (
    <section className="relative py-24 lg:py-32">
      <AnimatedSection className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <AnimatedItem>
            <span className="inline-block text-sm font-semibold uppercase tracking-widest text-secondary mb-4">
              {t("doctorEval.tag")}
            </span>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl mb-6">
              {t("doctorEval.title")}
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="text-muted-foreground">{t("doctorEval.subtitle")}</p>
          </AnimatedItem>
        </div>

        <div className="mx-auto max-w-2xl">
          <AnimatedItem variant="fadeUp">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="mb-4 h-16 w-16 text-secondary" />
                  <h4 className="font-heading text-2xl font-bold text-foreground mb-2">{t("doctorEval.thankYou")}</h4>
                  <p className="text-muted-foreground mb-8">{t("doctorEval.thankYouDesc")}</p>
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <Button
                      onClick={handleSubmitAnother}
                      variant="outline"
                      size="lg"
                      className="flex-1"
                    >
                      <RotateCcw className="h-4 w-4" />
                      {t("doctorEval.submitAnother")}
                    </Button>
                    <Button
                      onClick={handleGoHome}
                      size="lg"
                      className="flex-1"
                    >
                      <Home className="h-4 w-4" />
                      {t("doctorEval.backHome")}
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Doctor Selection */}
                  <div>
                    <p className="mb-3 text-sm font-medium text-foreground">{t("doctorEval.selectDoctor")}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {doctorOptions.map((docKey) => (
                        <button
                          type="button"
                          key={docKey}
                          onClick={() => setField("selectedDoctor", docKey)}
                          className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-all text-start ${
                            survey.selectedDoctor === docKey
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-foreground hover:bg-accent"
                          }`}
                        >
                          <UserRound className="h-4 w-4 shrink-0" />
                          <span className="truncate">{t(`doctors.${docKey}Name`)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating Questions */}
                  {surveyKeys.map((sq) => (
                    <div key={sq.key}>
                      <p className="mb-2 text-sm font-medium text-foreground">{t(`doctorEval.${sq.qKey}`)}</p>
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

                  {/* Comments */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">{t("doctorEval.commentsTitle")}</p>
                    <textarea
                      value={survey.comments}
                      onChange={(e) => setField("comments", e.target.value)}
                      rows={3}
                      maxLength={1000}
                      placeholder={t("doctorEval.commentsPlaceholder")}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    <Send className="h-4 w-4" />
                    {t("doctorEval.submit")}
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
