import { useTranslation } from "react-i18next";
import { Stethoscope } from "lucide-react";

const DOCTOR_IMAGES: Record<string, string> = {
  doc1: "https://cdn.builder.io/api/v1/image/assets%2F13a4766942d54028b94747b6985a55d1%2F253e1b88f8254cc0981933d5ef0cfd41?format=webp&width=800&height=1200",
  doc2: "https://cdn.builder.io/api/v1/image/assets%2F13a4766942d54028b94747b6985a55d1%2F85d0dea973c54a02b7f4ff5dbac2dc3b?format=webp&width=800&height=1200",
  doc3: "https://cdn.builder.io/api/v1/image/assets%2F13a4766942d54028b94747b6985a55d1%2Fb8206a1a6b0f43e9a860911f5b345e22?format=webp&width=800&height=1200",
  doc4: "https://cdn.builder.io/api/v1/image/assets%2F13a4766942d54028b94747b6985a55d1%2F95b1cba1cdbe4d2da9923f097f66808c?format=webp&width=800&height=1200",
  doc5: "https://cdn.builder.io/api/v1/image/assets%2F13a4766942d54028b94747b6985a55d1%2F73ab78914bf94396a1930fe1753d5eb8?format=webp&width=800&height=1200",
  doc6: "https://cdn.builder.io/api/v1/image/assets%2F13a4766942d54028b94747b6985a55d1%2Fdf9d695054ef47549acb665460642bef?format=webp&width=800&height=1200",
  doc7: "https://cdn.builder.io/api/v1/image/assets%2F13a4766942d54028b94747b6985a55d1%2Fa70a778c3ff449ea93b0d99e77e09e90?format=webp&width=800&height=1200",
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
      <div className="relative mb-10">
        {/* Outer decorative ring — sky blue glow */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-ring/20 to-secondary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
        <div className="absolute -inset-6 rounded-full border-[3px] border-dashed border-ring/50 opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-700 [animation-duration:10s]" />

        {/* Main avatar circle */}
        <div className="relative h-56 w-56 sm:h-64 sm:w-64 lg:h-72 lg:w-72 rounded-full p-1 bg-gradient-to-br from-primary via-secondary to-ring shadow-[0_8px_40px_-8px_hsl(var(--ring)/0.35)] group-hover:shadow-[0_12px_50px_-6px_hsl(var(--ring)/0.5)] transition-all duration-700 group-hover:scale-105">
          <div className="flex h-full w-full items-center justify-center rounded-full overflow-hidden bg-white backdrop-blur-sm">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={t(`doctors.${docKey}Name`)}
                className="h-full w-full object-contain bg-white"
                loading="lazy"
              />
            ) : (
              <span className="font-heading text-7xl sm:text-8xl font-bold text-primary select-none">
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
