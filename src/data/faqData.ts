// FAQ data optimized for SEO - targeting high-volume search queries
// These FAQs are designed to capture searches around:
// - Stoicism for beginners
// - Mental health and stress management
// - Productivity and focus
// - Emotional regulation
// - Morning/evening routines

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'stoicism' | 'app' | 'mental-health' | 'practices' | 'pricing';
  keywords: string[];
}

export const faqData: FAQItem[] = [
  // STOICISM BASICS - High search volume
  {
    id: 'what-is-stoicism',
    question: 'What is Stoicism and how can it help with stress?',
    answer: 'Stoicism is an ancient Greek philosophy that teaches emotional resilience through focusing on what you can control and accepting what you cannot. It helps with stress by providing practical techniques to respond thoughtfully rather than react emotionally. The Stoics believed that our judgments about events—not the events themselves—cause our suffering. By changing how we interpret situations, we can maintain inner calm regardless of external circumstances.',
    category: 'stoicism',
    keywords: ['what is stoicism', 'stoicism for stress', 'stoic philosophy explained', 'stoicism benefits']
  },
  {
    id: 'stoicism-daily-life',
    question: 'How do I apply Stoic philosophy in my daily life?',
    answer: 'Apply Stoicism daily through three key practices: 1) Morning preparation - anticipate challenges and decide how you\'ll respond virtuously. 2) Real-time awareness - when triggered, pause and ask "Is this within my control?" 3) Evening reflection - review your day, noting where you acted well and where you can improve. WellWell\'s Morning Pulse, Intervene, and Evening Debrief are built around these ancient practices.',
    category: 'stoicism',
    keywords: ['stoicism daily practice', 'how to be stoic', 'stoic exercises', 'practical stoicism']
  },
  {
    id: 'four-stoic-virtues',
    question: 'What are the four Stoic virtues and why do they matter?',
    answer: 'The four cardinal Stoic virtues are: Wisdom (knowing what is truly good and how to act), Courage (facing difficulties with strength), Justice (treating others fairly and contributing to society), and Temperance (practicing self-control and moderation). These virtues matter because the Stoics believed they are the only true goods—everything else (wealth, fame, pleasure) is "preferred indifferent." Building these virtues creates lasting wellbeing.',
    category: 'stoicism',
    keywords: ['stoic virtues', 'four cardinal virtues', 'wisdom courage justice temperance', 'stoic values']
  },
  {
    id: 'stoicism-vs-suppressing-emotions',
    question: 'Is Stoicism about suppressing emotions?',
    answer: 'No—this is a common misconception. Stoicism is not about suppressing emotions but understanding and managing them wisely. Stoics distinguish between initial reactions (which are natural) and the judgments we add to them. You can feel angry without acting on it destructively. WellWell helps you process emotions through a Stoic lens, not ignore them.',
    category: 'stoicism',
    keywords: ['stoicism emotions', 'are stoics emotionless', 'stoic emotional control', 'stoicism and feelings']
  },

  // MENTAL HEALTH - Very high search volume
  {
    id: 'how-to-stay-calm',
    question: 'How can I stay calm under pressure at work?',
    answer: 'To stay calm under pressure: 1) Pause before reacting - take 3 deep breaths. 2) Identify what you control - your preparation, effort, and response. 3) Reframe the situation - ask "What would a calm, wise person do?" 4) Focus on the next small action rather than the whole problem. WellWell\'s Intervene feature provides real-time coaching when stress hits, using proven Stoic techniques for immediate calm.',
    category: 'mental-health',
    keywords: ['stay calm under pressure', 'how to stay calm at work', 'stress management tips', 'calm under stress']
  },
  {
    id: 'dealing-with-anxiety',
    question: 'Can Stoic philosophy help with anxiety?',
    answer: 'Yes, Stoicism offers powerful tools for managing anxiety. Anxiety often comes from worrying about future events we cannot control. Stoics practice "negative visualization" to prepare mentally for worst-case scenarios, removing their power. They also focus intensely on the present moment—the only time where action is possible. WellWell\'s daily practices help you build these mental habits over time.',
    category: 'mental-health',
    keywords: ['stoicism for anxiety', 'philosophy for anxiety', 'reduce anxiety naturally', 'stoic anxiety relief']
  },
  {
    id: 'morning-routine-mental-health',
    question: 'What is a good morning routine for mental clarity?',
    answer: 'An effective morning routine for mental clarity: 1) Wake without immediately checking your phone. 2) Take 5 minutes for mental preparation - what challenges might you face today? 3) Set an intention or "stance" for how you\'ll handle difficulty. 4) Review your priorities. WellWell\'s Morning Pulse guides you through this process in under 5 minutes, using voice-first input for ease.',
    category: 'mental-health',
    keywords: ['morning routine mental health', 'morning routine for clarity', 'best morning routine', 'morning mindset routine']
  },
  {
    id: 'evening-reflection',
    question: 'Why is evening reflection important for wellbeing?',
    answer: 'Evening reflection (practiced by Marcus Aurelius nightly) helps you: 1) Process the day\'s events before sleep. 2) Recognize patterns in your reactions. 3) Celebrate small wins and learn from mistakes. 4) Close the day with intention rather than carrying stress to bed. Research shows reflective practices improve sleep quality, emotional regulation, and long-term personal growth.',
    category: 'mental-health',
    keywords: ['evening reflection practice', 'nightly reflection', 'journaling before bed', 'end of day routine']
  },

  // APP FEATURES
  {
    id: 'what-is-wellwell',
    question: 'What is WellWell and how does it work?',
    answer: 'WellWell is an AI-powered Stoic philosophy app that helps you build mental resilience through daily practices. It features three core tools: Morning Pulse (prepare for your day\'s challenges), Intervene (real-time stress relief when triggered), and Evening Debrief (reflect on your day). Simply speak or type what\'s on your mind, and WellWell\'s AI provides personalized Stoic wisdom tailored to your situation.',
    category: 'app',
    keywords: ['wellwell app', 'stoic app', 'mental health app', 'philosophy app']
  },
  {
    id: 'voice-input',
    question: 'Why does WellWell use voice input?',
    answer: 'Voice input makes reflection effortless and natural. Speaking out loud helps you process emotions more fully than typing. It\'s also faster—you can complete a morning practice in under 2 minutes by simply speaking. If you prefer typing, you can switch to text input anytime.',
    category: 'app',
    keywords: ['voice journaling', 'voice mental health app', 'speaking therapy app']
  },
  {
    id: 'ai-coaching',
    question: 'How does the AI coaching work?',
    answer: 'WellWell\'s AI is trained on Stoic philosophy and personalized to your challenges. When you share what\'s on your mind, it: 1) Identifies what\'s within your control. 2) Suggests which virtue to lead with. 3) Provides a personalized "stance" (a brief phrase to guide you). 4) Offers a concrete action step. The AI learns your patterns over time to give increasingly relevant guidance.',
    category: 'app',
    keywords: ['ai life coach', 'ai therapy', 'ai mental health', 'stoic ai']
  },
  {
    id: 'virtue-tracking',
    question: 'How does WellWell track my virtue growth?',
    answer: 'WellWell tracks your growth across the four Stoic virtues: Wisdom, Courage, Justice, and Temperance. As you complete practices and reflect on your actions, the AI assesses which virtues you\'re exercising. Over time, you\'ll see trends showing your strengths and areas for growth. This gamified approach makes ancient philosophy tangible and measurable.',
    category: 'app',
    keywords: ['virtue tracking', 'personal growth tracking', 'habit tracking app', 'character development']
  },

  // PRACTICES
  {
    id: 'morning-pulse-explained',
    question: 'What is Morning Pulse and when should I do it?',
    answer: 'Morning Pulse is a brief mental preparation practice. Ideally done within an hour of waking, you identify your day\'s biggest challenge and receive a personalized "stance" to carry with you. It takes 2-5 minutes and sets the tone for your entire day. Think of it as mental armor—preparing your mind before life tests it.',
    category: 'practices',
    keywords: ['morning mental preparation', 'morning stoic practice', 'daily intention setting']
  },
  {
    id: 'intervene-explained',
    question: 'What is Intervene and when should I use it?',
    answer: 'Intervene is your real-time stress relief tool. Use it the moment you feel triggered—a difficult email, a tense conversation, unexpected news. Speak or type what happened, and WellWell provides immediate perspective: a reality check, a reframe, and a grounding action. It\'s designed to help you respond thoughtfully instead of reacting emotionally.',
    category: 'practices',
    keywords: ['stress relief app', 'real-time stress management', 'emotional regulation tool', 'calm down technique']
  },
  {
    id: 'debrief-explained',
    question: 'What is Evening Debrief and how long does it take?',
    answer: 'Evening Debrief is a 2-5 minute reflection practice, ideally done before bed. You share how your day went—what you controlled, what escaped you, what challenged you. WellWell synthesizes your day, tracks virtue movements, and suggests a focus for tomorrow. This ancient practice (Marcus Aurelius did it nightly) helps you learn from each day.',
    category: 'practices',
    keywords: ['evening journaling', 'daily reflection practice', 'nightly review', 'end of day review']
  },
  {
    id: 'how-often-use',
    question: 'How often should I use WellWell?',
    answer: 'For best results, use WellWell twice daily: Morning Pulse when you wake, Evening Debrief before bed. Use Intervene whenever stress hits—there\'s no limit. Consistency matters more than duration. Even 2 minutes a day builds the mental habits that lead to lasting calm.',
    category: 'practices',
    keywords: ['how often meditate', 'daily mindfulness routine', 'building mental habits']
  },

  // PRICING
  {
    id: 'is-wellwell-free',
    question: 'Is WellWell free to use?',
    answer: 'Yes! WellWell offers a generous free tier with 3 Morning Pulses, 3 Intervenes, and 3 Evening Debriefs per day. This is enough for most users to build a consistent practice. Pro users get unlimited access plus advanced features like cross-session memory and weekly reviews.',
    category: 'pricing',
    keywords: ['free stoic app', 'free mental health app', 'wellwell pricing', 'free meditation app']
  },
  {
    id: 'pro-features',
    question: 'What do I get with WellWell Pro?',
    answer: 'WellWell Pro includes: Unlimited daily practices, AI memory of your patterns across sessions, weekly review summaries, advanced virtue analytics, and priority support. Pro is perfect for those committed to deep, consistent practice.',
    category: 'pricing',
    keywords: ['wellwell pro', 'premium stoic app', 'mental health subscription']
  },

  // HIGH-VALUE SEO KEYWORDS
  {
    id: 'difficult-coworker',
    question: 'How do I deal with a difficult coworker using Stoic principles?',
    answer: 'When dealing with difficult coworkers, Stoics focus on what they control: their own response. 1) Remember their behavior reflects their stress, not your worth. 2) Respond with temperance—measured, not reactive. 3) Look for the lesson—difficult people build your patience. 4) Set boundaries calmly without expectation they\'ll change. WellWell\'s Conflict Copilot provides specific scripts for tough conversations.',
    category: 'mental-health',
    keywords: ['difficult coworker', 'toxic coworker', 'coworker conflict', 'workplace conflict']
  },
  {
    id: 'imposter-syndrome',
    question: 'How can Stoicism help with imposter syndrome?',
    answer: 'Stoicism addresses imposter syndrome by shifting focus from outcomes (recognition, success) to what you control (effort, learning, integrity). The Stoics remind us that our worth isn\'t determined by others\' opinions. Focus on doing excellent work, continue learning, and accept that feeling uncertain is normal—even Marcus Aurelius, Roman Emperor, questioned himself.',
    category: 'mental-health',
    keywords: ['imposter syndrome', 'feeling like a fraud', 'self doubt at work', 'confidence at work']
  },
  {
    id: 'decision-making',
    question: 'How do Stoics make difficult decisions?',
    answer: 'Stoics make decisions by: 1) Clarifying what they control (the decision) vs. don\'t (outcomes). 2) Asking "What would the wisest version of me choose?" 3) Considering what they\'d advise a friend. 4) Accepting that some decisions don\'t have clear right answers. 5) Committing fully once decided, without regret. WellWell\'s Decision feature walks you through this process.',
    category: 'mental-health',
    keywords: ['how to make decisions', 'decision making framework', 'tough decisions', 'decision anxiety']
  },
  {
    id: 'marcus-aurelius-meditations',
    question: 'What can I learn from Marcus Aurelius\'s Meditations?',
    answer: 'Marcus Aurelius\'s Meditations teaches: 1) Focus only on what you control. 2) Every obstacle is an opportunity. 3) Practice gratitude and perspective daily. 4) Your thoughts create your reality. 5) We\'re all connected and should serve others. WellWell translates these ancient insights into practical, personalized guidance for modern life.',
    category: 'stoicism',
    keywords: ['marcus aurelius meditations', 'meditations book', 'stoic emperor', 'roman philosophy']
  },
  {
    id: 'burnout-prevention',
    question: 'How can Stoic practices help prevent burnout?',
    answer: 'Stoicism prevents burnout by: 1) Teaching you to set boundaries around what you can control. 2) Removing the need for external validation. 3) Encouraging rest as part of virtue (temperance). 4) Providing perspective when work feels overwhelming. 5) Regular reflection catches warning signs early. WellWell\'s daily practices build resilience before burnout hits.',
    category: 'mental-health',
    keywords: ['burnout prevention', 'prevent burnout', 'work life balance', 'stress management burnout']
  }
];

// Get FAQ data formatted for JSON-LD schema
export function getFAQSchemaData() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// Get FAQs by category
export function getFAQsByCategory(category: FAQItem['category']) {
  return faqData.filter(faq => faq.category === category);
}

// Search FAQs
export function searchFAQs(query: string) {
  const lowerQuery = query.toLowerCase();
  return faqData.filter(faq => 
    faq.question.toLowerCase().includes(lowerQuery) ||
    faq.answer.toLowerCase().includes(lowerQuery) ||
    faq.keywords.some(k => k.includes(lowerQuery))
  );
}
