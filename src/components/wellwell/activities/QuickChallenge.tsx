import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Target, CheckCircle, ArrowRight, Heart, Brain, Zap, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

// Challenge types that determine the UI rendered
export type ChallengeType = 'dichotomy' | 'gratitude' | 'cognitive' | 'action' | 'mindfulness';

// Response data structures for each challenge type
export type ChallengeResponseData = 
  | { type: 'dichotomy'; items: string[]; completedAt: string }
  | { type: 'gratitude'; person: string; reason: string; completedAt: string }
  | { type: 'cognitive'; assumption: string; completedAt: string }
  | { type: 'action'; action: string; timeframe: 'now' | 'next_hour' | 'today'; completedAt: string }
  | { type: 'mindfulness'; breathCount: number; completedAt: string };

interface QuickChallengeProps {
  challenge: string;
  challengeType?: ChallengeType;
  onComplete: (response: ChallengeResponseData) => void;
  onSkip?: () => void;
  isSubmitting?: boolean;
}

// Icon mapping for each challenge type
const CHALLENGE_ICONS: Record<ChallengeType, typeof Target> = {
  dichotomy: Target,
  gratitude: Heart,
  cognitive: Brain,
  action: Zap,
  mindfulness: Wind,
};

// Color mapping for each challenge type
const CHALLENGE_COLORS: Record<ChallengeType, { from: string; to: string; text: string }> = {
  dichotomy: { from: 'from-primary/20', to: 'to-cyan-500/10', text: 'text-primary' },
  gratitude: { from: 'from-rose-500/20', to: 'to-pink-500/10', text: 'text-rose-400' },
  cognitive: { from: 'from-violet-500/20', to: 'to-purple-500/10', text: 'text-violet-400' },
  action: { from: 'from-amber-500/20', to: 'to-orange-500/10', text: 'text-amber-400' },
  mindfulness: { from: 'from-emerald-500/20', to: 'to-teal-500/10', text: 'text-emerald-400' },
};

