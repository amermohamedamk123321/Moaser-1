import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, Send, ArrowLeft } from "lucide-react";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type Rating = "poor" | "average" | "excellent" | "";
type Step = 1 | 2 | 3;

const doctorKeys = [
  { key: "doc1", initials: "RS" },
  { key: "doc2", initials: "QT" },
  { key: "doc3", initials: "SA" },
  { key: "doc4", initials: "ASA" },
  { key: "doc5", initials: "KF" },
  { key: "doc6", initials: "MAS" },
  { key: "doc7", initials: "ZB" },
  { key: "doc8", initials: "RA" },
];

interface FeedbackData {
  docKey: string;
  doctorFeedback: string;
  q1: Rating;
  q2: Rating;
  q3: Rating;
  q4: Rating;
  q5: Rating;
}

const ratingMap: Record<Rating, string> = {
  "poor": "poor",
  "average": "average",
  "excellent": "excellent",
  "": "",
};

export default function PatientFeedbackSurveyForm() {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData>({
    docKey: "",
    doctorFeedback: "",
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
  });

  const setField = (key: keyof FeedbackData, value: string) => {
    setFeedback((prev) => ({ ...prev, [key]: value }));
  };

  const ratingOptions: { value: Rating; labelKey: string }[] = [
    { value: "poor", labelKey: "patientFeedbackSurvey.poor" },
    { value: "average", labelKey: "patientFeedbackSurvey.average" },
    { value: "excellent", labelKey: "patientFeedbackSurvey.excellent" },
  ];

  const questions = [
    { key: "q1", labelKey: "patientFeedbackSurvey.q1" },
    { key: "q2", labelKey: "patientFeedbackSurvey.q2" },
    { key: "q3", labelKey: "patientFeedbackSurvey.q3" },
    { key: "q4", labelKey: "patientFeedbackSurvey.q4" },
    { key: "q5", labelKey: "patientFeedbackSurvey.q5" },
  ];

  const handleNextStep = () => {
    if (step === 1) {
      if (!feedback.docKey) {
        toast.error(t("patientFeedbackSurvey.selectDoctorError"));
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const allRated = questions.every((q) => feedback[q.key as keyof FeedbackData] !== "");
      if (!allRated) {
        toast.error("Please rate all questions");
        return;
      }
      setStep(3);
    }
  };

  const handleBackStep = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        docKey: feedback.docKey,
        doctorFeedback: feedback.doctorFeedback || null,
        q1: feedback.q1,
        q2: feedback.q2,
        q3: feedback.q3,
        q4: feedback.q4,
        q5: feedback.q5,
      };

      const response = await fetch(`${API_URL}/api/patient-feedback-surveys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit feedback");
      }

      setSubmitted(true);
      toast.success(t("patientFeedbackSurvey.toastTitle"), {
        description: t("patientFeedbackSurvey.toastDesc"),
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit feedback"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnother = () => {
    setSubmitted(false);
    setStep(1);
    setFeedback({
      docKey: "",
      doctorFeedback: "",
      q1: "",
      q2: "",
      q3: "",
      q4: "",
      q5: "",
    });
  };

  const getDoctorName = (docKey: string) => {
    return t(`doctors.${docKey}Name`) || docKey;
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
                  {t("patientFeedbackSurvey.thankYou")}
                </h2>
                <p className="text-muted-foreground">
                  {t("patientFeedbackSurvey.thankYouDesc")}
                </p>
              </div>
            </AnimatedItem>
            <AnimatedItem>
              <Button
                onClick={handleSubmitAnother}
                className="mt-6"
              >
                {t("patientFeedbackSurvey.submitAnother")}
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
                {t("patientFeedbackSurvey.title")}
              </h1>
            </AnimatedItem>
            <AnimatedItem>
              <p className="text-muted-foreground">
                {t("patientFeedbackSurvey.subtitle")}
              </p>
            </AnimatedItem>
            <AnimatedItem className="mt-4">
              <div className="flex justify-center gap-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-2 rounded-full transition-all ${
                      s <= step ? "w-8 bg-primary" : "w-2 bg-muted"
                    }`}
                  />
                ))}
              </div>
            </AnimatedItem>
          </div>

          <AnimatedItem variant="fadeUp" delay={0.2}>
            {/* Step 1: Doctor Selection */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    {t("patientFeedbackSurvey.selectDoctor")}
                  </label>
                  <select
                    value={feedback.docKey}
                    onChange={(e) => setField("docKey", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">
                      {t("patientFeedbackSurvey.selectDoctorPlaceholder")}
                    </option>
                    {doctorKeys.map((doc) => (
                      <option key={doc.key} value={doc.key}>
                        {getDoctorName(doc.key)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    {t("patientFeedbackSurvey.doctorFeedback")}
                  </label>
                  <textarea
                    value={feedback.doctorFeedback}
                    onChange={(e) => setField("doctorFeedback", e.target.value)}
                    rows={4}
                    maxLength={2000}
                    placeholder={t("patientFeedbackSurvey.doctorFeedbackPlaceholder")}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {feedback.doctorFeedback.length}/2000
                  </p>
                </div>

                <Button onClick={handleNextStep} size="lg" className="w-full">
                  {t("patientFeedbackSurvey.nextBtn")}
                </Button>
              </div>
            )}

            {/* Step 2: Rating Questions */}
            {step === 2 && (
              <div className="space-y-6">
                {questions.map((q) => (
                  <div key={q.key}>
                    <p className="mb-3 text-sm font-medium text-foreground">
                      {t(q.labelKey)}
                    </p>
                    <div className="flex gap-2">
                      {ratingOptions.map((opt) => (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => setField(q.key as keyof FeedbackData, opt.value)}
                          className={`flex-1 rounded-lg border px-3 py-3 text-xs font-medium transition-all ${
                            feedback[q.key as keyof FeedbackData] === opt.value
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

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackStep}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t("patientFeedbackSurvey.backBtn")}
                  </Button>
                  <Button onClick={handleNextStep} className="flex-1">
                    {t("patientFeedbackSurvey.nextBtn")}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="rounded-lg border border-border bg-muted/30 p-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase font-semibold text-muted-foreground">
                        {t("patientFeedbackSurvey.selectDoctor")}
                      </p>
                      <p className="text-lg font-medium text-foreground mt-1">
                        {getDoctorName(feedback.docKey)}
                      </p>
                    </div>

                    {feedback.doctorFeedback && (
                      <div>
                        <p className="text-xs uppercase font-semibold text-muted-foreground">
                          {t("patientFeedbackSurvey.doctorFeedback")}
                        </p>
                        <p className="text-sm text-foreground mt-1">
                          {feedback.doctorFeedback}
                        </p>
                      </div>
                    )}

                    <div className="border-t border-border pt-4">
                      <p className="text-xs uppercase font-semibold text-muted-foreground mb-3">
                        {t("patientFeedbackSurvey.step2Title")}
                      </p>
                      <div className="space-y-2">
                        {questions.map((q) => (
                          <div key={q.key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {q.key.toUpperCase()}
                            </span>
                            <span className="font-medium text-foreground">
                              {t(
                                `patientFeedbackSurvey.${feedback[q.key as keyof FeedbackData]}`
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackStep}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t("patientFeedbackSurvey.backBtn")}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="flex-1"
                    disabled={loading}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? "Submitting..." : t("patientFeedbackSurvey.submitBtn")}
                  </Button>
                </div>
              </div>
            )}
          </AnimatedItem>
        </div>
      </AnimatedSection>
    </section>
  );
}
