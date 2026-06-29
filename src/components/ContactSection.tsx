import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Facebook, Instagram } from "lucide-react";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";

export default function ContactSection() {
  const { t } = useTranslation();

  return (
    <section id="contact" className="relative py-24 lg:py-32">
      <AnimatedSection className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <AnimatedItem>
            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl mb-6">
              {t("contact.title")}
            </h2>
          </AnimatedItem>
        </div>

        <div className="mx-auto max-w-3xl">
          <AnimatedItem variant="fadeUp">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-card mb-10">
              <h3 className="mb-6 font-heading text-xl font-bold text-foreground">{t("contact.infoTitle")}</h3>
              <div className="space-y-5">
                <a href="tel:0780103030" className="flex items-center gap-4 group">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-secondary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("contact.phoneLabel")}</p>
                    <p className="font-semibold text-foreground" dir="ltr">0780 10 30 30</p>
                  </div>
                </a>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-secondary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("contact.addressLabel")}</p>
                    <p className="font-medium text-foreground">{t("contact.address")}</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-secondary transition-colors hover:bg-primary hover:text-primary-foreground">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-secondary transition-colors hover:bg-primary hover:text-primary-foreground">
                    <Instagram className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </AnimatedItem>

          <AnimatedItem variant="fadeUp">
            <div className="rounded-2xl border border-border bg-primary p-8 text-primary-foreground shadow-primary-lg">
              <h3 className="mb-3 font-heading text-xl font-bold">{t("contact.emergencyTitle")}</h3>
              <p className="text-primary-foreground/80 leading-relaxed">{t("contact.emergencyText")}</p>
              <a href="tel:0780103030">
                <Button variant="hero" size="lg" className="mt-5">
                  <Phone className="h-4 w-4" />
                  {t("contact.callNow")}
                </Button>
              </a>
            </div>
          </AnimatedItem>
        </div>
      </AnimatedSection>
    </section>
  );
}
