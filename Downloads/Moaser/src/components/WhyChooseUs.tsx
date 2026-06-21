import { useTranslation } from "react-i18next";
import { Users, Cpu, Globe, Building2 } from "lucide-react";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";
import { motion } from "framer-motion";

const reasons = [
  { icon: Users, key: "why1", accent: "bg-primary" },
  { icon: Cpu, key: "why2", accent: "bg-secondary" },
  { icon: Globe, key: "why3", accent: "bg-primary" },
  { icon: Building2, key: "why4", accent: "bg-secondary" },
];

export default function WhyChooseUs() {
  const { t } = useTranslation();

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <AnimatedSection className="container mx-auto px-4">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left: heading */}
          <div>
            <AnimatedItem variant="fadeLeft">
              <span className="inline-block text-sm font-semibold uppercase tracking-widest text-secondary mb-4">
                {t("home.whyTag")}
              </span>
            </AnimatedItem>
            <AnimatedItem variant="fadeLeft">
              <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl mb-6 leading-tight">
                {t("home.whyTitle")}
              </h2>
            </AnimatedItem>
            <AnimatedItem variant="fadeLeft">
              <p className="text-muted-foreground leading-relaxed max-w-lg">
                {t("about.quote")}
              </p>
            </AnimatedItem>
          </div>

          {/* Right: feature grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {reasons.map((r, i) => (
              <AnimatedItem key={i} variant="scaleUp" delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="relative rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow duration-300 hover:shadow-glow"
                >
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${r.accent} text-primary-foreground`}>
                    <r.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-heading text-base font-bold text-foreground">
                    {t(`home.${r.key}Title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(`home.${r.key}Desc`)}
                  </p>
                </motion.div>
              </AnimatedItem>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