export function QuickChallenge({ 
  challenge, 
  challengeType = 'dichotomy', 
  onComplete, 
  onSkip, 
  isSubmitting 
}: QuickChallengeProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  
  const Icon = CHALLENGE_ICONS[challengeType];
  const colors = CHALLENGE_COLORS[challengeType];

  const handleCompleteWithAnimation = useCallback((response: ChallengeResponseData) => {
    setIsCompleted(true);
    setTimeout(() => {
      onComplete(response);
    }, 800);
  }, [onComplete]);

  // Render the appropriate input UI based on challenge type
  const renderChallengeInput = () => {
    switch (challengeType) {
      case 'dichotomy':
        return <DichotomyInput onComplete={handleCompleteWithAnimation} isSubmitting={isSubmitting} onSkip={onSkip} />;
      case 'gratitude':
        return <GratitudeInput onComplete={handleCompleteWithAnimation} isSubmitting={isSubmitting} onSkip={onSkip} />;
      case 'cognitive':
        return <CognitiveInput onComplete={handleCompleteWithAnimation} isSubmitting={isSubmitting} onSkip={onSkip} />;
      case 'action':
        return <ActionInput onComplete={handleCompleteWithAnimation} isSubmitting={isSubmitting} onSkip={onSkip} />;
      case 'mindfulness':
        return <MindfulnessInput onComplete={handleCompleteWithAnimation} isSubmitting={isSubmitting} onSkip={onSkip} />;
      default:
        return <DichotomyInput onComplete={handleCompleteWithAnimation} isSubmitting={isSubmitting} onSkip={onSkip} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative flex flex-col gap-5"
    >
      {/* Icon */}
      <motion.div 
        className="flex justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className={cn(
          "p-4 rounded-2xl bg-gradient-to-br border border-white/10",
          colors.from,
          colors.to
        )}>
          <Icon className={cn("w-8 h-8", colors.text)} />
        </div>
      </motion.div>

      {/* Challenge prompt */}
      <motion.h2 
        className="text-xl font-display font-semibold text-center text-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {challenge}
      </motion.h2>

      {/* Challenge-specific input */}
      {renderChallengeInput()}

      {/* Complete animation overlay */}
      {isCompleted && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn("flex flex-col items-center gap-2", colors.text)}
          >
            <CheckCircle className="w-16 h-16" />
            <span className="font-display font-semibold">Nice work!</span>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ===========================================
// DICHOTOMY INPUT: 3 text inputs (original)
// ===========================================
interface DichotomyInputProps {
  onComplete: (response: ChallengeResponseData) => void;
  isSubmitting?: boolean;
  onSkip?: () => void;
}

function DichotomyInput({ onComplete, isSubmitting, onSkip }: DichotomyInputProps) {
  const [items, setItems] = useState<string[]>(["", "", ""]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
    
    if (value.length > 0 && index === currentIndex && index < 2) {
      setTimeout(() => setCurrentIndex(index + 1), 300);
    }
  };

  const handleComplete = () => {
    const filledItems = items.filter(item => item.trim());
    if (filledItems.length > 0) {
      onComplete({ 
        type: 'dichotomy', 
        items: filledItems, 
        completedAt: new Date().toISOString() 
      });
    }
  };

  const filledCount = items.filter(item => item.trim()).length;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: index <= currentIndex ? 1 : 0.3, 
              x: 0,
              scale: index === currentIndex ? 1.02 : 1
            }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={cn(
              "relative flex items-center gap-3 p-3 rounded-xl transition-all",
              index === currentIndex 
                ? "bg-white/10 ring-1 ring-primary/50" 
                : "bg-white/5"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm shrink-0 transition-colors",
              item.trim() 
                ? "bg-primary text-black" 
                : "bg-white/10 text-muted-foreground"
            )}>
              {item.trim() ? <CheckCircle className="w-5 h-5" /> : index + 1}
            </div>
            <input
              type="text"
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              placeholder={`Thing ${index + 1}...`}
              disabled={index > currentIndex}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Progress indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(
              "w-3 h-3 rounded-full transition-colors",
              items[i].trim() ? "bg-primary" : "bg-white/20"
            )}
            animate={{ scale: items[i].trim() ? [1, 1.3, 1] : 1 }}
          />
        ))}
      </motion.div>

      <ActionButtons 
        onComplete={handleComplete}
        onSkip={onSkip}
        isDisabled={filledCount === 0 || isSubmitting}
      />
    </>
  );
}

// ===========================================
// GRATITUDE INPUT: Person + Reason
// ===========================================
interface GratitudeInputProps {
  onComplete: (response: ChallengeResponseData) => void;
  isSubmitting?: boolean;
  onSkip?: () => void;
}

function GratitudeInput({ onComplete, isSubmitting, onSkip }: GratitudeInputProps) {
  const [person, setPerson] = useState("");
  const [reason, setReason] = useState("");
  const [focusedField, setFocusedField] = useState<'person' | 'reason' | null>(null);

  const handleComplete = () => {
    if (person.trim()) {
      onComplete({
        type: 'gratitude',
        person: person.trim(),
        reason: reason.trim(),
        completedAt: new Date().toISOString()
      });
    }
  };

  const isValid = person.trim().length > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {/* Person input */}
        <div className={cn(
          "rounded-xl transition-all p-3",
          focusedField === 'person'
            ? "bg-white/10 ring-1 ring-rose-400/50"
            : "bg-white/5"
        )}>
          <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
            Who are you grateful for?
          </label>
          <input
            type="text"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            onFocus={() => setFocusedField('person')}
            onBlur={() => setFocusedField(null)}
            placeholder="Their name..."
            className="w-full bg-transparent text-foreground text-lg placeholder:text-muted-foreground/50 focus:outline-none"
          />
        </div>

        {/* Reason textarea */}
        <div className={cn(
          "rounded-xl transition-all p-3",
          focusedField === 'reason'
            ? "bg-white/10 ring-1 ring-rose-400/50"
            : "bg-white/5"
        )}>
          <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
            Why are you grateful for them?
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onFocus={() => setFocusedField('reason')}
            onBlur={() => setFocusedField(null)}
            placeholder="Because they..."
            rows={3}
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none"
          />
        </div>
      </motion.div>

      <ActionButtons 
        onComplete={handleComplete}
        onSkip={onSkip}
        isDisabled={!isValid || isSubmitting}
        buttonColor="from-rose-500 to-pink-500"
      />
    </>
  );
}

