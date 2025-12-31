import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "./UpgradePrompt";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface UsageLimitGateProps {
  toolName: string;
  children: React.ReactNode;
  onLimitReached?: () => void;
}

export function UsageLimitGate({ toolName, children, onLimitReached }: UsageLimitGateProps) {
  const { canUse, usedToday, dailyLimit, isLoading: usageLoading } = useUsageLimit(toolName);
  const { isPro, isLoading: subLoading } = useSubscription();

  const isLoading = usageLoading || subLoading;

  // CRITICAL: Always render children to ensure hooks are called consistently
  // This prevents React hooks violations when loading state changes
  // Use overlay pattern for loading state instead of conditional rendering

  // While loading, always render children with loading overlay
  // This ensures hooks are called even during loading state
  if (isLoading) {
    return (
      <>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
        {children}
      </>
    );
  }

  // Pro users always have access
  if (isPro) {
    return <>{children}</>;
  }

  // Free users who have remaining uses - pass through without wrapping
  if (canUse) {
    return <>{children}</>;
  }

  // Free users who hit the limit - show upgrade prompt
  // Note: We don't render children here since they've hit the limit
  // This is fine because it's not a transient loading state
  return (
    <div className="flex-1 flex flex-col justify-center p-4">
      <UpgradePrompt 
        variant="card"
        title="Daily limit reached"
        description={`You've used your free ${toolName} for today. Upgrade to Pro for unlimited access.`}
        feature={toolName}
      />
    </div>
  );
}
