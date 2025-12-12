import { useState } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { MicroInput } from "@/components/wellwell/MicroInput";
import { StoicCard, StoicCardHeader, StoicCardContent } from "@/components/wellwell/StoicCard";
import { ActionChip } from "@/components/wellwell/ActionChip";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Heart, Eye, Sparkles } from "lucide-react";
import { useStoicAnalyzer } from "@/hooks/useStoicAnalyzer";

export default function Conflict() {
  const [person, setPerson] = useState("");
  const [situation, setSituation] = useState("");
  const [feeling, setFeeling] = useState("");
  const { analyze, isLoading, response } = useStoicAnalyzer();

  const handleSubmit = async () => {
    if (person.trim() && situation.trim()) {
      await analyze({
        tool: "conflict",
        input: `Person: ${person}\nSituation: ${situation}\nFeeling: ${feeling}`,
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-up">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Conflict Copilot
          </h1>
          <p className="text-muted-foreground">
            Reset interpersonal dynamics with Stoic wisdom.
          </p>
        </div>

        {!response ? (
          <>
            {/* Inputs */}
            <div className="space-y-4 animate-fade-up" style={{ animationDelay: "80ms" }}>
              <MicroInput
                label="Who is this about?"
                placeholder="A colleague, friend, family member..."
                value={person}
                onChange={(e) => setPerson(e.target.value)}
              />
              <MicroInput
                label="What happened?"
                placeholder="Describe the situation briefly"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
              />
              <MicroInput
                label="How do you feel?"
                placeholder="Frustrated, hurt, confused..."
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
              />
            </div>

            {/* Submit */}
            <div className="animate-fade-up" style={{ animationDelay: "160ms" }}>
              <Button
                variant="brand"
                size="lg"
                className="w-full"
                onClick={handleSubmit}
                disabled={!person.trim() || !situation.trim() || isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Get perspective
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4 stagger-children">
            {/* Their Perspective */}
            <StoicCard>
              <StoicCardHeader label="Their perspective" icon={<Users className="w-4 h-4" />} />
              <StoicCardContent>
                <p className="text-muted-foreground">
                  {response.control_map || "Consider what pressures, fears, or needs might be driving their behavior. People rarely act from malice."}
                </p>
              </StoicCardContent>
            </StoicCard>

            {/* Your Role */}
            <StoicCard>
              <StoicCardHeader label="Your role" icon={<Heart className="w-4 h-4" />} />
              <StoicCardContent>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {response.virtue_focus || "Justice"}
                </div>
                <p className="text-muted-foreground mt-3">
                  {response.summary || "Focus on what you can control: your response, your boundaries, your willingness to understand."}
                </p>
              </StoicCardContent>
            </StoicCard>

            {/* Hidden Pattern */}
            <StoicCard>
              <StoicCardHeader label="The deeper pattern" icon={<Eye className="w-4 h-4" />} />
              <StoicCardContent>
                <p className="text-muted-foreground">
                  {response.surprise_or_tension || "This conflict may be revealing something about your own values or boundaries that needs attention."}
                </p>
              </StoicCardContent>
            </StoicCard>

            {/* Path Forward */}
            <StoicCard variant="bordered">
              <StoicCardHeader label="Path forward" icon={<Sparkles className="w-4 h-4" />} />
              <StoicCardContent>
                <p className="text-lg font-display font-semibold text-foreground leading-relaxed">
                  "{response.stance || "Seek first to understand, then to be understood. But never at the cost of your integrity."}"
                </p>
              </StoicCardContent>
            </StoicCard>

            {/* Action */}
            <ActionChip
              action={response.action || "Before your next interaction: pause and mentally wish them well. Enter from a place of strength, not reactivity."}
              onComplete={() => console.log("Conflict perspective gained")}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
