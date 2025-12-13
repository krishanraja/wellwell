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
  "1x Morning Pulse / day",
  "1x Intervene / day",
  "1x Debrief / day",
  "Basic virtue tracking",
  "Single persona",
];

const proFeatures = [
  "Unlimited AI rituals",
  "Weekly Reset synthesis",
  "Monthly Narrative",
  "Virtue history & trends",
  "Multiple personas",
  "Export your data",
  "Priority support",
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
      <div className="flex-1 flex flex-col py-4">
        <div className="text-center mb-6 animate-fade-up">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Choose Your Path</h1>
          <p className="text-muted-foreground text-sm">Build Stoic habits at your own pace</p>
        </div>

        <div className="space-y-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
          {/* Free Plan */}
          <div className={`p-5 rounded-2xl border ${!isPro ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Free</h3>
                <p className="text-2xl font-bold text-foreground">$0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              </div>
              {!isPro && (
                <span className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
                  Current
                </span>
              )}
            </div>
            <ul className="space-y-2">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Plan */}
          <div className={`p-5 rounded-2xl border ${isPro ? 'border-primary bg-primary/5' : 'border-border bg-card'} relative overflow-hidden`}>
            {!isPro && (
              <div className="absolute top-0 right-0 bg-brand-gradient text-background text-xs font-medium px-3 py-1 rounded-bl-lg">
                Recommended
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  Pro <Sparkles className="w-4 h-4 text-primary" />
                </h3>
                <p className="text-2xl font-bold text-foreground">$2<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              </div>
              {isPro && (
                <span className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
                  Current
                </span>
              )}
            </div>
            <ul className="space-y-2 mb-4">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            {isPro ? (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleManage}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Manage Subscription"}
              </Button>
            ) : (
              <Button 
                variant="brand" 
                className="w-full" 
                onClick={handleUpgrade}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Upgrade to Pro
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
          Cancel anytime. Powered by Stripe.
        </p>
      </div>
    </Layout>
  );
}
