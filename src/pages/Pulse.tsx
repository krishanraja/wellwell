import { useState } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { MicroInput } from "@/components/wellwell/MicroInput";
import { StoicCard, StoicCardHeader, StoicCardContent } from "@/components/wellwell/StoicCard";
import { ActionChip } from "@/components/wellwell/ActionChip";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Shield, Lightbulb } from "lucide-react";

export default function Pulse() {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (input.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-up">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Morning Pulse
          </h1>
          <p className="text-muted-foreground">
            Pre-load your Stoic stance before the day destabilises you.
          </p>
        </div>

        {!submitted ? (
          <>
            {/* Input */}
            <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
              <MicroInput
                label="Today's hardest moment"
                placeholder="What situation might test you today?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            {/* Submit */}
            <div className="animate-fade-up" style={{ animationDelay: "160ms" }}>
              <Button
                variant="brand"
                size="lg"
                className="w-full"
                onClick={handleSubmit}
                disabled={!input.trim()}
              >
                Set my stance
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4 stagger-children">
            {/* Control */}
            <StoicCard>
              <StoicCardHeader label="Control" icon={<Target className="w-4 h-4" />} />
              <StoicCardContent>
                <p className="text-base font-medium mb-2">What's yours:</p>
                <p className="text-muted-foreground">
                  Your preparation. Your response. Your composure in the moment.
                </p>
              </StoicCardContent>
            </StoicCard>

            {/* Virtue */}
            <StoicCard>
              <StoicCardHeader label="Virtue" icon={<Shield className="w-4 h-4" />} />
              <StoicCardContent>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  Courage
                </div>
                <p className="text-muted-foreground mt-3">
                  This situation calls for facing discomfort directly, not avoiding it.
                </p>
              </StoicCardContent>
            </StoicCard>

            {/* Stance */}
            <StoicCard variant="bordered">
              <StoicCardHeader label="Your Stance" icon={<Lightbulb className="w-4 h-4" />} />
              <StoicCardContent>
                <p className="text-lg font-display font-semibold text-foreground leading-relaxed">
                  "I will stay composed regardless of the outcome. My job is to show up prepared and respond with clarity."
                </p>
              </StoicCardContent>
            </StoicCard>

            {/* Action */}
            <ActionChip
              action="Before the moment: take three slow breaths and repeat your stance silently."
              onComplete={() => console.log("Completed morning ritual")}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
