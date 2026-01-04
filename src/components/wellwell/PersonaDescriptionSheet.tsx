import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Compass, 
  Sword, 
  Heart,
  Sparkles,
  Quote,
} from "lucide-react";
import type { Persona } from "@/types/database";

interface PersonaDescriptionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona: Persona | null;
}

interface PersonaDetails {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tagline: string;
  description: string;
  philosophy: string;
  quote: string;
  quoteAuthor: string;
  traits: string[];
  color: string;
  gradient: string;
}

const personaDetails: Record<Persona, PersonaDetails> = {
  strategist: {
    icon: Brain,
    title: "The Strategist",
    tagline: "Keep me sharp",
    description: "Your mind is your greatest weapon. Like Odysseus navigating treacherous waters, you see patterns others miss and think three moves ahead.",
    philosophy: "The Strategist embodies the Stoic virtue of Wisdom (Phronesis) — the ability to discern the best course of action in complex situations. Where others see chaos, you see a chessboard. Where others react, you calculate.",
    quote: "The wise man is one who knows what is within his power and what is not.",
    quoteAuthor: "Epictetus",
    traits: ["Analytical", "Tactical", "Far-sighted", "Calculated"],
    color: "hsl(187 100% 60%)",
    gradient: "from-cyan-500/20 to-blue-500/20",
  },
  monk: {
    icon: Compass,
    title: "The Monk",
    tagline: "Keep me steady",
    description: "In the eye of every storm, there is stillness. Like Marcus Aurelius writing meditations in a war tent, you find peace amidst chaos.",
    philosophy: "The Monk embodies the Stoic virtue of Temperance (Sophrosyne) — measured response and inner equilibrium. You understand that external turbulence cannot disturb a mind anchored in acceptance. Your strength is your stillness.",
    quote: "You have power over your mind—not outside events. Realize this, and you will find strength.",
    quoteAuthor: "Marcus Aurelius",
    traits: ["Calm", "Reflective", "Centered", "Patient"],
    color: "hsl(260 80% 65%)",
    gradient: "from-purple-500/20 to-indigo-500/20",
  },
  commander: {
    icon: Sword,
    title: "The Commander",
    tagline: "Keep me decisive",
    description: "Analysis without action is paralysis. Like the great Stoic emperor who led armies, you know that the moment demands decision, not deliberation.",
    philosophy: "The Commander embodies the Stoic virtue of Courage (Andreia) — the fortitude to act despite uncertainty. While others hesitate, you move. Your decisions are swift but not reckless, grounded in principles that don't waver.",
    quote: "Waste no more time arguing about what a good man should be. Be one.",
    quoteAuthor: "Marcus Aurelius",
    traits: ["Decisive", "Direct", "Action-oriented", "Bold"],
    color: "hsl(8 100% 65%)",
    gradient: "from-red-500/20 to-orange-500/20",
  },
  friend: {
    icon: Heart,
    title: "The Friend",
    tagline: "Keep me grounded",
    description: "Philosophy isn't meant to be cold. Like Seneca's letters to Lucilius, the deepest wisdom flows between those who understand each other.",
    philosophy: "The Friend embodies the Stoic virtue of Justice (Dikaiosyne) — treating others with fairness, honesty, and genuine care. Stoicism was never meant to make us islands. Your humanity is your strength. Connection grounds you.",
    quote: "We are born to work together like feet, like hands, like eyelids.",
    quoteAuthor: "Marcus Aurelius",
    traits: ["Warm", "Supportive", "Empathetic", "Grounded"],
    color: "hsl(90 100% 60%)",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
};

export function PersonaDescriptionSheet({ 
  open, 
  onOpenChange, 
  persona 
}: PersonaDescriptionSheetProps) {
  if (!persona) return null;
  
  const details = personaDetails[persona];
  const Icon = details.icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-center pb-4">
          <div 
            className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br ${details.gradient}`}
            style={{ boxShadow: `0 0 30px ${details.color}40` }}
          >
            <Icon className="w-8 h-8" style={{ color: details.color }} />
          </div>
          <SheetTitle className="font-display text-2xl flex items-center justify-center gap-2">
            {details.title}
            <Sparkles className="w-5 h-5" style={{ color: details.color }} />
          </SheetTitle>
          <SheetDescription className="text-base" style={{ color: details.color }}>
            {details.tagline}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 pb-6">
          {/* Main Description */}
          <p className="text-foreground text-center leading-relaxed">
            {details.description}
          </p>

          {/* Philosophy Section */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <h3 className="font-display font-semibold text-foreground mb-2 text-sm uppercase tracking-wider">
              The Philosophy
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {details.philosophy}
            </p>
          </div>

          {/* Quote */}
          <div className="relative p-4">
            <Quote className="absolute top-0 left-0 w-6 h-6 text-primary/30" />
            <blockquote className="pl-8 pr-2">
              <p className="text-foreground font-display text-lg italic leading-relaxed">
                "{details.quote}"
              </p>
              <footer className="mt-2 text-sm text-muted-foreground">
                — {details.quoteAuthor}
              </footer>
            </blockquote>
          </div>

          {/* Traits */}
          <div>
            <h3 className="font-display font-semibold text-foreground mb-3 text-sm uppercase tracking-wider text-center">
              Your Traits
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {details.traits.map((trait) => (
                <span
                  key={trait}
                  className="px-3 py-1.5 rounded-full text-sm font-medium border"
                  style={{ 
                    backgroundColor: `${details.color}15`,
                    borderColor: `${details.color}30`,
                    color: details.color,
                  }}
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          {/* Confirmation */}
          <Button
            variant="brand"
            size="lg"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Embrace the {details.title.split(' ')[1]}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Same Stoic wisdom, delivered in your style
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

