import { Layout } from "@/components/wellwell/Layout";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";

const freeFeatures = [
  "3x Morning Pulse / day",
  "3x Intervene / day",
  "3x Debrief / day",
  "Basic virtue tracking",
];

const proFeatures = [
  "Unlimited AI rituals",
  "Weekly Reset synthesis",
  "Monthly Narrative",
  "Virtue history & trends",
  "Multiple personas",
];

export default function Pricing() {
  const { isPro, isLoading, refreshSubscription } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      refreshSubscription();
      navigate("/pricing", { replace: true });
    }
  }, [searchParams, refreshSubscription, navigate]);

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      logger.info("Creating checkout session");
      const { data, error } = await supabase.functions.invoke("create-checkout");
      
      if (error) {
        logger.error("Failed to create checkout", { error });
        toast.error("Failed to start checkout. Please try again.");
        return;
      }

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      logger.error("Checkout error", { error: err });
      toast.error("Something went wrong. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManage = async () => {
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      
      if (error) {
        logger.error("Failed to open portal", { error });
        toast.error("Failed to open subscription management.");
        return;
      }

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      logger.error("Portal error", { error: err });
      toast.error("Something went wrong.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col py-2">
        <div className="text-center mb-3 animate-fade-up">
          <h1 className="font-display text-xl font-bold text-foreground mb-1">Choose Your Path</h1>
          <p className="text-muted-foreground text-xs">Build Stoic habits at your own pace</p>
        </div>

        <div className="space-y-2 animate-fade-up flex-1" style={{ animationDelay: "100ms" }}>
          {/* Free Plan */}
          <div className={`p-3 rounded-xl border ${!isPro ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-display text-base font-bold text-foreground">Free</h3>
                <p className="text-xl font-bold text-foreground">$0<span className="text-xs font-normal text-muted-foreground">/month</span></p>
              </div>
              {!isPro && (
                <span className="px-2 py-0.5 text-[10px] font-medium bg-primary/20 text-primary rounded-full">
                  Current
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              {freeFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className="truncate">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Plan */}
          <div className={`p-3 rounded-xl border ${isPro ? 'border-primary bg-primary/5' : 'border-border bg-card'} relative overflow-hidden`}>
            {!isPro && (
              <div className="absolute top-0 right-0 bg-brand-gradient text-background text-[10px] font-medium px-2 py-0.5 rounded-bl-lg">
                Recommended
              </div>
            )}
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-display text-base font-bold text-foreground flex items-center gap-1.5">
                  Pro <Sparkles className="w-3.5 h-3.5 text-primary" />
                </h3>
                <p className="text-xl font-bold text-foreground">$2<span className="text-xs font-normal text-muted-foreground">/month</span></p>
              </div>
              {isPro && (
                <span className="px-2 py-0.5 text-[10px] font-medium bg-primary/20 text-primary rounded-full">
                  Current
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-3">
              {proFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-1.5 text-xs text-foreground">
                  <Check className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className="truncate">{feature}</span>
                </div>
              ))}
            </div>
            {isPro ? (
              <Button 
                variant="outline" 
                className="w-full h-9 text-sm" 
                onClick={handleManage}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Manage Subscription"}
              </Button>
            ) : (
              <Button 
                variant="brand" 
                className="w-full h-9 text-sm" 
                onClick={handleUpgrade}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Upgrade to Pro
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-3 animate-fade-up" style={{ animationDelay: "200ms" }}>
          Cancel anytime. Powered by Stripe.
        </p>
      </div>
    </Layout>
  );
}
