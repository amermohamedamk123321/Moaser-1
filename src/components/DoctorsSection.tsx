import { useTranslation } from "react-i18next";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";
import DoctorCard from "@/components/DoctorCard";

const doctorKeys = [
  { key: "doc1", initials: "RS" },
  { key: "doc2", initials: "QT" },
  { key: "doc3", initials: "SA" },
  { key: "doc4", initials: "KF" },
  { key: "doc5", initials: "AS" },
  { key: "doc6", initials: "ZB" },
  { key: "doc7", initials: "RA" },
];

export default function DoctorsSection() {
  const { t } = useTranslation();

  return (
    <section id="doctors" className="relative py-24 lg:py-32">
      <AnimatedSection className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-20">
          <AnimatedItem>
            <span className="inline-block text-sm font-semibold uppercase tracking-widest text-secondary mb-4">
              {t("doctors.tag")}
            </span>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl mb-6">
              {t("doctors.title")}
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="text-muted-foreground">{t("doctors.subtitle")}</p>
          </AnimatedItem>
        </div>

        <div className="grid gap-y-16 gap-x-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto justify-items-center">
          {doctorKeys.slice(0, -1).map((doc, i) => (
            <AnimatedItem key={doc.key} variant="scaleUp" delay={i * 0.08}>
              <DoctorCard docKey={doc.key} initials={doc.initials} index={i} />
            </AnimatedItem>
          ))}
        </div>
        <div className="flex justify-center mt-16 max-w-5xl mx-auto">
          <AnimatedItem variant="scaleUp" delay={doctorKeys.length * 0.08}>
            <DoctorCard docKey={doctorKeys[doctorKeys.length - 1].key} initials={doctorKeys[doctorKeys.length - 1].initials} index={doctorKeys.length - 1} />
          </AnimatedItem>
        </div>
      </AnimatedSection>
    </section>
  );
}
