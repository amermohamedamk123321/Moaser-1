import { useTranslation } from "react-i18next";
import { Shield, Users, Award, Microscope } from "lucide-react";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";

export default function AboutSection() {
  const { t } = useTranslation();

  const features = [
    { icon: Users, title: t("about.feature1Title"), desc: t("about.feature1Desc") },
    { icon: Microscope, title: t("about.feature2Title"), desc: t("about.feature2Desc") },
    { icon: Shield, title: t("about.feature3Title"), desc: t("about.feature3Desc") },
    { icon: Award, title: t("about.feature4Title"), desc: t("about.feature4Desc") },
  ];

  return (
    <section id="about" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <AnimatedSection className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <AnimatedItem>
            <span className="inline-block text-sm font-semibold uppercase tracking-widest text-secondary mb-4">
              {t("about.tag")}
            </span>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl mb-6">
              {t("about.title")}
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p
              className="text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: t("about.description") }}
            />
          </AnimatedItem>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <AnimatedItem key={i} variant="scaleUp">
              <div className="group relative rounded-2xl border border-border bg-card p-8 shadow-card transition-all duration-500 hover:-translate-y-2 hover:shadow-glow h-full">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-secondary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </AnimatedItem>
          ))}
        </div>

        <AnimatedItem>
          <p className="mt-12 mx-auto max-w-2xl text-center text-sm text-muted-foreground italic">
            {t("about.quote")}
          </p>
        </AnimatedItem>
      </AnimatedSection>
    </section>
  );
}
