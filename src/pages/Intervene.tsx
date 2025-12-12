import { useState } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { MicroInput } from "@/components/wellwell/MicroInput";
import { IntensitySlider } from "@/components/wellwell/IntensitySlider";
import { StoicCard, StoicCardHeader, StoicCardContent } from "@/components/wellwell/StoicCard";
import { ActionChip } from "@/components/wellwell/ActionChip";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw, Target, Scale, Zap } from "lucide-react";

export default function Intervene() {
  const [trigger, setTrigger] = useState("");
  const [intensity, setIntensity] = useState(3);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (trigger.trim()) {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setTrigger("");
    setIntensity(3);
    setSubmitted(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-up">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Intervene
          </h1>
          <p className="text-muted-foreground">
            Fast emotional recalibration. Shift your state in seconds.
          </p>
        </div>

        {!submitted ? (
          <>
            {/* Input */}
            <div className="space-y-6 animate-fade-up" style={{ animationDelay: "80ms" }}>
              <MicroInput
                label="What's pulling you off balance?"
                placeholder="Describe the trigger..."
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
              />

              <IntensitySlider
                value={intensity}
                onChange={setIntensity}
              />
            </div>

            {/* Submit */}
            <div className="animate-fade-up" style={{ animationDelay: "160ms" }}>
              <Button
                variant="brand"
                size="lg"
                className="w-full"
                onClick={handleSubmit}
                disabled={!trigger.trim()}
              >
                Shift my state
                <Zap className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4 stagger-children">
            {/* Rewrite */}
            <StoicCard>
              <StoicCardHeader label="Rewrite" icon={<RefreshCw className="w-4 h-4" />} />
              <StoicCardContent>
                <p className="text-base leading-relaxed">
                  It feels bigger than it is. The emotional weight you're carrying is a signal, not a verdict.
                </p>
              </StoicCardContent>
            </StoicCard>

            {/* Control */}
            <StoicCard>
              <StoicCardHeader label="Control" icon={<Target className="w-4 h-4" />} />
              <StoicCardContent>
                <p className="text-muted-foreground mb-2">You cannot control:</p>
                <p className="text-foreground">Their actions, the outcome, external circumstances.</p>
                <p className="text-muted-foreground mt-4 mb-2">You can control:</p>
                <p className="text-foreground font-medium">Your response. Your next move. Your composure.</p>
              </StoicCardContent>
            </StoicCard>

            {/* Virtue */}
            <StoicCard>
              <StoicCardHeader label="Virtue" icon={<Scale className="w-4 h-4" />} />
              <StoicCardContent>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-aqua/20 text-foreground text-sm font-medium mb-3">
                  Temperance
                </div>
                <p className="text-muted-foreground">
                  This moment calls for moderation. Don't match the heat. Stay measured.
                </p>
              </StoicCardContent>
            </StoicCard>

            {/* Action */}
            <ActionChip
              action="Pause for 10 seconds. Then respond with one calm sentence."
              onComplete={() => console.log("Completed intervention")}
            />

            {/* Reset */}
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleReset}
            >
              Another thought
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
