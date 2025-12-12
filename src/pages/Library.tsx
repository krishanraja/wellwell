import { Layout } from "@/components/wellwell/Layout";
import { StoicCard, StoicCardContent } from "@/components/wellwell/StoicCard";
import { BookOpen, ScrollText, Quote, Lightbulb } from "lucide-react";

export default function Library() {
  const resources = [
    {
      icon: ScrollText,
      title: "Daily Stances",
      description: "365 Stoic principles to guide your year."
    },
    {
      icon: Quote,
      title: "Meditations",
      description: "Excerpts from Marcus Aurelius."
    },
    {
      icon: Lightbulb,
      title: "Practical Wisdom",
      description: "Modern applications of ancient philosophy."
    }
  ];

  return (
    <Layout>
      <div className="space-y-4">
        <div className="text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Library</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Resources</h1>
          <p className="text-muted-foreground text-sm mt-1">Wisdom at your fingertips</p>
        </div>

        <div className="space-y-3">
          {resources.map((resource, index) => (
            <StoicCard 
              key={resource.title} 
              icon={resource.icon} 
              title={resource.title}
              className="animate-fade-up"
              style={{ animationDelay: `${(index + 1) * 80}ms` }}
            >
              <StoicCardContent>
                <p className="text-muted-foreground text-sm">{resource.description}</p>
              </StoicCardContent>
            </StoicCard>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: "320ms" }}>
          More resources coming soon
        </div>
      </div>
    </Layout>
  );
}
