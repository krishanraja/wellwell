import { Layout } from "@/components/wellwell/Layout";
import { StoicCard } from "@/components/wellwell/StoicCard";
import { Quote, BookOpen } from "lucide-react";

const meditations = [
  {
    book: 2,
    section: 1,
    text: "Begin each day by telling yourself: Today I shall be meeting with interference, ingratitude, insolence, disloyalty, ill-will, and selfishness.",
    theme: "Preparation",
  },
  {
    book: 4,
    section: 3,
    text: "Never value anything as profitable that compels you to break your promise, lose your self-respect, hate any man, suspect, curse, act the hypocrite, or desire anything that needs walls or curtains.",
    theme: "Integrity",
  },
  {
    book: 5,
    section: 16,
    text: "The object of life is not to be on the side of the majority, but to escape finding oneself in the ranks of the insane.",
    theme: "Independent Thinking",
  },
  {
    book: 6,
    section: 6,
    text: "The best revenge is not to be like your enemy.",
    theme: "Character",
  },
  {
    book: 7,
    section: 9,
    text: "Never esteem anything as of advantage to you that will make you break your word or lose your self-respect.",
    theme: "Integrity",
  },
  {
    book: 8,
    section: 47,
    text: "If you are distressed by anything external, the pain is not due to the thing itself, but to your estimate of it; and this you have the power to revoke at any moment.",
    theme: "Perception",
  },
  {
    book: 9,
    section: 6,
    text: "Waste no more time arguing about what a good man should be. Be one.",
    theme: "Action",
  },
  {
    book: 10,
    section: 16,
    text: "No longer talk at all about the kind of man that a good man ought to be, but be such.",
    theme: "Action",
  },
  {
    book: 11,
    section: 18,
    text: "How much trouble he avoids who does not look to see what his neighbor says or does or thinks.",
    theme: "Focus",
  },
  {
    book: 12,
    section: 26,
    text: "When you arise in the morning, think of what a precious privilege it is to be alive—to breathe, to think, to enjoy, to love.",
    theme: "Gratitude",
  },
];

export default function MeditationsLibrary() {
  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-3">
            <Quote className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Meditations</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Marcus Aurelius</h1>
          <p className="text-muted-foreground text-sm mt-1">Excerpts from the philosopher emperor</p>
        </div>

        {/* Meditations list */}
        <div className="space-y-3">
          {meditations.map((meditation, index) => (
            <StoicCard
              key={`${meditation.book}-${meditation.section}`}
              variant="glass"
              className="animate-fade-up"
              style={{ animationDelay: `${(index % 10) * 50}ms` }}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground leading-relaxed italic">
                      "{meditation.text}"
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">
                        Book {meditation.book}, Section {meditation.section}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {meditation.theme}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </StoicCard>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground py-4 animate-fade-up">
          More meditations coming soon
        </div>
      </div>
    </Layout>
  );
}
