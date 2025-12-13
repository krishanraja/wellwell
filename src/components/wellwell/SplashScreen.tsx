import { useEffect, useState } from "react";
import wellwellIcon from "@/assets/wellwell-icon.png";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 1.5s
    const fadeTimer = setTimeout(() => setFadeOut(true), 1500);
    // Complete and unmount after 2s
    const completeTimer = setTimeout(onComplete, 2000);
    
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--primary)/0.08)_0%,_transparent_70%)]" />
      
      {/* Icon container with loading ring */}
      <div className="relative animate-fade-in">
        {/* Outer glow */}
        <div className="absolute inset-0 -m-4 rounded-full bg-primary/10 blur-xl animate-pulse" />
        
        {/* Loading ring */}
        <div className="absolute inset-0 -m-4">
          <svg 
            className="w-[calc(100%+2rem)] h-[calc(100%+2rem)] animate-spin" 
            style={{ animationDuration: '2s' }}
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="2"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="70 212"
              className="drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="50%" stopColor="hsl(var(--accent))" />
                <stop offset="100%" stopColor="hsl(var(--primary))" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        {/* Icon */}
        <img 
          src={wellwellIcon} 
          alt="WellWell" 
          className="w-20 h-20 relative z-10 drop-shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
        />
      </div>
    </div>
  );
};

export default SplashScreen;
