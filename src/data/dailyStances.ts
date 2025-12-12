// 30 Daily Stances from WellWell Stoic Philosophy
// Each stance maps to one of the four cardinal virtues

export interface DailyStance {
  day: number;
  stance: string;
  virtue: "courage" | "temperance" | "justice" | "wisdom";
}

export const dailyStances: DailyStance[] = [
  { day: 1, stance: "Act with temperance. Slow down before reacting.", virtue: "temperance" },
  { day: 2, stance: "Let courage decide the first step.", virtue: "courage" },
  { day: 3, stance: "Seek wisdom in the pause, not the rush.", virtue: "wisdom" },
  { day: 4, stance: "Treat others as you wish to be treated.", virtue: "justice" },
  { day: 5, stance: "Accept what you cannot control.", virtue: "wisdom" },
  { day: 6, stance: "Speak less. Listen more.", virtue: "temperance" },
  { day: 7, stance: "Face discomfort with dignity.", virtue: "courage" },
  { day: 8, stance: "Give credit where it's due.", virtue: "justice" },
  { day: 9, stance: "Choose the harder right over the easier wrong.", virtue: "courage" },
  { day: 10, stance: "Question your first impulse.", virtue: "wisdom" },
  { day: 11, stance: "Moderate your desires.", virtue: "temperance" },
  { day: 12, stance: "Stand up for those who cannot.", virtue: "justice" },
  { day: 13, stance: "Embrace uncertainty as opportunity.", virtue: "courage" },
  { day: 14, stance: "Think before you speak.", virtue: "wisdom" },
  { day: 15, stance: "Practice restraint in pleasure.", virtue: "temperance" },
  { day: 16, stance: "Be fair in your judgments.", virtue: "justice" },
  { day: 17, stance: "Do what must be done, despite fear.", virtue: "courage" },
  { day: 18, stance: "Learn from every setback.", virtue: "wisdom" },
  { day: 19, stance: "Know when enough is enough.", virtue: "temperance" },
  { day: 20, stance: "Honor your commitments.", virtue: "justice" },
  { day: 21, stance: "Take the first step, even if afraid.", virtue: "courage" },
  { day: 22, stance: "Seek understanding over being understood.", virtue: "wisdom" },
  { day: 23, stance: "Balance work with rest.", virtue: "temperance" },
  { day: 24, stance: "Admit when you are wrong.", virtue: "justice" },
  { day: 25, stance: "Persist when others quit.", virtue: "courage" },
  { day: 26, stance: "Reflect before reacting.", virtue: "wisdom" },
  { day: 27, stance: "Resist the urge to excess.", virtue: "temperance" },
  { day: 28, stance: "Contribute to the common good.", virtue: "justice" },
  { day: 29, stance: "Speak truth, even when difficult.", virtue: "courage" },
  { day: 30, stance: "Embrace the journey of learning.", virtue: "wisdom" },
];

export function getTodayStance(): DailyStance {
  const dayOfMonth = new Date().getDate();
  return dailyStances[(dayOfMonth - 1) % 30];
}

export function getStanceByDay(day: number): DailyStance {
  return dailyStances[(day - 1) % 30];
}
