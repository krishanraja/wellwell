import { useState } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { MicroInput } from "@/components/wellwell/MicroInput";
import { IntensitySlider } from "@/components/wellwell/IntensitySlider";
import { Button } from "@/components/ui/button";
import { StoicCard } from "@/components/wellwell/StoicCard";
import { ActionChip } from "@/components/wellwell/ActionChip";
import { CardCarousel } from "@/components/wellwell/CardCarousel";
import { Flame, ArrowRight, RefreshCw, Target, Shield, RotateCcw } from "lucide-react";

export default function Intervene() {
  const [trigger, setTrigger] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  if (!submitted) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col">
          <div className="text-center py-4 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-coral/10 rounded-full mb-3">
              <Flame className="w-4 h-4 text-coral" />
              <span className="text-sm font-medium text-coral">Intervene</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">What triggered you?</h1>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-6 py-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <MicroInput placeholder="e.g., An email that made me furious" value={trigger} onChange={(e) => setTrigger(e.target.value)} />
            <div>
              <p className="text-sm text-muted-foreground mb-3">Intensity: <span className="text-foreground font-medium">{intensity}/10</span></p>
              <IntensitySlider value={intensity} onChange={setIntensity} />
            </div>
          </div>
          <div className="py-4 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <Button variant="brand" size="lg" className="w-full" onClick={() => setSubmitted(true)} disabled={!trigger.trim()}>Recalibrate<ArrowRight className="w-4 h-4" /></Button>
          </div>
        </div>
      </Layout>
    );
  }

  const cards = [
    <StoicCard key="rewrite" icon={RefreshCw} title="Rewrite" className="h-full flex flex-col"><p className="text-muted-foreground text-sm"><span className="text-foreground font-medium">Reframe:</span> Their words reveal their stress, not your worth.</p></StoicCard>,
    <StoicCard key="control" icon={Target} title="Control" className="h-full flex flex-col"><p className="text-sm"><span className="text-coral font-medium">Not yours:</span> <span className="text-muted-foreground">Their tone, urgency.</span></p><p className="text-sm mt-2"><span className="text-primary font-medium">Yours:</span> <span className="text-muted-foreground">Your response, your state.</span></p></StoicCard>,
    <StoicCard key="virtue" icon={Shield} title="Virtue Call" className="h-full flex flex-col"><p className="text-muted-foreground text-sm flex-1"><span className="text-primary font-medium">Temperance</span>: respond with measure.</p><div className="mt-3"><ActionChip action="Wait 10 minutes before responding." duration="10m" /></div></StoicCard>,
  ];

  return (
    <Layout>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="text-center py-3 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-coral/10 rounded-full mb-2">
            <Flame className="w-4 h-4 text-coral" />
            <span className="text-sm font-medium text-coral">Recalibrating</span>
          </div>
        </div>
        <CardCarousel className="flex-1 min-h-0 animate-fade-up" style={{ animationDelay: "100ms" }}>{cards}</CardCarousel>
        <div className="py-3 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <Button variant="outline" size="lg" className="w-full" onClick={() => { setTrigger(""); setIntensity(5); setSubmitted(false); }}><RotateCcw className="w-4 h-4" />New Trigger</Button>
        </div>
      </div>
    </Layout>
  );
}
