import { Layout } from "@/components/wellwell/Layout";
import { StoicCard } from "@/components/wellwell/StoicCard";
import { BookOpen, ScrollText, Quote, Lightbulb, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Library() {
  const navigate = useNavigate();
  
  const resources = [
    {
      icon: ScrollText,
      title: "Daily Stances",
      description: "30 Stoic principles to guide your month.",
      count: "30 stances",
      path: "/library/stances",
      color: "hsl(187 100% 50%)",
    },
    {
      icon: Quote,
      title: "Meditations",
      description: "Excerpts from Marcus Aurelius.",
      count: "10 excerpts",
      path: "/library/meditations",
      color: "hsl(260 80% 65%)",
    },
    {
      icon: Lightbulb,
      title: "Practical Wisdom",
      description: "Modern applications of ancient philosophy.",
      count: "8 articles",
      path: "/library/wisdom",
      color: "hsl(45 100% 60%)",
    },
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
          {resources.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <StoicCard 
                key={resource.title}
                variant="glass"
                className="animate-fade-up cursor-pointer hover:scale-[1.02] transition-transform"
                style={{ animationDelay: `${(index + 1) * 80}ms` }}
                onClick={() => navigate(resource.path)}
              >
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${resource.color}20` }}
                    >
                      <Icon 
                        className="w-6 h-6" 
                        style={{ color: resource.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-foreground">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {resource.description}
                      </p>
                      <span className="text-xs text-primary font-medium mt-1 inline-block">
                        {resource.count}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </StoicCard>
            );
          })}
        </div>

        <div className="text-center text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: "320ms" }}>
          More resources coming soon
        </div>
      </div>
    </Layout>
  );
}
