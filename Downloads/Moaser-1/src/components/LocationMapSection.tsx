import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, WifiOff } from "lucide-react";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";

export default function LocationMapSection() {
  const { t } = useTranslation();
  const [mapError, setMapError] = useState(false);

  return (
    <section className="relative py-24 lg:py-32 bg-muted/30">
      <AnimatedSection className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <AnimatedItem>
            <span className="inline-block text-sm font-semibold uppercase tracking-widest text-secondary mb-4">
              {t("location.tag")}
            </span>
          </AnimatedItem>
          <AnimatedItem>
            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl mb-4">
              {t("location.title")}
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5 text-secondary shrink-0" />
              <p>{t("contact.address")}</p>
            </div>
          </AnimatedItem>
        </div>

        <AnimatedItem variant="scaleUp">
          <div className="rounded-2xl overflow-hidden border border-border shadow-card">
            {mapError ? (
              <div className="flex flex-col items-center justify-center h-[450px] bg-muted/50 text-muted-foreground gap-4">
                <WifiOff className="h-12 w-12 text-secondary/50" />
                <p className="font-heading text-lg font-semibold text-foreground">{t("location.offlineTitle", "Map unavailable offline")}</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-secondary" />
                  <p className="text-sm">{t("contact.address")}</p>
                </div>
              </div>
            ) : (
              <iframe
                title="Moaser Specialized Dental Hospital Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3289.5!2d69.1305!3d34.5155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDMwJzU1LjgiTiA2OcKwMDcnNDkuOCJF!5e0!3m2!1sen!2s!4v1700000000000"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
                onError={() => setMapError(true)}
                onLoad={(e) => {
                  // Check if iframe actually loaded content
                  try {
                    const iframe = e.target as HTMLIFrameElement;
                    if (!iframe.contentWindow) setMapError(true);
                  } catch {
                    // Cross-origin check fails = loaded fine
                  }
                }}
              />
            )}
          </div>
        </AnimatedItem>
      </AnimatedSection>
    </section>
  );
}
