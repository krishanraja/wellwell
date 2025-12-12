import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface UpgradePromptProps {
  title?: string;
  description?: string;
  feature?: string;
  variant?: 'inline' | 'modal' | 'card';
  className?: string;
}

export function UpgradePrompt({
  title = "Unlock unlimited access",
  description = "Upgrade to Pro for unlimited rituals, weekly insights, and more.",
  feature,
  variant = 'inline',
  className = '',
}: UpgradePromptProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      logger.info('Creating checkout session');
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) {
        logger.error('Failed to create checkout', { error });
        toast.error('Failed to start checkout. Please try again.');
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      logger.error('Checkout error', { error: err });
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl ${className}`}>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {feature ? `${feature} is a Pro feature` : title}
          </p>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
        <Button 
          variant="brand" 
          size="sm" 
          onClick={handleUpgrade}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : '$2/mo'}
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-6 bg-gradient-to-br from-primary/10 via-background to-cinder/10 border border-primary/20 rounded-2xl ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">Pro Feature</span>
        </div>
        <h3 className="font-display text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        <Button 
          variant="brand" 
          size="lg" 
          className="w-full"
          onClick={handleUpgrade}
          disabled={isLoading}
        >
          <Sparkles className="w-4 h-4" />
          {isLoading ? 'Loading...' : 'Upgrade for $2/month'}
        </Button>
      </div>
    );
  }

  // modal variant
  return (
    <div className={`fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 ${className}`}>
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-primary/10 rounded-full mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-xs">✓</span>
            </div>
            <span className="text-foreground">Unlimited AI rituals</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-xs">✓</span>
            </div>
            <span className="text-foreground">Weekly Reset insights</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-xs">✓</span>
            </div>
            <span className="text-foreground">Monthly Narrative</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-xs">✓</span>
            </div>
            <span className="text-foreground">Virtue trends & history</span>
          </div>
        </div>

        <Button 
          variant="brand" 
          size="lg" 
          className="w-full"
          onClick={handleUpgrade}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Upgrade for $2/month'}
        </Button>
      </div>
    </div>
  );
}
