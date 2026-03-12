import { useTranslation } from "react-i18next";
import { Stethoscope } from "lucide-react";

import doc1Img from "@/assets/doctors/doc1.jpg";
import doc2Img from "@/assets/doctors/doc2.jpg";
import doc3Img from "@/assets/doctors/doc3.jpg";
import doc4Img from "@/assets/doctors/doc4.jpg";
import doc5Img from "@/assets/doctors/doc5.jpg";
import doc6Img from "@/assets/doctors/doc6.jpg";
import doc7Img from "@/assets/doctors/doc7.jpg";

const DOCTOR_IMAGES: Record<string, string> = {
  doc1: doc1Img,
  doc2: doc2Img,
  doc3: doc3Img,
  doc4: doc4Img,
  doc5: doc5Img,
  doc6: doc6Img,
  doc7: doc7Img,
};

interface DoctorCardProps {
  docKey: string;
  initials: string;
  index: number;
}

export default function DoctorCard({ docKey, initials, index }: DoctorCardProps) {
  const { t } = useTranslation();
  const imageUrl = DOCTOR_IMAGES[docKey];

  return (
    <div className="group flex flex-col items-center text-center">
      {/* Circular photo area with layered rings */}
      <div className="relative mb-8">
        {/* Outer decorative ring — sky blue glow */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-ring/20 to-secondary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
        <div className="absolute -inset-6 rounded-full border-[3px] border-dashed border-ring/50 opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-700 [animation-duration:10s]" />

        {/* Main avatar circle */}
        <div className="relative h-40 w-40 sm:h-44 sm:w-44 lg:h-48 lg:w-48 rounded-full p-1 bg-gradient-to-br from-primary via-secondary to-ring shadow-[0_8px_40px_-8px_hsl(var(--ring)/0.35)] group-hover:shadow-[0_12px_50px_-6px_hsl(var(--ring)/0.5)] transition-all duration-700 group-hover:scale-105">
          <div className="flex h-full w-full items-center justify-center rounded-full overflow-hidden bg-accent/60 backdrop-blur-sm">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={t(`doctors.${docKey}Name`)}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="font-heading text-5xl sm:text-6xl font-bold text-primary select-none">
                {initials}
              </span>
            )}
          </div>
        </div>

        {/* Floating specialty badge */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-card border border-border px-4 py-1.5 shadow-card transition-all duration-500 group-hover:shadow-[0_4px_20px_hsl(var(--ring)/0.25)] group-hover:-translate-y-1">
          <Stethoscope className="h-3.5 w-3.5 text-secondary" />
          <span className="text-xs font-semibold text-secondary whitespace-nowrap">
            {t(`doctors.${docKey}Title`)}
          </span>
        </div>
      </div>

      {/* Name */}
      <h3 className="font-heading text-xl font-bold text-foreground mb-1.5 transition-colors duration-300 group-hover:text-primary">
        {t(`doctors.${docKey}Name`)}
      </h3>

      {/* Credentials */}
      <p className="text-sm text-muted-foreground max-w-[220px]">
        {t(`doctors.${docKey}Cred`)}
      </p>

      {/* Hover underline accent */}
      <div className="mt-4 h-0.5 w-0 rounded-full bg-gradient-to-r from-primary to-ring transition-all duration-700 group-hover:w-16" />
    </div>
  );
}
