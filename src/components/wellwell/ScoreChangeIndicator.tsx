import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Flame, Sparkles, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreChange {
  delta: number;
  source: string;
  sourceType: string;
}

interface ScoreChangeIndicatorProps {
  change: ScoreChange | null;
  show: boolean;
  onComplete?: () => void;
}

/**
 * ScoreChangeIndicator
 * 
 * Shows a brief, beautiful animation when the user's practice score changes.
 * Displayed as a toast/notification that auto-dismisses.
 */
export function ScoreChangeIndicator({ change, show, onComplete }: ScoreChangeIndicatorProps) {
  if (!change) return null;

  const isPositive = change.delta > 0;

  // Icon based on source type
  const getIcon = () => {
    switch (change.sourceType) {
      case 'morning_pulse':
      case 'evening_debrief':
        return Sparkles;
      case 'streak_bonus':
        return Flame;
      case 'micro_commitment':
        return CheckCircle;
      default:
        return isPositive ? TrendingUp : TrendingDown;
    }
  };

  const Icon = getIcon();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onAnimationComplete={() => {
            // Auto-dismiss after showing
            setTimeout(() => onComplete?.(), 2000);
          }}
          className={cn(
            "fixed bottom-24 left-1/2 -translate-x-1/2 z-50",
            "flex items-center gap-3 px-4 py-3 rounded-2xl",
            "backdrop-blur-lg shadow-lg",
            isPositive 
              ? "bg-green-500/20 border border-green-500/30 shadow-green-500/20" 
              : "bg-red-500/20 border border-red-500/30 shadow-red-500/20"
          )}
        >
          {/* Icon with animation */}
          <motion.div
            initial={{ scale: 0.5, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring" }}
            className={cn(
              "p-2 rounded-xl",
              isPositive ? "bg-green-500/30" : "bg-red-500/30"
            )}
          >
            <Icon className={cn(
              "w-5 h-5",
              isPositive ? "text-green-400" : "text-red-400"
            )} />
          </motion.div>

          {/* Content */}
          <div className="flex flex-col">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-2"
            >
              <span className={cn(
                "font-semibold",
                isPositive ? "text-green-400" : "text-red-400"
              )}>
                {isPositive ? '+' : ''}{change.delta} points
              </span>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-muted-foreground"
            >
              {change.source}
            </motion.p>
          </div>

          {/* Animated sparkle effect for positive changes */}
          {isPositive && (
            <motion.div
              className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-green-400 rounded-full"
                  initial={{ 
                    x: '50%', 
                    y: '50%', 
                    opacity: 1,
                    scale: 0,
                  }}
                  animate={{ 
                    x: `${30 + i * 20}%`, 
                    y: `${20 + (i % 2) * 60}%`, 
                    opacity: 0,
                    scale: 2,
                  }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 0.3 + i * 0.1,
                    ease: "easeOut",
                  }}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * PracticeScoreBadge
 * 
 * A compact badge showing current practice score with trend indicator.
 * Used in Profile and navigation areas.
 */
interface PracticeScoreBadgeProps {
  score: number;
  trend?: 'up' | 'down' | 'stable';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onClick?: () => void;
}

export function PracticeScoreBadge({ 
  score, 
  trend = 'stable', 
  size = 'md', 
  showLabel = false,
  onClick,
}: PracticeScoreBadgeProps) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-lg',
    lg: 'w-20 h-20 text-2xl',
  };

  const getScoreColor = () => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-primary to-cyan-500';
    if (score >= 40) return 'from-amber-500 to-yellow-500';
    return 'from-red-500 to-orange-500';
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "relative flex flex-col items-center gap-1",
        onClick && "cursor-pointer hover:scale-105 transition-transform"
      )}
    >
      {/* Score circle */}
      <div 
        className={cn(
          "relative flex items-center justify-center rounded-full",
          "bg-gradient-to-br shadow-lg",
          getScoreColor(),
          sizeClasses[size]
        )}
        style={{
          boxShadow: `0 4px 20px ${score >= 60 ? 'hsl(166 100% 50% / 0.3)' : 'hsl(45 100% 60% / 0.3)'}`,
        }}
      >
        <span className="font-bold text-black">{score}</span>
        
        {/* Trend indicator */}
        {TrendIcon && (
          <div className={cn(
            "absolute -top-1 -right-1 p-0.5 rounded-full",
            trend === 'up' ? "bg-green-500" : "bg-red-500"
          )}>
            <TrendIcon className="w-3 h-3 text-black" />
          </div>
        )}
      </div>

      {/* Label */}
      {showLabel && (
        <span className="text-xs text-muted-foreground">Practice Score</span>
      )}
    </button>
  );
}

/**
 * ScoreBreakdown
 * 
 * Shows a detailed breakdown of recent score changes.
 * Used in Profile or a dedicated Score page.
 */
interface ScoreBreakdownProps {
  changes: ScoreChange[];
  currentScore: number;
}

export function ScoreBreakdown({ changes, currentScore }: ScoreBreakdownProps) {
  return (
    <div className="space-y-4">
      {/* Current score header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground">
            Practice Score
          </h3>
          <p className="text-sm text-muted-foreground">
            Based on your daily consistency
          </p>
        </div>
        <PracticeScoreBadge score={currentScore} size="lg" />
      </div>

      {/* Recent changes */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Recent Changes</h4>
        {changes.length === 0 ? (
          <p className="text-sm text-muted-foreground/70 italic">
            No changes yet today. Complete activities to build your score!
          </p>
        ) : (
          <div className="space-y-2">
            {changes.slice(0, 5).map((change, i) => {
              const isPositive = change.delta > 0;
              return (
                <div 
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                >
                  <span className="text-sm text-foreground">{change.source}</span>
                  <span className={cn(
                    "text-sm font-semibold",
                    isPositive ? "text-green-400" : "text-red-400"
                  )}>
                    {isPositive ? '+' : ''}{change.delta}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* How scoring works */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <h4 className="text-sm font-medium text-foreground mb-2">How Scoring Works</h4>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• Morning Pulse: +5 points</li>
          <li>• Evening Debrief: +5 points</li>
          <li>• Daily Check-ins: +3 points</li>
          <li>• Micro-commitments: +4 points</li>
          <li>• Streak milestones: +5 to +20 points</li>
          <li>• Inactivity: -2 points per day</li>
        </ul>
      </div>
    </div>
  );
}

