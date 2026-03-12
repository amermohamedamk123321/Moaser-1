import { useTranslation } from "react-i18next";
import { Target, Eye, CheckCircle2, BookOpen, Lightbulb, CheckSquare } from "lucide-react";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";

const valueIcons = [CheckCircle2, BookOpen, Lightbulb, CheckSquare];

export default function VisionMissionSection() {
  const { t } = useTranslation();

  const values = valueIcons.map((icon, i) => ({
    icon,
    label: t(`vision.value${i + 1}`),
  }));

  return (
    <section id="vision" className="relative py-24 lg:py-32 bg-muted/50 overflow-hidden">
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />

      <AnimatedSection className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <AnimatedItem>
            <span className="inline-block text-sm font-semibold uppercase tracking-widest text-secondary mb-4">
              {t("vision.tag")}
            </span>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              {t("vision.title")}
            </h2>
          </AnimatedItem>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <AnimatedItem variant="fadeLeft">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-card transition-all duration-500 hover:shadow-glow hover:-translate-y-1 h-full">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Eye className="h-7 w-7" />
              </div>
              <h3 className="mb-4 font-heading text-2xl font-bold text-foreground">{t("vision.visionTitle")}</h3>
              <p className="text-muted-foreground leading-relaxed">{t("vision.visionText")}</p>
            </div>
          </AnimatedItem>

          <AnimatedItem variant="scaleUp">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-card transition-all duration-500 hover:shadow-glow hover:-translate-y-1 h-full">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <Target className="h-7 w-7" />
              </div>
              <h3 className="mb-4 font-heading text-2xl font-bold text-foreground">{t("vision.missionTitle")}</h3>
              <p className="text-muted-foreground leading-relaxed">{t("vision.missionText")}</p>
            </div>
          </AnimatedItem>

          <AnimatedItem variant="fadeRight">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-card transition-all duration-500 hover:shadow-glow hover:-translate-y-1 h-full">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="mb-4 font-heading text-2xl font-bold text-foreground">{t("vision.goalsTitle")}</h3>
              <p className="text-muted-foreground leading-relaxed">{t("vision.goalsText")}</p>
            </div>
          </AnimatedItem>
        </div>

        <AnimatedItem>
          <div className="mt-8 rounded-2xl border border-border bg-card p-8 shadow-card">
            <h3 className="mb-6 text-center font-heading text-2xl font-bold text-foreground">{t("vision.valuesTitle")}</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v, i) => (
                <div
                  key={i}
                  className="group flex flex-col items-start gap-3 rounded-xl bg-gradient-to-br from-accent/40 to-accent/20 border border-accent/30 p-4 transition-all duration-300 hover:from-accent/60 hover:to-accent/40 hover:border-accent/50 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                    <v.icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-foreground leading-relaxed">{v.label}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedItem>
      </AnimatedSection>
    </section>
  );
}
