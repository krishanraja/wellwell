import { Layout } from "@/components/wellwell/Layout";
import { StoicCard } from "@/components/wellwell/StoicCard";
import { Lightbulb, ArrowRight } from "lucide-react";

const wisdomArticles = [
  {
    title: "The Dichotomy of Control",
    preview: "Focus only on what you can control: your thoughts, actions, and responses. Release attachment to everything else.",
    category: "Core Principle",
    readTime: "3 min",
  },
  {
    title: "Negative Visualization",
    preview: "Imagine losing what you have to appreciate it more. This practice reduces fear and increases gratitude.",
    category: "Practice",
    readTime: "4 min",
  },
  {
    title: "Amor Fati: Love Your Fate",
    preview: "Embrace everything that happens as necessary and good. Transform obstacles into opportunities for growth.",
    category: "Mindset",
    readTime: "5 min",
  },
  {
    title: "The View From Above",
    preview: "Zoom out to see your problems from a cosmic perspective. Most worries fade when viewed against the vastness of time and space.",
    category: "Practice",
    readTime: "3 min",
  },
  {
    title: "Memento Mori",
    preview: "Remember you will die. This awareness makes each moment precious and helps prioritize what truly matters.",
    category: "Core Principle",
    readTime: "4 min",
  },
  {
    title: "The Inner Citadel",
    preview: "Build an unshakeable inner fortress. External events cannot harm you unless you allow them to disturb your mind.",
    category: "Mindset",
    readTime: "5 min",
  },
  {
    title: "Virtue is the Sole Good",
    preview: "External things—wealth, fame, pleasure—are indifferent. Only living virtuously leads to genuine flourishing.",
    category: "Core Principle",
    readTime: "4 min",
  },
  {
    title: "The Discipline of Desire",
    preview: "Train yourself to want what you have. Freedom comes not from getting what you want, but wanting what you get.",
    category: "Practice",
    readTime: "4 min",
  },
];

export default function WisdomLibrary() {
  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-3">
            <Lightbulb className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Practical Wisdom</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Modern Stoicism</h1>
          <p className="text-muted-foreground text-sm mt-1">Ancient philosophy for today's challenges</p>
        </div>

        {/* Articles list */}
        <div className="space-y-3">
          {wisdomArticles.map((article, index) => (
            <StoicCard
              key={article.title}
              variant="glass"
              className="animate-fade-up cursor-pointer hover:scale-[1.02] transition-transform"
              style={{ animationDelay: `${(index % 10) * 50}ms` }}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {article.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {article.readTime} read
                  </span>
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {article.preview}
                </p>
                <div className="flex items-center gap-1 mt-3 text-primary text-sm font-medium">
                  Read more
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </StoicCard>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground py-4 animate-fade-up">
          More wisdom articles coming soon
        </div>
      </div>
    </Layout>
  );
}
