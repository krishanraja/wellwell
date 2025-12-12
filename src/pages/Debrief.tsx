import { useState } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { MicroInput } from "@/components/wellwell/MicroInput";
import { Button } from "@/components/ui/button";
import { StoicCard } from "@/components/wellwell/StoicCard";
import { VirtueBar } from "@/components/wellwell/VirtueBar";
import { CardCarousel } from "@/components/wellwell/CardCarousel";
import { UsageLimitGate } from "@/components/wellwell/UsageLimitGate";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { Moon, ArrowRight, TrendingUp, TrendingDown, Minus, Target, RotateCcw } from "lucide-react";

const questions = [
  { key: "controlled", label: "What did you control well today?" },
  { key: "escaped", label: "What escaped your control?" },
  { key: "tomorrow", label: "One thing to do differently tomorrow?" },
];

export default function Debrief() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const { trackUsage } = useUsageLimit("debrief");

  const handleContinue = async () => {
    if (currentAnswer.trim()) {
      const newAnswers = { ...answers, [questions[step].key]: currentAnswer };
      setAnswers(newAnswers);
      setCurrentAnswer("");
      
      // Track usage on the last question
      if (step === questions.length - 1) {
        await trackUsage();
      }
      
      setStep(step + 1);
    }
  };

  const isComplete = step >= questions.length;
  const virtueDeltas = { courage: 2, temperance: -1, justice: 0, wisdom: 3 };
  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp className="w-3 h-3 text-primary" />;
    if (delta < 0) return <TrendingDown className="w-3 h-3 text-coral" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  if (!isComplete) {
    return (
      <Layout>
        <UsageLimitGate toolName="debrief">
          <div className="flex-1 flex flex-col">
            <div className="text-center py-4 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cinder/10 rounded-full mb-3">
                <Moon className="w-4 h-4 text-cinder" />
                <span className="text-sm font-medium text-cinder">Evening Debrief</span>
              </div>
              <h1 className="font-display text-xl font-bold text-foreground">{questions[step].label}</h1>
            </div>
            <div className="flex gap-2 py-2 animate-fade-up" style={{ animationDelay: "50ms" }}>
              {questions.map((_, i) => <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= step ? "bg-brand-gradient" : "bg-muted"}`} />)}
            </div>
            <div className="flex-1 flex flex-col justify-center py-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
              <MicroInput placeholder="Reflect honestly..." value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleContinue()} />
            </div>
            <div className="py-4 animate-fade-up" style={{ animationDelay: "150ms" }}>
              <Button variant="brand" size="lg" className="w-full" onClick={handleContinue} disabled={!currentAnswer.trim()}>{step < questions.length - 1 ? "Continue" : "Complete"}<ArrowRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </UsageLimitGate>
      </Layout>
    );
  }

  const cards = [
    <StoicCard key="summary" icon={Moon} title="Day Summary" className="h-full flex flex-col"><div className="space-y-2 text-sm flex-1"><p className="text-muted-foreground">Controlled well:</p><p className="text-foreground">{answers.controlled}</p></div></StoicCard>,
    <StoicCard key="virtues" icon={Target} title="Virtue Movement" className="h-full flex flex-col"><div className="grid grid-cols-2 gap-2 mb-3">{Object.entries(virtueDeltas).map(([virtue, delta]) => (<div key={virtue} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">{getDeltaIcon(delta)}<span className="text-sm capitalize text-foreground">{virtue}</span><span className={`text-xs ml-auto ${delta > 0 ? "text-primary" : delta < 0 ? "text-coral" : "text-muted-foreground"}`}>{delta > 0 ? `+${delta}` : delta}</span></div>))}</div><VirtueBar courage={65} temperance={72} justice={58} wisdom={80} compact /></StoicCard>,
    <StoicCard key="tomorrow" icon={Target} title="Tomorrow's Focus" className="h-full flex flex-col"><p className="text-foreground font-medium flex-1">"{answers.tomorrow}"</p></StoicCard>,
  ];

  return (
    <Layout>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="text-center py-3 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-2">
            <Moon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Debrief Complete</span>
          </div>
        </div>
        <CardCarousel className="flex-1 min-h-0 animate-fade-up" style={{ animationDelay: "100ms" }}>{cards}</CardCarousel>
        <div className="py-3 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <Button variant="outline" size="lg" className="w-full" onClick={() => { setStep(0); setAnswers({}); setCurrentAnswer(""); }}><RotateCcw className="w-4 h-4" />New Debrief</Button>
        </div>
      </div>
    </Layout>
  );
}
