import { useState } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { MicroInput } from "@/components/wellwell/MicroInput";
import { Button } from "@/components/ui/button";
import { StoicCard } from "@/components/wellwell/StoicCard";
import { ActionChip } from "@/components/wellwell/ActionChip";
import { CardCarousel } from "@/components/wellwell/CardCarousel";
import { Sunrise, ArrowRight, Target, Shield, Compass, RotateCcw } from "lucide-react";
import { getTodayStance } from "@/data/dailyStances";

export default function Pulse() {
  const [challenge, setChallenge] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const todayStance = getTodayStance();

  if (!submitted) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col">
          <div className="text-center py-4 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-3">
              <Sunrise className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Morning Pulse</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">What might challenge you today?</h1>
          </div>
          <div className="flex-1 flex flex-col justify-center py-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <MicroInput placeholder="e.g., A difficult conversation" value={challenge} onChange={(e) => setChallenge(e.target.value)} onKeyDown={(e) => e.key === "Enter" && challenge.trim() && setSubmitted(true)} />
          </div>
          <div className="text-center py-2 animate-fade-up" style={{ animationDelay: "150ms" }}>
            <p className="text-xs text-muted-foreground">Today: <span className="text-foreground">"{todayStance.stance}"</span></p>
          </div>
          <div className="py-4 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <Button variant="brand" size="lg" className="w-full" onClick={() => setSubmitted(true)} disabled={!challenge.trim()}>Get My Stance<ArrowRight className="w-4 h-4" /></Button>
          </div>
        </div>
      </Layout>
    );
  }

  const cards = [
    <StoicCard key="control" icon={Target} title="Control" className="h-full flex flex-col"><p className="text-muted-foreground text-sm flex-1">You cannot control their reaction, only your preparation and composure.</p><p className="text-foreground font-medium text-sm mt-2">Focus on: Your tone, timing, intent.</p></StoicCard>,
    <StoicCard key="virtue" icon={Shield} title="Virtue" className="h-full flex flex-col"><p className="text-muted-foreground text-sm flex-1"><span className="text-primary font-medium">Courage</span> to speak truth. <span className="text-primary font-medium">Justice</span> to be fair.</p><p className="text-foreground font-medium text-sm mt-2">Lead with: Courage.</p></StoicCard>,
    <StoicCard key="stance" icon={Compass} title="Your Stance" className="h-full flex flex-col"><p className="text-foreground font-medium text-base flex-1">"I will enter with clarity and listen with intention."</p><div className="mt-3"><ActionChip action="Before speaking, take one breath." duration="3s" /></div></StoicCard>,
  ];

  return (
    <Layout>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="text-center py-3 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-2">
            <Sunrise className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Your Stance</span>
          </div>
        </div>
        <CardCarousel className="flex-1 min-h-0 animate-fade-up" style={{ animationDelay: "100ms" }}>{cards}</CardCarousel>
        <div className="py-3 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <Button variant="outline" size="lg" className="w-full" onClick={() => { setChallenge(""); setSubmitted(false); }}><RotateCcw className="w-4 h-4" />New Challenge</Button>
        </div>
      </div>
    </Layout>
  );
}
