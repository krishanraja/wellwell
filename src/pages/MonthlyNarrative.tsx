import { Layout } from "@/components/wellwell/Layout";
import { StoicCard, StoicCardHeader, StoicCardContent } from "@/components/wellwell/StoicCard";
import { VirtueBarCompact } from "@/components/wellwell/VirtueBar";
import { Button } from "@/components/ui/button";
import { BookOpen, TrendingUp, Award, Share2 } from "lucide-react";
import { useVirtueScores } from "@/hooks/useVirtueScores";
import { toast } from "sonner";

export default function MonthlyNarrative() {
  const { scores } = useVirtueScores();

  const virtues = {
    courage: scores.find(s => s.virtue === 'courage')?.score || 50,
    temperance: scores.find(s => s.virtue === 'temperance')?.score || 50,
    justice: scores.find(s => s.virtue === 'justice')?.score || 50,
    wisdom: scores.find(s => s.virtue === 'wisdom')?.score || 50,
  };

  const avgScore = Math.round((virtues.courage + virtues.temperance + virtues.justice + virtues.wisdom) / 4);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My WellWell Monthly Progress',
        text: `I've been building Stoic resilience with WellWell. My virtue score this month: ${avgScore}%`,
        url: 'https://wellwell.ai',
      });
    } else {
      navigator.clipboard.writeText(`I've been building Stoic resilience with WellWell. My virtue score this month: ${avgScore}% https://wellwell.ai`);
      toast.success("Copied to clipboard!");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-up">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Monthly Narrative
          </h1>
          <p className="text-muted-foreground">
            Your growth story this month.
          </p>
        </div>

        {/* Virtue Progress */}
        <StoicCard className="animate-fade-up" style={{ animationDelay: "80ms" }}>
          <StoicCardHeader label="Virtue Balance" icon={<TrendingUp className="w-4 h-4" />} />
          <StoicCardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Overall Progress</span>
              <span className="text-2xl font-display font-bold gradient-text">{avgScore}%</span>
            </div>
            <VirtueBarCompact virtues={virtues} />
          </StoicCardContent>
        </StoicCard>

        {/* Monthly Story */}
        <StoicCard className="animate-fade-up" style={{ animationDelay: "160ms" }}>
          <StoicCardHeader label="Your story" icon={<BookOpen className="w-4 h-4" />} />
          <StoicCardContent>
            <p className="text-muted-foreground leading-relaxed">
              This month you've focused on building mental resilience. Your strongest virtue has been{" "}
              <span className="text-foreground font-medium">
                {Object.entries(virtues).reduce((a, b) => a[1] > b[1] ? a : b)[0]}
              </span>
              , while{" "}
              <span className="text-foreground font-medium">
                {Object.entries(virtues).reduce((a, b) => a[1] < b[1] ? a : b)[0]}
              </span>{" "}
              offers room for growth.
            </p>
          </StoicCardContent>
        </StoicCard>

        {/* Achievement */}
        <StoicCard variant="bordered" className="animate-fade-up" style={{ animationDelay: "240ms" }}>
          <StoicCardHeader label="Achievement unlocked" icon={<Award className="w-4 h-4" />} />
          <StoicCardContent>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Consistent Practitioner</h3>
                <p className="text-sm text-muted-foreground">You've shown up for your practice regularly this month.</p>
              </div>
            </div>
          </StoicCardContent>
        </StoicCard>

        {/* Share Button */}
        <div className="animate-fade-up" style={{ animationDelay: "320ms" }}>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share your progress
          </Button>
        </div>
      </div>
    </Layout>
  );
}
