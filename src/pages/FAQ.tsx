import { useState, useEffect } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { HorizontalScroll } from "@/components/wellwell/HorizontalScroll";
import { faqData, getFAQSchemaData, FAQItem } from "@/data/faqData";
import { ChevronDown, Search, HelpCircle, BookOpen, Brain, Sparkles, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet-async";

const categoryConfig = {
  stoicism: { label: "Stoic Philosophy", icon: BookOpen, color: "hsl(45 100% 60%)" },
  app: { label: "Using WellWell", icon: Sparkles, color: "hsl(166 100% 50%)" },
  "mental-health": { label: "Mental Wellness", icon: Brain, color: "hsl(260 80% 65%)" },
  practices: { label: "Daily Practices", icon: HelpCircle, color: "hsl(187 100% 50%)" },
  pricing: { label: "Pricing & Plans", icon: CreditCard, color: "hsl(90 80% 65%)" },
};

function FAQAccordion({ faq, isOpen, onToggle }: { faq: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 py-4 text-left hover:bg-muted/30 transition-colors rounded-lg px-2 -mx-2"
        aria-expanded={isOpen}
      >
        <ChevronDown 
          className={cn(
            "w-5 h-5 mt-0.5 text-muted-foreground shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
        <span className="font-medium text-foreground">{faq.question}</span>
      </button>
      
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <p className="pl-8 pr-2 pb-4 text-muted-foreground leading-relaxed">
          {faq.answer}
        </p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FAQItem['category'] | 'all'>('all');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  
  // Filter FAQs
  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Inject FAQ schema on mount
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(getFAQSchemaData());
    script.id = 'faq-schema';
    document.head.appendChild(script);
    
    return () => {
      const existingScript = document.getElementById('faq-schema');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>FAQ - WellWell | Stoic Philosophy & Mental Wellness Questions</title>
        <meta name="description" content="Frequently asked questions about Stoicism, mental wellness, and using WellWell. Learn how to stay calm under pressure, practice daily Stoic exercises, and build mental resilience." />
        <meta name="keywords" content="stoicism FAQ, mental health FAQ, how to stay calm, stoic philosophy questions, wellwell help" />
        <link rel="canonical" href="https://wellwell.app/faq" />
        <meta property="og:title" content="FAQ - WellWell | Stoic Philosophy & Mental Wellness" />
        <meta property="og:description" content="Answers to common questions about Stoicism, mental wellness, and building daily practices for inner calm." />
        <meta property="og:url" content="https://wellwell.app/faq" />
      </Helmet>
      
      <Layout scrollable>
        <div className="pb-8">
          {/* Header */}
          <div className="text-center py-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-3">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Help Center</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground text-sm">
              Everything you need to know about Stoicism and WellWell
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
          </div>

          {/* Category Tabs */}
          <div className="mb-6 -mx-4 px-4">
            <HorizontalScroll className="pb-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all",
                  activeCategory === 'all' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                All Topics
              </button>
              {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map(category => {
                const config = categoryConfig[category];
                const Icon = config.icon;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={cn(
                      "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all",
                      activeCategory === category 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {config.label}
                  </button>
                );
              })}
            </HorizontalScroll>
          </div>

          {/* FAQ List */}
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No questions found matching your search.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredFAQs.map(faq => (
                <FAQAccordion
                  key={faq.id}
                  faq={faq}
                  isOpen={openFAQ === faq.id}
                  onToggle={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                />
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-8 p-4 bg-muted/30 rounded-2xl border border-border/50 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Still have questions?
            </p>
            <a 
              href="mailto:support@wellwell.app" 
              className="text-primary font-medium hover:underline"
            >
              Contact Support →
            </a>
          </div>
        </div>
      </Layout>
    </>
  );
}
