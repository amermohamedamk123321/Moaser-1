import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getBeforeAfterImages, DEFAULT_IMAGES, BeforeAfterImage } from "@/lib/beforeAfterStore";
import { AnimatedSection } from "./AnimatedSection";

export default function BeforeAfterSection() {
  const { t, i18n } = useTranslation();
  const [images, setImages] = useState<BeforeAfterImage[]>(DEFAULT_IMAGES);
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const loaded = getBeforeAfterImages();
    if (loaded.length > 0) setImages(loaded);
  }, []);

  const handleMove = (clientX: number, rect: DOMRect) => {
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition(x / rect.width * 100);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleMove(e.clientX, e.currentTarget.getBoundingClientRect());
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX, e.currentTarget.getBoundingClientRect());
  };

  if (images.length === 0) return null;

  const current = images[activeIndex];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-12">
          <div />
        </AnimatedSection>

        <AnimatedSection>
          <div className="max-w-3xl mx-auto">
            {/* Slider */}
            <div
              className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-col-resize select-none border border-border shadow-card"
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onMouseMove={handleMouseMove}
              onTouchStart={() => setIsDragging(true)}
              onTouchEnd={() => setIsDragging(false)}
              onTouchMove={handleTouchMove}>
              
              {/* After (full width behind) */}
              <img
                src={current.afterImage}
                alt="After treatment"
                className="absolute inset-0 w-full h-full object-cover" />
              
              {/* Before (clipped) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}>
                
                <img
                  src={current.beforeImage}
                  alt="Before treatment"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ width: `${100 / sliderPosition * 100}%`, maxWidth: "none" }} />
                
              </div>
              {/* Slider line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-primary-foreground shadow-lg z-10"
                style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}>
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-glow">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-primary-foreground">
                    <path d="M6 10L2 10M2 10L5 7M2 10L5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 10L18 10M18 10L15 7M18 10L15 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              {/* Labels */}
              <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm text-foreground text-xs font-semibold px-3 py-1 rounded-full z-20">
                {t("home.before")}
              </div>
              <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full z-20">
                {t("home.after")}
              </div>
            </div>


            {/* Thumbnails */}
            {images.length > 1 &&
            <div className="flex justify-center gap-3 mt-6">
                {images.map((img, i) =>
              <button
                key={img.id}
                onClick={() => {setActiveIndex(i);setSliderPosition(50);}}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === activeIndex ? "border-primary scale-110 shadow-glow" : "border-border opacity-60 hover:opacity-100"}`
                }>
                
                    <img src={img.afterImage} alt="" className="w-full h-full object-cover" />
                  </button>
              )}
              </div>
            }
          </div>
        </AnimatedSection>
      </div>
    </section>);

}