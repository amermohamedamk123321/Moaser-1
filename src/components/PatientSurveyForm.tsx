import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PatientSurveyForm() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa";

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
    q5: 0,
  });

  const questions = [
    { key: "q1", label: t("patientSurvey.q1") },
    { key: "q2", label: t("patientSurvey.q2") },
    { key: "q3", label: t("patientSurvey.q3") },
    { key: "q4", label: t("patientSurvey.q4") },
    { key: "q5", label: t("patientSurvey.q5") },
  ];

  const handleRating = (questionKey: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [questionKey]: rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allRated = Object.values(ratings).every((r) => r > 0);
    if (!allRated) {
      toast.error("Please rate all questions");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/surveys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ratings)
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
    setRatings({
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
      q5: 0,
    });
  };

  if (submitted) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background py-12">
        <AnimatedSection className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <AnimatedItem>
              <div className="mb-8">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-6">
                  <Star className="h-10 w-10 text-primary fill-primary" />
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
              <span className="inline-block text-sm font-semibold uppercase tracking-widest text-secondary mb-4">
                {t("patientSurvey.tag")}
              </span>
            </AnimatedItem>
            <AnimatedItem>
              <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl mb-4">
                {t("patientSurvey.title")}
              </h1>
            </AnimatedItem>
            <AnimatedItem>
              <p className="text-muted-foreground">
                {t("patientSurvey.subtitle")}
              </p>
            </AnimatedItem>
          </div>

          <AnimatedItem variant="fadeUp" delay={0.2}>
            <form onSubmit={handleSubmit} className="space-y-8">
              {questions.map((q, idx) => (
                <div key={q.key} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                  <label className="block mb-4 font-semibold text-foreground text-lg">
                    {idx + 1}. {q.label}
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleRating(q.key, rating)}
                        className={`transition-all duration-300 ${
                          ratings[q.key] >= rating
                            ? "text-primary"
                            : "text-muted-foreground hover:text-secondary"
                        }`}
                      >
                        <Star
                          className="h-8 w-8 transition-all duration-300"
                          fill={ratings[q.key] >= rating ? "currentColor" : "none"}
                        />
                      </button>
                    ))}
                    <span className="ml-auto text-sm text-muted-foreground">
                      {ratings[q.key] > 0 ? `${ratings[q.key]}/5` : "Not rated"}
                    </span>
                  </div>
                </div>
              ))}

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : t("patientSurvey.submitBtn")}
                </Button>
              </div>
            </form>
          </AnimatedItem>
        </div>
      </AnimatedSection>
    </section>
  );
}
