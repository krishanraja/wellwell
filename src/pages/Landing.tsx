import { Button } from "@/components/ui/button";
import { LogoFull } from "@/components/wellwell/Header";
import { ArrowRight, Shield, Zap, Brain, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const features = [
    {
      icon: Zap,
      title: "Seconds, not minutes",
      description: "Get clarity in under 60 seconds. No long journaling sessions."
    },
    {
      icon: Brain,
      title: "AI-powered Stoic wisdom",
      description: "Ancient philosophy meets modern intelligence for real guidance."
    },
    {
      icon: Shield,
      title: "Build mental resilience",
      description: "Track your growth across four cardinal virtues over time."
    },
    {
      icon: Sparkles,
      title: "Personalized insights",
      description: "Every response tailored to your context and patterns."
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <div className="relative px-6 pt-16 pb-24">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-glow opacity-50" />
        
        <div className="relative max-w-lg mx-auto text-center space-y-8">
          {/* Logo - 4X larger */}
          <div className="animate-fade-up">
            <LogoFull className="h-32 mx-auto mb-8" />
          </div>

          {/* Tagline */}
          <div className="space-y-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <h1 className="font-display text-4xl font-bold text-foreground leading-tight">
              Think clearly<br />
              <span className="gradient-text">under pressure</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-sm mx-auto">
              Stoic philosophy in your pocket. No quotes. No journaling. Just clarity when you need it most.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <Button
              variant="brand"
              size="lg"
              className="w-full max-w-xs"
              onClick={() => navigate("/auth")}
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
            <p className="text-sm text-muted-foreground">
              Free to start. No credit card required.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 pb-16">
        <div className="max-w-lg mx-auto space-y-6">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-center mb-8 animate-fade-up" style={{ animationDelay: "300ms" }}>
            Why WellWell?
          </h2>
          
          <div className="grid gap-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="stoic-card flex items-start gap-4 animate-fade-up"
                style={{ animationDelay: `${400 + index * 80}ms` }}
              >
                <div className="p-2 rounded-xl bg-primary/10">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-16">
        <div className="max-w-lg mx-auto text-center space-y-4 animate-fade-up" style={{ animationDelay: "700ms" }}>
          <p className="text-muted-foreground">
            Join thousands finding clarity daily
          </p>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/auth")}
          >
            Start Your Journey
          </Button>
        </div>
      </div>
    </div>
  );
}
