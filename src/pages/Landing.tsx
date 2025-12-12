import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { LogoFull } from "@/components/wellwell/Header";
import { ArrowRight, Shield, Zap, Brain, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const Landing = forwardRef<HTMLDivElement>((_, ref) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div ref={ref} className="viewport-container bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const features = [
    { icon: Zap, title: "60 seconds", desc: "to clarity" },
    { icon: Brain, title: "AI-powered", desc: "stoic wisdom" },
    { icon: Shield, title: "Track", desc: "4 virtues" },
    { icon: Sparkles, title: "Personalized", desc: "insights" },
  ];

  return (
    <div ref={ref} className="viewport-container overflow-hidden">
      {/* Instant background fallback */}
      <div className="fixed inset-0 -z-20 bg-[hsl(165_20%_13%)]" />
      
      {/* Poster image - loads instantly via preload */}
      <img
        src="/video-poster.jpg"
        alt=""
        className="fixed inset-0 w-full h-full object-cover -z-10 opacity-60"
        loading="eager"
        fetchPriority="high"
      />
      
      {/* Video Background - fades in over poster */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="fixed inset-0 w-full h-full object-cover -z-10 opacity-0 transition-opacity duration-700"
        onLoadedData={(e) => {
          console.log('[Landing] Video loaded successfully');
          (e.target as HTMLVideoElement).classList.remove('opacity-0');
          (e.target as HTMLVideoElement).classList.add('opacity-60');
        }}
        onError={(e) => console.error('[Landing] Video failed to load:', e)}
      >
        <source src="/videos/Wellwell_video.mp4" type="video/mp4" />
      </video>

      {/* Single-screen content */}
      <div className="flex-1 flex flex-col px-6 py-8 safe-area-top safe-area-bottom bg-[hsl(165_20%_13%/0.75)] backdrop-blur-md">
        {/* Hero Section - 50% */}
        <div className="flex-1 flex flex-col items-center justify-center text-center min-h-0">
          <div className="animate-fade-up">
            <LogoFull className="h-32 sm:h-36 mx-auto mb-4" />
          </div>

          <div className="space-y-3 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[hsl(160_20%_95%)] leading-tight">
              Think clearly<br />
              <span className="gradient-text">under pressure</span>
            </h1>
            <p className="text-base text-[hsl(160_15%_75%)] max-w-xs mx-auto">
              Stoic philosophy in your pocket. No quotes. No journaling. Just clarity.
            </p>
          </div>

          <div className="mt-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <Button
              variant="brand"
              size="lg"
              onClick={() => navigate("/auth")}
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Features Grid - 35% */}
        <div className="py-6">
          <div className="grid grid-cols-4 gap-2 animate-fade-up" style={{ animationDelay: "300ms" }}>
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center p-2"
                style={{ animationDelay: `${350 + index * 50}ms` }}
              >
                <div className="p-2 rounded-xl bg-primary/10 mb-2">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-[hsl(160_20%_95%)] leading-tight">
                  {feature.title}
                </span>
                <span className="text-xs text-[hsl(160_15%_70%)]">
                  {feature.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer - 15% */}
        <div className="text-center pb-4 animate-fade-up" style={{ animationDelay: "500ms" }}>
          <p className="text-sm text-[hsl(160_15%_75%)] mb-3">
            Free to start. No credit card required.
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="text-sm text-primary font-medium hover:underline [text-shadow:0_1px_3px_hsl(187_100%_50%/0.3)]"
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </div>
  );
});

Landing.displayName = "Landing";

export default Landing;
