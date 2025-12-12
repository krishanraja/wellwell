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

// Challenge-specific stances for personalization
const challengeStances: Record<string, DailyStance[]> = {
  conflict: [
    { day: 0, stance: "Seek to understand before seeking to be understood.", virtue: "wisdom" },
    { day: 0, stance: "Respond to hostility with composure.", virtue: "temperance" },
    { day: 0, stance: "Stand firm in your values while staying open.", virtue: "courage" },
  ],
  pressure: [
    { day: 0, stance: "Break the impossible into possible steps.", virtue: "wisdom" },
    { day: 0, stance: "Pressure reveals character. Rise to meet it.", virtue: "courage" },
    { day: 0, stance: "Pace yourself. Sustainable effort wins.", virtue: "temperance" },
  ],
  uncertainty: [
    { day: 0, stance: "Embrace not knowing as the beginning of wisdom.", virtue: "wisdom" },
    { day: 0, stance: "Act despite uncertainty. Clarity comes through action.", virtue: "courage" },
    { day: 0, stance: "Trust the process, not just the outcome.", virtue: "justice" },
  ],
  overwhelm: [
    { day: 0, stance: "One thing at a time. This moment only.", virtue: "temperance" },
    { day: 0, stance: "Let go of what doesn't serve you now.", virtue: "wisdom" },
    { day: 0, stance: "Ask for help. It's a strength, not weakness.", virtue: "courage" },
  ],
};

// Virtue-specific stances for when a virtue is low
const virtueBoostStances: Record<string, DailyStance[]> = {
  courage: [
    { day: 0, stance: "Today, do one thing that scares you.", virtue: "courage" },
    { day: 0, stance: "Fear is a compass. Move toward it.", virtue: "courage" },
    { day: 0, stance: "Courage is not the absence of fear, but action despite it.", virtue: "courage" },
  ],
  temperance: [
    { day: 0, stance: "Before reacting, count to ten.", virtue: "temperance" },
    { day: 0, stance: "Less is more. Simplify today.", virtue: "temperance" },
    { day: 0, stance: "Moderation in all things, including moderation.", virtue: "temperance" },
  ],
  justice: [
    { day: 0, stance: "Give everyone the benefit of the doubt today.", virtue: "justice" },
    { day: 0, stance: "Be fair, even when it costs you.", virtue: "justice" },
    { day: 0, stance: "Your integrity is your most valuable asset.", virtue: "justice" },
  ],
  wisdom: [
    { day: 0, stance: "Ask more questions. Make fewer assumptions.", virtue: "wisdom" },
    { day: 0, stance: "Learn something new today, however small.", virtue: "wisdom" },
    { day: 0, stance: "The wise person knows what they don't know.", virtue: "wisdom" },
  ],
};

export function getTodayStance(): DailyStance {
  const dayOfMonth = new Date().getDate();
  return dailyStances[(dayOfMonth - 1) % 30];
}

export function getStanceByDay(day: number): DailyStance {
  return dailyStances[(day - 1) % 30];
}

/**
 * Get a personalized stance based on user context
 * Priority: 1. Boost lowest virtue, 2. Match primary challenge, 3. Default daily
 */
export function getPersonalizedStance(context: {
  challenges?: string[];
  lowestVirtue?: string;
  lowestVirtueScore?: number;
}): DailyStance {
  const dayOfMonth = new Date().getDate();
  
  // If user has a very low virtue (below 40), prioritize boosting it
  if (context.lowestVirtue && context.lowestVirtueScore !== undefined && context.lowestVirtueScore < 40) {
    const boostStances = virtueBoostStances[context.lowestVirtue];
    if (boostStances) {
      return boostStances[dayOfMonth % boostStances.length];
    }
  }
  
  // If user has challenges, pick a stance for their primary challenge
  if (context.challenges && context.challenges.length > 0) {
    const primaryChallenge = context.challenges[0];
    const stances = challengeStances[primaryChallenge];
    if (stances) {
      return stances[dayOfMonth % stances.length];
    }
  }
  
  // Default to day-based stance
  return dailyStances[(dayOfMonth - 1) % 30];
}
