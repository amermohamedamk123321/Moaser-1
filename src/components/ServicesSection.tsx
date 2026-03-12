import { useTranslation } from "react-i18next";
import { Scissors, Scan, Heart, Sparkles, SmilePlus, ShieldCheck, Zap, Syringe } from "lucide-react";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";
import digitalImg from "@/assets/digital-dentistry.jpg";
import surgeryImg from "@/assets/surgery-room.jpg";

const icons = [Scissors, Syringe, Scan, Heart, Sparkles, SmilePlus, ShieldCheck, Zap];

export default function ServicesSection() {
  const { t } = useTranslation();

  const services = Array.from({ length: 8 }, (_, i) => ({
    icon: icons[i],
    title: t(`services.s${i + 1}Title`),
    desc: t(`services.s${i + 1}Desc`),
  }));

  return (
    <section id="services" className="relative py-24 lg:py-32 bg-muted/50">
      <AnimatedSection className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <AnimatedItem>
            <span className="inline-block text-sm font-semibold uppercase tracking-widest text-secondary mb-4">
              {t("services.tag")}
            </span>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl mb-6">
              {t("services.title")}
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="text-muted-foreground">
              {t("services.subtitle")}
            </p>
          </AnimatedItem>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <AnimatedItem key={i} variant="scaleUp">
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-glow h-full">
                <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-[4rem] bg-accent/50 transition-all duration-500 group-hover:h-32 group-hover:w-32" />
                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-secondary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-heading text-base font-semibold text-foreground">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </AnimatedItem>
          ))}
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <AnimatedItem variant="fadeLeft">
            <div className="group relative overflow-hidden rounded-2xl shadow-card">
              <img src={digitalImg} alt={t("services.imgDigitalTitle")} className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 flex items-end" style={{ background: "linear-gradient(to top, hsl(202 83% 16% / 0.8), transparent)" }}>
                <div className="p-6">
                  <h3 className="font-heading text-xl font-bold text-primary-foreground">{t("services.imgDigitalTitle")}</h3>
                  <p className="text-sm text-primary-foreground/70">{t("services.imgDigitalDesc")}</p>
                </div>
              </div>
            </div>
          </AnimatedItem>
          <AnimatedItem variant="fadeRight">
            <div className="group relative overflow-hidden rounded-2xl shadow-card">
              <img src={surgeryImg} alt={t("services.imgSurgeryTitle")} className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 flex items-end" style={{ background: "linear-gradient(to top, hsl(202 83% 16% / 0.8), transparent)" }}>
                <div className="p-6">
                  <h3 className="font-heading text-xl font-bold text-primary-foreground">{t("services.imgSurgeryTitle")}</h3>
                  <p className="text-sm text-primary-foreground/70">{t("services.imgSurgeryDesc")}</p>
                </div>
              </div>
            </div>
          </AnimatedItem>
        </div>
      </AnimatedSection>
    </section>
  );
}
