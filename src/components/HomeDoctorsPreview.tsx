import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";
import DoctorCard from "@/components/DoctorCard";

const topDoctors = [
  { key: "doc1", initials: "RS" },
  { key: "doc3", initials: "SA" },
  { key: "doc7", initials: "RA" },
];

export default function HomeDoctorsPreview() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="relative py-24 lg:py-32 bg-muted/30">
      <AnimatedSection className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-20">
          <AnimatedItem>
            <span className="inline-block text-sm font-semibold uppercase tracking-widest text-secondary mb-4">
              {t("home.doctorsTag")}
            </span>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl mb-4">
              {t("home.doctorsTitle")}
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="text-muted-foreground">{t("home.doctorsSubtitle")}</p>
          </AnimatedItem>
        </div>

        <div className="grid gap-y-16 gap-x-8 sm:grid-cols-3 max-w-5xl mx-auto justify-items-center">
          {topDoctors.map((doc, i) => (
            <AnimatedItem key={doc.key} variant="fadeUp" delay={i * 0.12}>
              <DoctorCard docKey={doc.key} initials={doc.initials} index={i} />
            </AnimatedItem>
          ))}
        </div>

        <AnimatedItem>
          <div className="mt-16 text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => { navigate("/doctors"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            >
              {t("home.viewDoctors")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
        </AnimatedItem>
      </AnimatedSection>
    </section>
  );
}
