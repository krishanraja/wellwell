import { useMemo } from "react";

export type TimeOfDay = "morning" | "afternoon" | "evening";

export interface TimeTheme {
  period: TimeOfDay;
  greeting: string;
  accent: string;
  accentGlow: string;
  gradientFrom: string;
  gradientTo: string;
  icon: "sunrise" | "sun" | "moon";
}

export function useTimeOfDay(): TimeTheme {
  return useMemo(() => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return {
        period: "morning",
        greeting: "Good morning",
        accent: "hsl(45 100% 60%)", // warm gold
        accentGlow: "hsl(45 100% 60% / 0.3)",
        gradientFrom: "hsl(45 100% 60%)",
        gradientTo: "hsl(30 100% 55%)",
        icon: "sunrise",
      };
    } else if (hour >= 12 && hour < 18) {
      return {
        period: "afternoon",
        greeting: "Good afternoon",
        accent: "hsl(187 100% 50%)", // aqua
        accentGlow: "hsl(187 100% 50% / 0.3)",
        gradientFrom: "hsl(187 100% 50%)",
        gradientTo: "hsl(160 80% 45%)",
        icon: "sun",
      };
    } else {
      return {
        period: "evening",
        greeting: "Good evening",
        accent: "hsl(260 80% 65%)", // purple/indigo
        accentGlow: "hsl(260 80% 65% / 0.3)",
        gradientFrom: "hsl(260 80% 65%)",
        gradientTo: "hsl(220 80% 55%)",
        icon: "moon",
      };
    }
  }, []);
}
