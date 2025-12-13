import { useEffect, useState } from "react";
import wellwellIcon from "@/assets/wellwell-icon.png";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase('hold'), 400);
    const exitTimer = setTimeout(() => setPhase('exit'), 1800);
    const completeTimer = setTimeout(onComplete, 2300);
    
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // Ring size: 120px, Icon size: 80px
  // This gives ~20px padding on each side between icon edge and ring
  const ringSize = 120;
  const iconSize = 80;
  const strokeWidth = 2.5;
  const radius = (ringSize - strokeWidth) / 2; // 58.75

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-all duration-500 ease-out ${
        phase === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Subtle radial gradient background */}
      <div 
        className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(187_100%_60%/0.08)_0%,_transparent_50%)] transition-opacity duration-700 ${
          phase === 'enter' ? 'opacity-0' : 'opacity-100'
        }`} 
      />
      
      {/* Container with explicit pixel sizing for precise control */}
      <div 
        className={`relative flex items-center justify-center transition-all duration-500 ease-out ${
          phase === 'enter' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        style={{ width: ringSize, height: ringSize }}
      >
        {/* Loading ring SVG - absolutely positioned to fill container exactly */}
        <svg 
          width={ringSize}
          height={ringSize}
          viewBox={`0 0 ${ringSize} ${ringSize}`}
          className="absolute inset-0"
          style={{ 
            animation: phase !== 'enter' ? 'spin 2s linear infinite' : 'none',
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
          {/* Animated arc */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="url(#splashGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${radius * 0.8} ${radius * Math.PI * 2}`}
          />
          <defs>
            <linearGradient id="splashGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(90 100% 79%)" />
              <stop offset="100%" stopColor="hsl(187 100% 60%)" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Icon - centered via flexbox, explicit size */}
        <img 
          src={wellwellIcon} 
          alt="WellWell" 
          style={{ width: iconSize, height: iconSize }}
          className={`relative z-10 transition-all duration-500 ease-out ${
            phase === 'enter' ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
          }`}
        />
      </div>
    </div>
  );
};

export default SplashScreen;
