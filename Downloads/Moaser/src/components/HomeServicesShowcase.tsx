import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Scissors, Syringe, Scan, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";

const highlights = [
  { icon: Scissors, key: "s1", color: "from-primary/20 to-primary/5" },
  { icon: Syringe, key: "s2", color: "from-secondary/20 to-secondary/5" },
  { icon: Scan, key: "s3", color: "from-primary/15 to-accent/30" },
  { icon: Sparkles, key: "s5", color: "from-secondary/15 to-primary/5" },
];

export default function HomeServicesShowcase() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="relative py-24 lg:py-32 bg-muted/30">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <AnimatedSection className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <AnimatedItem>
            <span className="inline-block text-sm font-semibold uppercase tracking-widest text-secondary mb-4">
              {t("home.servicesTag")}
            </span>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl mb-4">
              {t("home.servicesTitle")}
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="text-muted-foreground">{t("home.servicesSubtitle")}</p>
          </AnimatedItem>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item, i) => (
            <AnimatedItem key={i} variant="fadeUp" delay={i * 0.1}>
              <div className="group relative h-full rounded-2xl border border-border bg-card p-8 shadow-card transition-all duration-500 hover:-translate-y-2 hover:shadow-glow overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                <div className="relative">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-secondary transition-all duration-500 group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-6 group-hover:scale-110">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-3 font-heading text-lg font-bold text-foreground">
                    {t(`services.${item.key}Title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(`services.${item.key}Desc`)}
                  </p>
                </div>
              </div>
            </AnimatedItem>
          ))}
        </div>

        <AnimatedItem>
          <div className="mt-12 text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => { navigate("/services"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            >
              {t("home.viewAll")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
        </AnimatedItem>
      </AnimatedSection>
    </section>
  );
}
