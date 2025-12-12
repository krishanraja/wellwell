import { Layout } from "@/components/wellwell/Layout";
import { StoicCard, StoicCardContent } from "@/components/wellwell/StoicCard";

export default function About() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center animate-fade-up">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            About WellWell
          </h1>
          <p className="text-muted-foreground">
            Philosophy for the modern mind.
          </p>
        </div>

        {/* Philosophy */}
        <StoicCard className="animate-fade-up" style={{ animationDelay: "80ms" }}>
          <StoicCardContent>
            <h2 className="font-display font-semibold text-foreground mb-3">The Philosophy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Stoicism isn't about suppressing emotions—it's about understanding what's in your control and responding with wisdom. WellWell brings this 2,000-year-old philosophy into your pocket, making it practical and immediate.
            </p>
          </StoicCardContent>
        </StoicCard>

        {/* The Four Virtues */}
        <StoicCard className="animate-fade-up" style={{ animationDelay: "160ms" }}>
          <StoicCardContent>
            <h2 className="font-display font-semibold text-foreground mb-3">The Four Virtues</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-foreground">Courage</h3>
                <p className="text-sm text-muted-foreground">Facing difficulties with resilience and bravery.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Temperance</h3>
                <p className="text-sm text-muted-foreground">Self-control and moderation in all things.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Justice</h3>
                <p className="text-sm text-muted-foreground">Treating others fairly and with integrity.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Wisdom</h3>
                <p className="text-sm text-muted-foreground">Making sound judgments based on reason.</p>
              </div>
            </div>
          </StoicCardContent>
        </StoicCard>

        {/* Principles */}
        <StoicCard className="animate-fade-up" style={{ animationDelay: "240ms" }}>
          <StoicCardContent>
            <h2 className="font-display font-semibold text-foreground mb-3">Our Principles</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Seconds, not minutes. Clarity should be immediate.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>No fluff. Every insight must be actionable.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Privacy first. Your thoughts are yours alone.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Progress over perfection. Show up daily.</span>
              </li>
            </ul>
          </StoicCardContent>
        </StoicCard>

        {/* Version */}
        <div className="text-center text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: "320ms" }}>
          Version 1.0.0 • Made with 💚 for clarity seekers
        </div>
      </div>
    </Layout>
  );
}
