import { motion } from "framer-motion";
import { Flame, Trophy, Star, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCelebrationProps {
  streakDays: number;
  milestone: number; // The milestone reached (7, 14, 30, 60, 90)
  onComplete: (response: { celebrated: boolean; setIntention?: string }) => void;
}

const milestoneConfig: Record<number, { title: string; message: string; icon: typeof Trophy }> = {
  7: { 
    title: "One Week Strong!", 
    message: "You've built momentum. The first week is often the hardest - you've proven you can do this.",
    icon: Star 
  },
  14: { 
    title: "Two Weeks of Wisdom!", 
    message: "Consistency is becoming a habit. You're training your mind like a muscle.",
    icon: Star 
  },
  30: { 
    title: "30 Days of Stoic Practice!", 
    message: "A month of intentional living. You've planted seeds that will grow into lasting change.",
    icon: Trophy 
  },
  60: { 
    title: "60 Days - A New You!", 
    message: "Two months of dedicated practice. This is no longer a habit - it's becoming who you are.",
    icon: Trophy 
  },
  90: { 
    title: "90 Days - Master in Training!", 
    message: "A quarter of deep practice. The ancient Stoics would be proud of your dedication.",
    icon: Trophy 
  },
};

export function StreakCelebration({ streakDays, milestone, onComplete }: StreakCelebrationProps) {
  const config = milestoneConfig[milestone] || milestoneConfig[7];

  const handleContinue = () => {
    onComplete({ celebrated: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center gap-6"
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-orange-500/20 via-transparent to-transparent blur-3xl" />
      </motion.div>

      {/* Confetti-like particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ['hsl(45 100% 60%)', 'hsl(8 100% 65%)', 'hsl(187 100% 50%)', 'hsl(260 80% 65%)'][i % 4],
          }}
          initial={{ 
            opacity: 0,
            x: 0,
            y: 0,
          }}
          animate={{ 
            opacity: [0, 1, 0],
            x: Math.cos((i * 30) * Math.PI / 180) * 100,
            y: Math.sin((i * 30) * Math.PI / 180) * 100 - 50,
          }}
          transition={{
            duration: 1.5,
            delay: 0.5 + i * 0.1,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Main icon with animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 15,
          delay: 0.2 
        }}
        className="relative"
      >
        <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-500/30 to-amber-500/20 border border-orange-500/30">
          <Flame className="w-16 h-16 text-orange-400" />
        </div>
        
        {/* Streak number badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="absolute -top-2 -right-2 bg-orange-500 text-black font-bold text-lg w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50"
        >
          {streakDays}
        </motion.div>

        {/* Animated sparkles around icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 pointer-events-none"
        >
          {[0, 90, 180, 270].map((deg, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3"
              style={{
                top: `calc(50% + ${Math.sin(deg * Math.PI / 180) * 60}px)`,
                left: `calc(50% + ${Math.cos(deg * Math.PI / 180) * 60}px)`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Sparkles className="w-3 h-3 text-yellow-400" />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-display font-bold text-center text-transparent bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text"
      >
        {config.title}
      </motion.h2>

      {/* Day count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-2 text-orange-400"
      >
        <Flame className="w-5 h-5" />
        <span className="font-display font-semibold">{streakDays} days straight</span>
      </motion.div>

      {/* Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-foreground/80 leading-relaxed max-w-xs"
      >
        {config.message}
      </motion.p>

      {/* Continue button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        onClick={handleContinue}
        className="w-full max-w-xs py-4 rounded-2xl font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-black hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
      >
        <span>Keep the flame alive</span>
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
}

