import { useState } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { MicroInput } from "@/components/wellwell/MicroInput";
import { Button } from "@/components/ui/button";
import { StoicCard } from "@/components/wellwell/StoicCard";
import { VirtueBar } from "@/components/wellwell/VirtueBar";
import { CardCarousel } from "@/components/wellwell/CardCarousel";
import { UsageLimitGate } from "@/components/wellwell/UsageLimitGate";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useStoicAnalyzer } from "@/hooks/useStoicAnalyzer";
import { useVirtueScores } from "@/hooks/useVirtueScores";
import { useCrossSessionMemory } from "@/hooks/useCrossSessionMemory";
import { Moon, ArrowRight, TrendingUp, TrendingDown, Minus, Target, RotateCcw, Loader2, Sunrise } from "lucide-react";

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
  const { analyze, isLoading, response, reset } = useStoicAnalyzer();
  const { scoresMap } = useVirtueScores();
  const { todayMorning } = useCrossSessionMemory();

  const handleContinue = async () => {
    if (currentAnswer.trim()) {
      const newAnswers = { ...answers, [questions[step].key]: currentAnswer };
      setAnswers(newAnswers);
      setCurrentAnswer("");
      
      // On last question, call AI
      if (step === questions.length - 1) {
        await trackUsage();
        await analyze({
          tool: "debrief",
          input: JSON.stringify(newAnswers),
        });
      }
      
      setStep(step + 1);
    }
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({});
    setCurrentAnswer("");
    reset();
  };

  const isComplete = step >= questions.length;
  
  // Get real virtue deltas from AI response or fallback to empty
  const virtueDeltas = response?.virtue_updates?.reduce((acc, update) => {
    acc[update.virtue as keyof typeof acc] = update.delta;
    return acc;
  }, { courage: 0, temperance: 0, justice: 0, wisdom: 0 }) || { courage: 0, temperance: 0, justice: 0, wisdom: 0 };

  // Get current virtue scores
  const currentVirtues = {
    courage: scoresMap.courage?.score || 50,
    temperance: scoresMap.temperance?.score || 50,
    justice: scoresMap.justice?.score || 50,
    wisdom: scoresMap.wisdom?.score || 50,
  };

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

            {/* Morning context - Cross-session memory */}
            {step === 0 && todayMorning.challenge && (
              <div className="px-4 py-3 bg-muted/50 rounded-xl mb-4 animate-fade-up" style={{ animationDelay: "50ms" }}>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Sunrise className="w-3 h-3" />
                  <span>This morning you anticipated:</span>
                </div>
                <p className="text-sm text-foreground line-clamp-2">{todayMorning.challenge}</p>
                {todayMorning.stance && (
                  <p className="text-xs text-primary mt-1">Stance: "{todayMorning.stance}"</p>
                )}
              </div>
            )}

            <div className="flex gap-2 py-2 animate-fade-up" style={{ animationDelay: "50ms" }}>
              {questions.map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= step ? "bg-brand-gradient" : "bg-muted"}`} 
                />
              ))}
            </div>
            <div className="flex-1 flex flex-col justify-center py-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
              <MicroInput 
                placeholder="Reflect honestly..." 
                value={currentAnswer} 
                onChange={(e) => setCurrentAnswer(e.target.value)} 
                onKeyDown={(e) => e.key === "Enter" && !isLoading && handleContinue()} 
              />
            </div>
            <div className="py-4 animate-fade-up" style={{ animationDelay: "150ms" }}>
              <Button 
                variant="brand" 
                size="lg" 
                className="w-full" 
                onClick={handleContinue} 
                disabled={!currentAnswer.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Reflecting...
                  </>
                ) : (
                  <>
                    {step < questions.length - 1 ? "Continue" : "Complete"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </UsageLimitGate>
      </Layout>
    );
  }

  // Show loading state while waiting for AI response
  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Synthesizing your day...</p>
        </div>
      </Layout>
    );
  }

  const cards = [
    <StoicCard key="summary" icon={Moon} title="Day Summary" className="h-full flex flex-col">
      <div className="space-y-2 text-sm flex-1">
        <p className="text-muted-foreground">{response?.summary || "You navigated today's challenges with awareness."}</p>
        <p className="text-foreground font-medium mt-3">Controlled well: {answers.controlled}</p>
      </div>
    </StoicCard>,
    <StoicCard key="virtues" icon={Target} title="Virtue Movement" className="h-full flex flex-col">
      <div className="grid grid-cols-2 gap-2 mb-3">
        {Object.entries(virtueDeltas).map(([virtue, delta]) => (
          <div key={virtue} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            {getDeltaIcon(delta)}
            <span className="text-sm capitalize text-foreground">{virtue}</span>
            <span className={`text-xs ml-auto ${delta > 0 ? "text-primary" : delta < 0 ? "text-coral" : "text-muted-foreground"}`}>
              {delta > 0 ? `+${delta}` : delta}
            </span>
          </div>
        ))}
      </div>
      <VirtueBar {...currentVirtues} compact />
    </StoicCard>,
    <StoicCard key="tomorrow" icon={Target} title="Tomorrow's Focus" className="h-full flex flex-col">
      <p className="text-foreground font-medium flex-1">
        "{response?.stance || answers.tomorrow}"
      </p>
      {response?.action && (
        <p className="text-sm text-primary mt-2">{response.action}</p>
      )}
    </StoicCard>,
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
          <Button variant="outline" size="lg" className="w-full" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
            New Debrief
          </Button>
        </div>
      </div>
    </Layout>
  );
}
