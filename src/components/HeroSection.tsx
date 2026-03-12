import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import heroImage from "@/assets/hero-dental.jpg";

export default function HeroSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const goTo = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stats = [
    { num: t("hero.stat1Num"), label: t("hero.stat1Label") },
    { num: t("hero.stat2Num"), label: t("hero.stat2Label") },
    { num: t("hero.stat3Num"), label: t("hero.stat3Label") },
  ];

  return (
    <section id="home" className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImage} alt="Modern dental hospital interior" className="h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--hero-gradient)", opacity: 0.88 }} />
      </div>

      <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-secondary/20 blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 h-96 w-96 rounded-full bg-primary-foreground/5 blur-3xl animate-float" style={{ animationDelay: "3s" }} />

      <div className="container relative mx-auto flex min-h-screen flex-col items-center justify-center px-4 pt-24 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-5 py-2 text-sm text-primary-foreground animate-fade-in-up">
          <Star className="h-4 w-4 fill-current" />
          <span>{t("hero.badge")}</span>
        </div>

        <h1 className="mb-4 max-w-4xl font-heading text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          {t("hero.heading1")}
          <br />
          <span className="text-secondary-foreground/80">{t("hero.heading2")}</span>
        </h1>

        <p className="mb-10 max-w-xl text-primary-foreground/60 animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
          {t("hero.subtitle")}
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          <Button variant="hero" size="xl" onClick={() => goTo("/services")}>
            {t("hero.servicesBtn")}
            <ArrowRight className="h-5 w-5 rtl:rotate-180" />
          </Button>
          <Button variant="heroOutline" size="xl" onClick={() => goTo("/contact")}>
            {t("hero.contactBtn")}
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 sm:gap-16 animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-heading text-3xl font-bold text-primary-foreground sm:text-4xl">{stat.num}</p>
              <p className="mt-1 text-sm text-primary-foreground/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-pulse-soft">
        <div className="h-14 w-8 rounded-full border-2 border-primary-foreground/30 p-1">
          <div className="mx-auto h-3 w-1.5 rounded-full bg-primary-foreground/60 animate-float" />
        </div>
      </div>
    </section>
  );
}
