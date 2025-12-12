import { useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CardCarouselProps {
  children: ReactNode[];
  className?: string;
}

export function CardCarousel({ children, className }: CardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalCards = children.length;

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalCards);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
  };

  if (totalCards === 0) return null;

  return (
    <div className={cn("flex flex-col flex-1 min-h-0", className)}>
      {/* Card Container */}
      <div className="flex-1 min-h-0 relative">
        {children.map((child, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-all duration-300 ease-out",
              index === currentIndex
                ? "opacity-100 translate-x-0"
                : index < currentIndex
                ? "opacity-0 -translate-x-full"
                : "opacity-0 translate-x-full"
            )}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Navigation */}
      {totalCards > 1 && (
        <div className="flex items-center justify-center gap-4 pt-3 pb-1">
          <button
            onClick={goPrev}
            className="p-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors"
            aria-label="Previous card"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Dots */}
          <div className="flex gap-1.5">
            {children.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "bg-primary w-4"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to card ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            className="p-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors"
            aria-label="Next card"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}
