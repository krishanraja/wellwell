import { ReactNode, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
  showFades?: boolean;
}

export function HorizontalScroll({ 
  children, 
  className,
  showFades = true 
}: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeftFade(scrollLeft > 8);
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 8);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    // Initial check
    checkScroll();
    
    // Check on scroll
    el.addEventListener("scroll", checkScroll, { passive: true });
    
    // Check on resize
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(el);
    
    return () => {
      el.removeEventListener("scroll", checkScroll);
      resizeObserver.disconnect();
    };
  }, [children]);

  return (
    <div className="relative">
      {/* Left fade indicator */}
      {showFades && showLeftFade && (
        <div 
          className="absolute left-0 top-0 bottom-0 w-6 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to right, hsl(var(--background)) 0%, transparent 100%)"
          }}
        />
      )}
      
      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className={cn(
          "flex gap-2 overflow-x-auto scrollbar-hide",
          className
        )}
      >
        {children}
      </div>
      
      {/* Right fade indicator */}
      {showFades && showRightFade && (
        <div 
          className="absolute right-0 top-0 bottom-0 w-6 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to left, hsl(var(--background)) 0%, transparent 100%)"
          }}
        />
      )}
    </div>
  );
}
