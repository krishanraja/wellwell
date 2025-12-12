import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "./UpgradePrompt";
import { Loader2 } from "lucide-react";

interface ProFeatureGateProps {
  children: React.ReactNode;
  featureName: string;
  description?: string;
}

export function ProFeatureGate({ children, featureName, description }: ProFeatureGateProps) {
  const { isPro, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div className="flex-1 flex flex-col justify-center p-4">
      <UpgradePrompt 
        variant="card"
        title={`Unlock ${featureName}`}
        description={description || `${featureName} is a Pro feature. Upgrade to access weekly insights and deep pattern analysis.`}
        feature={featureName}
      />
    </div>
  );
}