// ===========================================
// COGNITIVE INPUT: Single assumption textarea
// ===========================================
interface CognitiveInputProps {
  onComplete: (response: ChallengeResponseData) => void;
  isSubmitting?: boolean;
  onSkip?: () => void;
}

function CognitiveInput({ onComplete, isSubmitting, onSkip }: CognitiveInputProps) {
  const [assumption, setAssumption] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleComplete = () => {
    if (assumption.trim()) {
      onComplete({
        type: 'cognitive',
        assumption: assumption.trim(),
        completedAt: new Date().toISOString()
      });
    }
  };

  const isValid = assumption.trim().length > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className={cn(
          "rounded-xl transition-all p-4",
          isFocused
            ? "bg-white/10 ring-1 ring-violet-400/50"
            : "bg-white/5"
        )}>
          <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
            What assumption are you making?
          </label>
          <textarea
            value={assumption}
            onChange={(e) => setAssumption(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="I'm assuming that..."
            rows={4}
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none"
          />
          {assumption.length > 0 && (
            <p className="text-xs text-muted-foreground/50 mt-2">
              Noticing assumptions is the first step to questioning them.
            </p>
          )}
        </div>
      </motion.div>

      <ActionButtons 
        onComplete={handleComplete}
        onSkip={onSkip}
        isDisabled={!isValid || isSubmitting}
        buttonColor="from-violet-500 to-purple-500"
      />
    </>
  );
}

// ===========================================
// ACTION INPUT: Small win + timeframe
// ===========================================
interface ActionInputProps {
  onComplete: (response: ChallengeResponseData) => void;
  isSubmitting?: boolean;
  onSkip?: () => void;
}

function ActionInput({ onComplete, isSubmitting, onSkip }: ActionInputProps) {
  const [action, setAction] = useState("");
  const [timeframe, setTimeframe] = useState<'now' | 'next_hour' | 'today'>('next_hour');
  const [isFocused, setIsFocused] = useState(false);

  const handleComplete = () => {
    if (action.trim()) {
      onComplete({
        type: 'action',
        action: action.trim(),
        timeframe,
        completedAt: new Date().toISOString()
      });
    }
  };

  const isValid = action.trim().length > 0;

  const timeframeOptions: { value: 'now' | 'next_hour' | 'today'; label: string }[] = [
    { value: 'now', label: 'Right now' },
    { value: 'next_hour', label: 'In the next hour' },
    { value: 'today', label: 'By end of day' },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {/* Action input */}
        <div className={cn(
          "rounded-xl transition-all p-3",
          isFocused
            ? "bg-white/10 ring-1 ring-amber-400/50"
            : "bg-white/5"
        )}>
          <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
            Your small win
          </label>
          <input
            type="text"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="I will..."
            className="w-full bg-transparent text-foreground text-lg placeholder:text-muted-foreground/50 focus:outline-none"
          />
        </div>

        {/* Timeframe selector */}
        <div className="flex gap-2">
          {timeframeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeframe(option.value)}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                timeframe === option.value
                  ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </motion.div>

      <ActionButtons 
        onComplete={handleComplete}
        onSkip={onSkip}
        isDisabled={!isValid || isSubmitting}
        buttonColor="from-amber-500 to-orange-500"
      />
    </>
  );
}

// ===========================================
// MINDFULNESS INPUT: Breathing exercise
// ===========================================
interface MindfulnessInputProps {
  onComplete: (response: ChallengeResponseData) => void;
  isSubmitting?: boolean;
  onSkip?: () => void;
}

function MindfulnessInput({ onComplete, isSubmitting, onSkip }: MindfulnessInputProps) {
  const [breathCount, setBreathCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [countdown, setCountdown] = useState(4);
  const targetBreaths = 3;

  // Handle breathing cycle
  useEffect(() => {
    if (!isBreathing) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Move to next phase
          if (phase === 'inhale') {
            setPhase('hold');
            return 4;
          } else if (phase === 'hold') {
            setPhase('exhale');
            return 4;
          } else {
            // Exhale complete - count the breath
            setBreathCount(bc => {
              const newCount = bc + 1;
              if (newCount >= targetBreaths) {
                setIsBreathing(false);
                // Complete after a brief delay
                setTimeout(() => {
                  onComplete({
                    type: 'mindfulness',
                    breathCount: targetBreaths,
                    completedAt: new Date().toISOString()
                  });
                }, 500);
              }
              return newCount;
            });
            setPhase('inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBreathing, phase, onComplete]);

  const startBreathing = () => {
    setIsBreathing(true);
    setPhase('inhale');
    setCountdown(4);
    setBreathCount(0);
  };

  const phaseText = {
    inhale: 'Breathe in...',
    hold: 'Hold...',
    exhale: 'Breathe out...',
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center gap-6"
      >
        {!isBreathing ? (
          <>
            <p className="text-center text-muted-foreground">
              Take a moment to center yourself with {targetBreaths} deep breaths.
            </p>
            <button
              onClick={startBreathing}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center hover:scale-105 transition-transform"
            >
              <span className="text-emerald-400 font-medium">Begin</span>
            </button>
          </>
        ) : (
          <>
            {/* Breathing indicator */}
            <motion.div
              className="w-40 h-40 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-emerald-500/30 flex flex-col items-center justify-center"
              animate={{
                scale: phase === 'inhale' ? [1, 1.2] : phase === 'exhale' ? [1.2, 1] : 1.2
              }}
              transition={{ duration: 4, ease: 'easeInOut' }}
            >
              <span className="text-3xl font-bold text-emerald-400">{countdown}</span>
              <span className="text-sm text-emerald-400/80">{phaseText[phase]}</span>
            </motion.div>

            {/* Progress dots */}
            <div className="flex gap-3">
              {[...Array(targetBreaths)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-4 h-4 rounded-full transition-colors",
                    i < breathCount ? "bg-emerald-400" : "bg-white/20"
                  )}
                />
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              Breath {breathCount + 1} of {targetBreaths}
            </p>
          </>
        )}
      </motion.div>

      {/* Skip button only visible when not breathing */}
      {!isBreathing && onSkip && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center"
        >
          <button
            onClick={onSkip}
            className="py-3 px-6 rounded-xl text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            Skip for now
          </button>
        </motion.div>
      )}
    </>
  );
}

// ===========================================
// SHARED: Action Buttons
// ===========================================
interface ActionButtonsProps {
  onComplete: () => void;
  onSkip?: () => void;
  isDisabled: boolean;
  buttonColor?: string;
}

function ActionButtons({ onComplete, onSkip, isDisabled, buttonColor = 'from-primary to-cyan-400' }: ActionButtonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 }}
      className="flex gap-3"
    >
      {onSkip && (
        <button
          onClick={onSkip}
          className="flex-1 py-3 rounded-xl text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          Skip
        </button>
      )}
      <button
        onClick={onComplete}
        disabled={isDisabled}
        className={cn(
          "flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
          !isDisabled
            ? `bg-gradient-to-r ${buttonColor} text-black hover:shadow-lg hover:shadow-primary/20` 
            : "bg-white/10 text-muted-foreground cursor-not-allowed"
        )}
      >
        <span>Done</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
