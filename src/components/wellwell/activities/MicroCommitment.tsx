import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Send, Clock, Calendar, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface MicroCommitmentProps {
  prompt: string;
  onComplete: (response: { commitment: string; timeframe: 'today' | 'this_week' | 'ongoing' }) => void;
  onSkip?: () => void;
  isSubmitting?: boolean;
}

const timeframes = [
  { value: 'today' as const, label: 'Today', icon: Clock, description: 'Just for today' },
  { value: 'this_week' as const, label: 'This Week', icon: Calendar, description: 'For the next 7 days' },
  { value: 'ongoing' as const, label: 'Ongoing', icon: Target, description: 'As a new practice' },
];

export function MicroCommitment({ prompt, onComplete, onSkip, isSubmitting }: MicroCommitmentProps) {
  const [commitment, setCommitment] = useState("");
  const [timeframe, setTimeframe] = useState<'today' | 'this_week' | 'ongoing'>('today');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (commitment.trim()) {
      onComplete({ commitment: commitment.trim(), timeframe });
    }
  };

  const suggestions = [
    "Take 3 mindful breaths before responding to stress",
    "Notice one moment of gratitude",
    "Let go of one thing I can't control",
    "Speak with patience in conversations",
    "Take a 5-minute walking break",
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setCommitment(suggestion);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col gap-5"
    >
      {/* Icon */}
      <motion.div 
        className="flex justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/20">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
      </motion.div>

      {/* Prompt */}
      <motion.h2 
        className="text-xl font-display font-semibold text-center text-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {prompt}
      </motion.h2>

      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={cn(
          "relative rounded-2xl transition-all duration-300",
          isFocused 
            ? "ring-2 ring-green-500/50 shadow-lg shadow-green-500/10" 
            : "ring-1 ring-white/10"
        )}
      >
        <textarea
          value={commitment}
          onChange={(e) => setCommitment(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="I will..."
          rows={3}
          className="w-full bg-white/5 rounded-2xl p-4 text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none"
        />
      </motion.div>

      {/* Quick suggestions */}
      {!commitment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <p className="text-xs text-muted-foreground text-center">Quick ideas:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.slice(0, 3).map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1.5 rounded-full text-xs bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
              >
                {suggestion.length > 30 ? suggestion.slice(0, 30) + "..." : suggestion}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Timeframe selection */}
      {commitment && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p className="text-sm text-muted-foreground text-center">For how long?</p>
          <div className="flex gap-2">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 p-3 rounded-xl transition-all",
                  timeframe === tf.value 
                    ? "bg-green-500/20 ring-1 ring-green-500/50" 
                    : "bg-white/5 hover:bg-white/10"
                )}
              >
                <tf.icon className={cn(
                  "w-5 h-5",
                  timeframe === tf.value ? "text-green-400" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  timeframe === tf.value ? "text-green-400" : "text-muted-foreground"
                )}>
                  {tf.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
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
          onClick={handleSubmit}
          disabled={!commitment.trim() || isSubmitting}
          className={cn(
            "flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
            commitment.trim() 
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-black hover:shadow-lg hover:shadow-green-500/20" 
              : "bg-white/10 text-muted-foreground cursor-not-allowed"
          )}
        >
          <span>Commit</span>
          <Send className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}

