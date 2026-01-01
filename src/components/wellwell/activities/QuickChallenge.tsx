import { useState } from "react";
import { motion } from "framer-motion";
import { Target, CheckCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickChallengeProps {
  challenge: string;
  onComplete: (response: { items: string[]; completedAt: string }) => void;
  onSkip?: () => void;
  isSubmitting?: boolean;
}

export function QuickChallenge({ challenge, onComplete, onSkip, isSubmitting }: QuickChallengeProps) {
  const [items, setItems] = useState<string[]>(["", "", ""]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
    
    // Auto-advance when user types
    if (value.length > 0 && index === currentIndex && index < 2) {
      setTimeout(() => setCurrentIndex(index + 1), 300);
    }
  };

  const handleComplete = () => {
    const filledItems = items.filter(item => item.trim());
    if (filledItems.length > 0) {
      setIsCompleted(true);
      setTimeout(() => {
        onComplete({ items: filledItems, completedAt: new Date().toISOString() });
      }, 800);
    }
  };

  const filledCount = items.filter(item => item.trim()).length;

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
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/10 border border-primary/20">
          <Target className="w-8 h-8 text-primary" />
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

      {/* Input fields */}
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

      {/* Complete animation */}
      {isCompleted && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-2 text-primary"
          >
            <CheckCircle className="w-16 h-16" />
            <span className="font-display font-semibold">Nice work!</span>
          </motion.div>
        </motion.div>
      )}

      {/* Actions */}
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
          onClick={handleComplete}
          disabled={filledCount === 0 || isSubmitting || isCompleted}
          className={cn(
            "flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
            filledCount > 0 
              ? "bg-gradient-to-r from-primary to-cyan-400 text-black hover:shadow-lg hover:shadow-primary/20" 
              : "bg-white/10 text-muted-foreground cursor-not-allowed"
          )}
        >
          <span>Done</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}

