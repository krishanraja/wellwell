import { motion } from "framer-motion";
import { TrendingUp, ArrowRight, Lightbulb, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PatternInsightProps {
  pattern: {
    type: 'positive' | 'neutral' | 'growth';
    title: string;
    description: string;
    dataPoints?: string[];
    suggestion?: string;
  };
  onComplete: (response: { acknowledged: boolean; reflection?: string }) => void;
  onSkip?: () => void;
}

export function PatternInsight({ pattern, onComplete, onSkip }: PatternInsightProps) {
  const [showReflection, setShowReflection] = useState(false);
  const [reflection, setReflection] = useState("");

  const patternColors = {
    positive: { bg: "from-emerald-500/20 to-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400" },
    neutral: { bg: "from-sky-500/20 to-cyan-500/10", border: "border-sky-500/20", text: "text-sky-600 dark:text-sky-400" },
    growth: { bg: "from-amber-500/20 to-orange-500/10", border: "border-amber-500/20", text: "text-amber-600 dark:text-amber-400" },
  };

  const colors = patternColors[pattern.type];

  const handleContinue = () => {
    onComplete({ 
      acknowledged: true, 
      reflection: reflection.trim() || undefined 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col gap-5"
    >
      {/* Header */}
      <motion.div 
        className="flex items-center justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className={cn("p-2 rounded-xl bg-gradient-to-br", colors.bg, colors.border, "border")}>
          <TrendingUp className={cn("w-5 h-5", colors.text)} />
        </div>
        <span className="text-sm font-medium text-muted-foreground">Your Pattern</span>
      </motion.div>

      {/* Pattern Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "rounded-2xl p-6",
          "bg-gradient-to-br", colors.bg,
          colors.border, "border"
        )}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Lightbulb className={cn("w-12 h-12", colors.text)} />
          </motion.div>
        </div>

        {/* Title */}
        <h3 className={cn("text-lg font-display font-semibold text-center mb-2", colors.text)}>
          {pattern.title}
        </h3>

        {/* Description */}
        <p className="text-center text-foreground/80 leading-relaxed">
          {pattern.description}
        </p>

        {/* Data Points */}
        {pattern.dataPoints && pattern.dataPoints.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex flex-wrap gap-2 justify-center">
              {pattern.dataPoints.map((point, i) => (
                <span 
                  key={i}
                  className="px-2 py-1 rounded-full text-xs bg-foreground/10 text-muted-foreground"
                >
                  {point}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Suggestion */}
        {pattern.suggestion && (
          <div className="mt-4 p-3 rounded-xl bg-foreground/10">
            <p className="text-sm text-muted-foreground text-center italic">
              💡 {pattern.suggestion}
            </p>
          </div>
        )}
      </motion.div>

      {/* Reflection toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={() => setShowReflection(!showReflection)}
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>Add a reflection</span>
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform",
          showReflection && "rotate-180"
        )} />
      </motion.button>

      {/* Reflection input */}
      {showReflection && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="What does this pattern mean to you?"
            rows={2}
            className="w-full bg-muted/50 rounded-xl p-3 text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
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
          onClick={handleContinue}
          className="flex-1 py-3 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
        >
          <span>Got it</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}

