import { useEffect, useState } from "react";
import wellwellIcon from "@/assets/wellwell-icon.png";

interface LoadingScreenProps {
  onComplete?: () => void;
  autoComplete?: boolean;
  autoCompleteDelay?: number;
}

/**
 * Light background loading screen for general loading states
 * (not the dark welcome back screen for returning users)
 */
export function LoadingScreen({ 
  onComplete, 
  autoComplete = false,
  autoCompleteDelay = 1000 
}: LoadingScreenProps) {
  const [phase, setPhase] = useState<'loading' | 'enter' | 'hold' | 'exit'>('loading');

  useEffect(() => {
    // Preload the icon image
    const img = new Image();
    img.src = wellwellIcon;
    
    img.onload = () => {
      setPhase('enter');
    };

    img.onerror = () => {
      setPhase('enter');
    };
  }, []);

  useEffect(() => {
    if (phase === 'loading') return;
    
    if (phase === 'enter') {
      const holdTimer = setTimeout(() => setPhase('hold'), 400);
      return () => clearTimeout(holdTimer);
    }
    
    if (phase === 'hold') {
      if (autoComplete) {
        const exitTimer = setTimeout(() => setPhase('exit'), autoCompleteDelay);
        return () => clearTimeout(exitTimer);
      }
    }
    
    if (phase === 'exit' && onComplete) {
      const completeTimer = setTimeout(onComplete, 500);
      return () => clearTimeout(completeTimer);
    }
  }, [phase, onComplete, autoComplete, autoCompleteDelay]);

  const ringSize = 120;
  const iconSize = 72;
  const strokeWidth = 2;
  const radius = (ringSize - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.25;

  const isVisible = phase !== 'loading';
  const isAnimating = phase === 'hold' || phase === 'exit';

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'hsl(160 20% 98%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: phase === 'exit' ? 0 : 1,
        transition: 'opacity 500ms ease-out',
      }}
    >
      {/* Centered container */}
      <div 
        style={{
          position: 'relative',
          width: ringSize,
          height: ringSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.95)',
          transition: 'opacity 400ms ease-out, transform 400ms ease-out',
        }}
      >
        {/* Spinning ring */}
        <svg 
          width={ringSize}
          height={ringSize}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            animation: isAnimating ? 'spin 1.5s linear infinite' : 'none',
          }}
        >
          {/* Background track */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="hsl(160 15% 90%)"
            strokeWidth={strokeWidth}
          />
          {/* Gradient arc */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="url(#loadingGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            style={{
              transformOrigin: 'center',
              transform: 'rotate(-90deg)',
            }}
          />
          <defs>
            <linearGradient id="loadingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(90 100% 79%)" />
              <stop offset="100%" stopColor="hsl(187 100% 60%)" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Icon */}
        <img 
          src={wellwellIcon} 
          alt="WellWell" 
          style={{
            width: iconSize,
            height: iconSize,
            position: 'relative',
            zIndex: 10,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'scale(1)' : 'scale(0.9)',
            transition: 'opacity 400ms ease-out, transform 400ms ease-out',
          }}
        />
      </div>
    </div>
  );
}

