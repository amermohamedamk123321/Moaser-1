import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, ArrowRight } from "lucide-react";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";

export default function HomeCTA() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "var(--hero-gradient)" }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(204_37%_40%/0.3),transparent_60%)]" />
      <div className="absolute top-10 right-20 h-64 w-64 rounded-full bg-primary-foreground/5 blur-3xl" />
      <div className="absolute bottom-10 left-20 h-48 w-48 rounded-full bg-secondary/10 blur-3xl" />

      <AnimatedSection className="container relative mx-auto px-4 text-center">
        <AnimatedItem variant="scaleUp">
          <h2 className="font-heading text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl mb-6">
            {t("home.ctaTitle")}
          </h2>
        </AnimatedItem>
        <AnimatedItem>
          <p className="mx-auto mb-10 max-w-xl text-primary-foreground/70">
            {t("home.ctaSubtitle")}
          </p>
        </AnimatedItem>
        <AnimatedItem>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              variant="hero"
              size="xl"
              onClick={() => { navigate("/appointment"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            >
              {t("home.ctaBtn")}
              <ArrowRight className="h-5 w-5 rtl:rotate-180" />
            </Button>
            <a
              href="tel:0780103030"
              className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/20"
            >
              <Phone className="h-4 w-4" />
              {t("home.ctaPhone")}: <span dir="ltr">0780 103 030</span>
            </a>
          </div>
        </AnimatedItem>
      </AnimatedSection>
    </section>
  );
}
