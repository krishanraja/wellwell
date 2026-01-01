import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, Heart, ArrowRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface WisdomCardProps {
  quote: string;
  author: string;
  onComplete: (response: { reflected: boolean; saved: boolean; quote: string }) => void;
  onSkip?: () => void;
  onRefresh?: () => void;
}

export function WisdomCard({ quote, author, onComplete, onSkip, onRefresh }: WisdomCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reflection, setReflection] = useState("");

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleContinue = () => {
    onComplete({ 
      reflected: reflection.length > 0, 
      saved: isSaved, 
      quote 
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
        className="flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 border border-purple-500/20">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Daily Wisdom</span>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </motion.div>

      {/* Quote Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isFlipped ? "back" : "front"}
            initial={{ rotateY: isFlipped ? -90 : 0, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: isFlipped ? 0 : 90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "rounded-2xl p-6 min-h-[200px] flex flex-col justify-center",
              "bg-gradient-to-br from-purple-900/30 via-violet-900/20 to-indigo-900/30",
              "border border-purple-500/20"
            )}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {!isFlipped ? (
              <>
                {/* Quote mark */}
                <Quote className="w-8 h-8 text-purple-400/30 absolute top-4 left-4" />
                
                {/* Quote text */}
                <p className="text-xl font-display font-medium text-foreground leading-relaxed text-center px-4">
                  "{quote}"
                </p>
                
                {/* Author */}
                <p className="text-sm text-purple-300 text-center mt-4">
                  — {author}
                </p>
                
                <p className="text-xs text-muted-foreground/50 text-center mt-4">
                  Tap to reflect
                </p>
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-purple-300 text-center">
                  How does this resonate with you today?
                </p>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Your reflection..."
                  rows={3}
                  className="w-full bg-black/20 rounded-xl p-3 text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  onClick={(e) => e.stopPropagation()}
                />
                <p className="text-xs text-muted-foreground/50 text-center">
                  Tap card to flip back
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Save button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={handleSave}
        className={cn(
          "flex items-center justify-center gap-2 py-2 rounded-xl transition-all",
          isSaved 
            ? "bg-pink-500/20 text-pink-400" 
            : "bg-white/5 text-muted-foreground hover:text-foreground"
        )}
      >
        <Heart className={cn("w-4 h-4", isSaved && "fill-current")} />
        <span className="text-sm">{isSaved ? "Saved to favorites" : "Save this wisdom"}</span>
      </motion.button>

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
          className="flex-1 py-3 rounded-xl font-medium bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:shadow-lg hover:shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}

