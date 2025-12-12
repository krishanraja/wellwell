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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Pro users always have access
  if (isPro) {
    return <>{children}</>;
  }

  // Free users who have remaining uses
  if (canUse) {
    return (
      <>
        {children}
        {dailyLimit !== Infinity && (
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground">
              {dailyLimit - usedToday} of {dailyLimit} free {dailyLimit === 1 ? 'use' : 'uses'} remaining today
            </p>
          </div>
        )}
      </>
    );
  }

  // Free users who hit the limit
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
