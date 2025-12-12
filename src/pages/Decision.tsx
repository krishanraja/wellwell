import { useState } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { MicroInput } from "@/components/wellwell/MicroInput";
import { StoicCard, StoicCardHeader, StoicCardContent } from "@/components/wellwell/StoicCard";
import { ActionChip } from "@/components/wellwell/ActionChip";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Scale, Eye, Sparkles } from "lucide-react";
import { useStoicAnalyzer } from "@/hooks/useStoicAnalyzer";

export default function Decision() {
  const [decision, setDecision] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const { analyze, isLoading, response } = useStoicAnalyzer();

  const handleSubmit = async () => {
    if (decision.trim() && optionA.trim() && optionB.trim()) {
      await analyze({
        tool: "decision",
        input: `Decision: ${decision}\nOption A: ${optionA}\nOption B: ${optionB}`,
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-up">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Decision Engine
          </h1>
          <p className="text-muted-foreground">
            Break down difficult choices with Stoic clarity.
          </p>
        </div>

        {!response ? (
          <>
            {/* Inputs */}
            <div className="space-y-4 animate-fade-up" style={{ animationDelay: "80ms" }}>
              <MicroInput
                label="The decision"
                placeholder="What choice are you facing?"
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
              />
              <MicroInput
                label="Option A"
                placeholder="First path you're considering"
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
              />
              <MicroInput
                label="Option B"
                placeholder="Second path you're considering"
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
              />
            </div>

            {/* Submit */}
            <div className="animate-fade-up" style={{ animationDelay: "160ms" }}>
              <Button
                variant="brand"
                size="lg"
                className="w-full"
                onClick={handleSubmit}
                disabled={!decision.trim() || !optionA.trim() || !optionB.trim() || isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Analyze decision
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4 stagger-children">
            {/* Control Analysis */}
            <StoicCard>
              <StoicCardHeader label="What's in your control" icon={<Brain className="w-4 h-4" />} />
              <StoicCardContent>
                <p className="text-muted-foreground">
                  {response.control_map || "Your effort, your preparation, your attitude toward either outcome."}
                </p>
              </StoicCardContent>
            </StoicCard>

            {/* Values Assessment */}
            <StoicCard>
              <StoicCardHeader label="Values alignment" icon={<Scale className="w-4 h-4" />} />
              <StoicCardContent>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {response.virtue_focus || "Wisdom"}
                </div>
                <p className="text-muted-foreground mt-3">
                  {response.summary || "Consider which option aligns more closely with who you want to become."}
                </p>
              </StoicCardContent>
            </StoicCard>

            {/* Hidden insight */}
            <StoicCard>
              <StoicCardHeader label="What you might be missing" icon={<Eye className="w-4 h-4" />} />
              <StoicCardContent>
                <p className="text-muted-foreground">
                  {response.surprise_or_tension || "Often the hardest decisions reveal what we truly value. The difficulty itself is information."}
                </p>
              </StoicCardContent>
            </StoicCard>

            {/* Recommendation */}
            <StoicCard variant="bordered">
              <StoicCardHeader label="Stoic guidance" icon={<Sparkles className="w-4 h-4" />} />
              <StoicCardContent>
                <p className="text-lg font-display font-semibold text-foreground leading-relaxed">
                  "{response.stance || "Choose the path that serves your character, not your comfort."}"
                </p>
              </StoicCardContent>
            </StoicCard>

            {/* Action */}
            <ActionChip
              action={response.action || "Before deciding: imagine yourself 10 years from now. Which choice would that person respect?"}
              onComplete={() => console.log("Decision clarity achieved")}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
