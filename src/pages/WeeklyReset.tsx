import { useState } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { MicroInput } from "@/components/wellwell/MicroInput";
import { StoicCard, StoicCardHeader, StoicCardContent } from "@/components/wellwell/StoicCard";
import { ActionChip } from "@/components/wellwell/ActionChip";
import { Button } from "@/components/ui/button";
import { ArrowRight, RotateCcw, Trophy, Target, Sparkles } from "lucide-react";
import { useStoicAnalyzer } from "@/hooks/useStoicAnalyzer";

export default function WeeklyReset() {
  const [win, setWin] = useState("");
  const [challenge, setChallenge] = useState("");
  const [lesson, setLesson] = useState("");
  const { analyze, isLoading, response } = useStoicAnalyzer();

  const handleSubmit = async () => {
    if (win.trim() || challenge.trim() || lesson.trim()) {
      await analyze({
        tool: "weekly_reset",
        input: `Win: ${win}\nChallenge: ${challenge}\nLesson: ${lesson}`,
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-up">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Weekly Reset
          </h1>
          <p className="text-muted-foreground">
            Review your week with Stoic perspective.
          </p>
        </div>

        {!response ? (
          <>
            {/* Inputs */}
            <div className="space-y-4 animate-fade-up" style={{ animationDelay: "80ms" }}>
              <MicroInput
                label="Your biggest win"
                placeholder="What went well this week?"
                value={win}
                onChange={(e) => setWin(e.target.value)}
              />
              <MicroInput
                label="Your biggest challenge"
                placeholder="What tested you?"
                value={challenge}
                onChange={(e) => setChallenge(e.target.value)}
              />
              <MicroInput
                label="What did you learn?"
                placeholder="Key insight from this week"
                value={lesson}
                onChange={(e) => setLesson(e.target.value)}
              />
            </div>

            {/* Submit */}
            <div className="animate-fade-up" style={{ animationDelay: "160ms" }}>
              <Button
                variant="brand"
                size="lg"
                className="w-full"
                onClick={handleSubmit}
                disabled={(!win.trim() && !challenge.trim() && !lesson.trim()) || isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Reset my week
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4 stagger-children">
            {/* Win Recognition */}
            <StoicCard>
              <StoicCardHeader label="Victory acknowledged" icon={<Trophy className="w-4 h-4" />} />
              <StoicCardContent>
                <p className="text-muted-foreground">
                  {response.control_map || "Your win came from effort within your control. Celebrate the process, not just the outcome."}
                </p>
              </StoicCardContent>
            </StoicCard>

            {/* Challenge Reframe */}
            <StoicCard>
              <StoicCardHeader label="Challenge reframed" icon={<RotateCcw className="w-4 h-4" />} />
              <StoicCardContent>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {response.virtue_focus || "Courage"}
                </div>
                <p className="text-muted-foreground mt-3">
                  {response.summary || "Every obstacle is training for the next one. This challenge built a muscle you'll need later."}
                </p>
              </StoicCardContent>
            </StoicCard>

            {/* Next Week Focus */}
            <StoicCard>
              <StoicCardHeader label="Next week's focus" icon={<Target className="w-4 h-4" />} />
              <StoicCardContent>
                <p className="text-muted-foreground">
                  {response.surprise_or_tension || "Based on your patterns, focus on one virtue this week. Progress comes from focused attention."}
                </p>
              </StoicCardContent>
            </StoicCard>

            {/* Weekly Mantra */}
            <StoicCard variant="bordered">
              <StoicCardHeader label="Your weekly mantra" icon={<Sparkles className="w-4 h-4" />} />
              <StoicCardContent>
                <p className="text-lg font-display font-semibold text-foreground leading-relaxed">
                  "{response.stance || "This week I will focus on what I can control and release what I cannot."}"
                </p>
              </StoicCardContent>
            </StoicCard>

            {/* Action */}
            <ActionChip
              action={response.action || "Set one intention for next week that aligns with your lesson learned."}
              onComplete={() => console.log("Weekly reset complete")}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
