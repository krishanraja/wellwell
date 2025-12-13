import { forwardRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogoFull } from "@/components/wellwell/Header";
import { ArrowRight, Shield, Zap, Brain, Sparkles, Quote, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import SplashScreen from "@/components/wellwell/SplashScreen";

const testimonials = [
  {
    quote: "Finally, philosophy that actually works in the moment.",
    author: "Product Manager",
  },
  {
    quote: "60 seconds to clarity. It's become my morning ritual.",
    author: "Startup Founder",
  },
  {
    quote: "The Intervene feature has saved me from countless reactive emails.",
    author: "Team Lead",
  },
];

const Landing = forwardRef<HTMLDivElement>((_, ref) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [insightsCount, setInsightsCount] = useState<number>(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { count, error } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true });
        if (!error && count) {
          setInsightsCount(count);
        }
      } catch {
        // Silently fail - this is non-critical marketing data
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div ref={ref} className="viewport-container bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const features = [
    { icon: Zap, title: "60 seconds", desc: "to clarity" },
    { icon: Brain, title: "Stoicism,", desc: "AI'd for you" },
    { icon: Shield, title: "Track", desc: "4 virtues" },
    { icon: Sparkles, title: "Personalized", desc: "insights" },
  ];

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      
      <div ref={ref} className="h-[100dvh] flex flex-col overflow-hidden">
        {/* Background layers */}
        <div className="fixed inset-0 -z-20 bg-[hsl(165_20%_13%)]" />
        
        <img
          src="/video-poster.jpg"
          alt=""
          className="fixed inset-0 w-full h-full object-cover -z-10 opacity-60"
          loading="eager"
          fetchPriority="high"
        />

        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="fixed inset-0 w-full h-full object-cover -z-10 opacity-0 transition-opacity duration-700"
          onLoadedData={(e) => {
            (e.target as HTMLVideoElement).classList.remove('opacity-0');
            (e.target as HTMLVideoElement).classList.add('opacity-60');
          }}
        >
          <source src="/videos/Wellwell_video.mp4" type="video/mp4" />
        </video>

        {/* Content - fixed height, no scroll */}
        <div className="flex-1 flex flex-col px-6 py-6 safe-area-top safe-area-bottom bg-[hsl(165_20%_13%/0.75)] backdrop-blur-md overflow-hidden">
          {/* Hero Section */}
          <div className="flex flex-col items-center text-center">
            <div className="animate-fade-up">
              <LogoFull className="h-40 sm:h-48 mx-auto mb-2" />
            </div>

            <div className="space-y-1 animate-fade-up" style={{ animationDelay: "100ms" }}>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-[hsl(160_20%_95%)] leading-tight">
                Think clearly<br />
                <span className="gradient-text">under pressure</span>
              </h1>
              <p className="text-sm text-[hsl(160_15%_75%)] max-w-xs mx-auto">
                Stoic philosophy, tailored to your feelings.
              </p>
            </div>

            {insightsCount > 0 && (
              <div className="mt-3 animate-fade-up" style={{ animationDelay: "150ms" }}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                  <Users className="w-3 h-3 text-primary" />
                  <span className="text-xs text-primary font-medium">
                    {insightsCount.toLocaleString()}+ insights generated
                  </span>
                </div>
              </div>
            )}

            <div className="mt-3 animate-fade-up" style={{ animationDelay: "200ms" }}>
              <Button
                variant="brand"
                size="lg"
                onClick={() => navigate("/auth")}
              >
                Give It A Try
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-4">
            <div className="grid grid-cols-4 gap-2 animate-fade-up" style={{ animationDelay: "300ms" }}>
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="flex flex-col items-center text-center p-2"
                  style={{ animationDelay: `${350 + index * 50}ms` }}
                >
                  <div className="p-2 rounded-xl bg-primary/10 mb-1">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-[10px] font-medium text-[hsl(160_20%_95%)] leading-tight">
                    {feature.title}
                  </span>
                  <span className="text-[10px] text-[hsl(160_15%_70%)]">
                    {feature.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial Carousel */}
          <div className="mt-4 animate-fade-up" style={{ animationDelay: "400ms" }}>
            <div className="text-center">
              <Quote className="w-4 h-4 text-primary/50 mx-auto mb-1" />
              <p className="text-sm text-[hsl(160_20%_95%)] italic">
                "{testimonials[currentTestimonial].quote}"
              </p>
              <p className="text-xs text-primary mt-1">
                — {testimonials[currentTestimonial].author}
              </p>
            </div>
            <div className="flex justify-center gap-1.5 mt-2">
              {testimonials.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === currentTestimonial ? 'bg-primary' : 'bg-muted'
                  }`} 
                />
              ))}
            </div>
          </div>

          {/* Footer - pushed to bottom */}
          <div className="mt-auto pt-4 text-center animate-fade-up" style={{ animationDelay: "500ms" }}>
            <p className="text-xs text-[hsl(160_15%_75%)] mb-2">
              Free to start. No credit card required.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="text-xs text-primary font-medium hover:underline"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

Landing.displayName = "Landing";

export default Landing;
