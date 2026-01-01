import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReflectionPromptProps {
  prompt: string;
  onSubmit: (response: string) => void;
  onSkip?: () => void;
  isSubmitting?: boolean;
}

export function ReflectionPrompt({ prompt, onSubmit, onSkip, isSubmitting }: ReflectionPromptProps) {
  const [response, setResponse] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (response.trim()) {
      onSubmit(response.trim());
    }
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
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20">
          <MessageSquare className="w-8 h-8 text-amber-400" />
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
            ? "ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/10" 
            : "ring-1 ring-white/10"
        )}
      >
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Share your thoughts..."
          rows={4}
          className="w-full bg-white/5 rounded-2xl p-4 text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none"
        />
        
        {/* Character hint */}
        <div className="absolute bottom-3 left-4 text-xs text-muted-foreground/50">
          {response.length > 0 && <span>{response.split(/\s+/).filter(Boolean).length} words</span>}
        </div>

        {/* Sparkle indicator when typing */}
        {response.length > 20 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-3 right-3"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
          </motion.div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex gap-3"
      >
        {onSkip && (
          <button
            onClick={onSkip}
            className="flex-1 py-3 rounded-xl text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            Skip for now
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!response.trim() || isSubmitting}
          className={cn(
            "flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
            response.trim() 
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:shadow-lg hover:shadow-amber-500/20" 
              : "bg-white/10 text-muted-foreground cursor-not-allowed"
          )}
        >
          <span>Submit</span>
          <Send className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}

