import { Link } from "react-router-dom";
import { Layout } from "@/components/wellwell/Layout";
import { blogArticles, BlogArticle } from "@/data/blogData";
import { Clock, ArrowRight, BookOpen, Brain, Briefcase, Users, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet-async";

const categoryConfig: Record<BlogArticle['category'], { label: string; icon: typeof BookOpen; color: string }> = {
  stoicism: { label: "Stoicism", icon: BookOpen, color: "hsl(45 100% 60%)" },
  "mental-health": { label: "Mental Health", icon: Brain, color: "hsl(260 80% 65%)" },
  productivity: { label: "Productivity", icon: Briefcase, color: "hsl(166 100% 50%)" },
  relationships: { label: "Relationships", icon: Users, color: "hsl(8 100% 65%)" },
  guides: { label: "Guides", icon: FileText, color: "hsl(187 100% 50%)" },
};

function ArticleCard({ article, featured = false }: { article: BlogArticle; featured?: boolean }) {
  const config = categoryConfig[article.category];
  const CategoryIcon = config.icon;

  return (
    <Link
      to={`/blog/${article.slug}`}
      className={cn(
        "block p-4 bg-card/50 rounded-2xl border border-border/50 hover:border-primary/30 transition-all group",
        featured && "bg-gradient-to-br from-primary/5 to-transparent"
      )}
    >
      {featured && (
        <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-primary/20 text-primary rounded-full mb-3">
          Featured
        </span>
      )}
      
      <div className="flex items-center gap-2 mb-2">
        <span
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${config.color}20`, color: config.color }}
        >
          <CategoryIcon className="w-3 h-3" />
          {config.label}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {article.readingTime} min read
        </span>
      </div>

      <h2 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {article.title}
      </h2>

      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {article.excerpt}
      </p>

      <div className="flex items-center gap-2 text-primary text-sm font-medium">
        Read article
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}

export default function Blog() {
  const featuredArticles = blogArticles.filter(a => a.featured);
  const regularArticles = blogArticles.filter(a => !a.featured);

  return (
    <>
      <Helmet>
        <title>Stoic Wisdom Blog | WellWell</title>
        <meta name="description" content="Practical Stoic philosophy for modern life. Articles on staying calm under pressure, morning routines, dealing with difficult people, and building mental resilience." />
        <meta name="keywords" content="stoicism blog, stoic philosophy articles, mental health tips, productivity advice, calm under pressure" />
        <link rel="canonical" href="https://wellwell.app/blog" />
        <meta property="og:title" content="Stoic Wisdom Blog | WellWell" />
        <meta property="og:description" content="Practical Stoic philosophy for modern life. Articles on mental resilience, productivity, and emotional clarity." />
        <meta property="og:url" content="https://wellwell.app/blog" />
        <meta property="og:type" content="website" />
      </Helmet>

      <Layout scrollable>
        <div className="pb-8">
          {/* Header */}
          <div className="text-center py-4 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-3">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Stoic Wisdom</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              The WellWell Blog
            </h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Practical Stoic philosophy for staying calm, focused, and resilient in modern life.
            </p>
          </div>

          {/* Featured Articles */}
          {featuredArticles.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Featured Articles
              </h2>
              <div className="space-y-4">
                {featuredArticles.map(article => (
                  <ArticleCard key={article.slug} article={article} featured />
                ))}
              </div>
            </section>
          )}

          {/* All Articles */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              All Articles
            </h2>
            <div className="space-y-4">
              {regularArticles.map(article => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="mt-8 p-4 bg-muted/30 rounded-2xl border border-border/50 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Ready to practice what you've learned?
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              Start your Stoic practice free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Layout>
    </>
  );
}
