import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { getArticleBySlug, getArticleSchema, blogArticles } from "@/data/blogData";
import { Clock, ArrowLeft, ArrowRight, Share2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

// Simple markdown-to-HTML converter for blog content
function renderMarkdown(content: string): string {
  return content
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-2 text-foreground">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-display font-bold mt-8 mb-3 text-foreground">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-display font-bold mt-6 mb-4 text-foreground">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-foreground">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary/50 pl-4 my-4 text-muted-foreground italic">$1</blockquote>')
    // Unordered lists
    .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1 text-muted-foreground">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-1 text-muted-foreground list-decimal">$1</li>')
    // Horizontal rules
    .replace(/^---$/gim, '<hr class="my-8 border-border/50" />')
    // Line breaks
    .replace(/\n\n/gim, '</p><p class="mb-4 text-muted-foreground leading-relaxed">')
    // Wrap in paragraphs
    .replace(/^(?!<[h|b|l|u|o|p|hr])(.*$)/gim, '<p class="mb-4 text-muted-foreground leading-relaxed">$1</p>');
}

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const article = slug ? getArticleBySlug(slug) : undefined;

  // Inject schema on mount
  useEffect(() => {
    if (!article) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(getArticleSchema(article));
    script.id = 'article-schema';
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('article-schema');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [article]);

  // Find next/prev articles
  const currentIndex = blogArticles.findIndex(a => a.slug === slug);
  const prevArticle = currentIndex > 0 ? blogArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex < blogArticles.length - 1 ? blogArticles[currentIndex + 1] : null;

  // Handle share
  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  if (!article) {
    return (
      <Layout scrollable>
        <div className="flex-1 flex flex-col items-center justify-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
          <h1 className="font-display text-xl font-bold text-foreground mb-2">Article not found</h1>
          <p className="text-muted-foreground mb-6">This article doesn't exist or has been moved.</p>
          <Button variant="outline" onClick={() => navigate('/blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>{article.metaTitle} | WellWell</title>
        <meta name="description" content={article.metaDescription} />
        <meta name="keywords" content={article.tags.join(', ')} />
        <link rel="canonical" href={`https://wellwell.app/blog/${article.slug}`} />
        
        <meta property="og:title" content={article.metaTitle} />
        <meta property="og:description" content={article.metaDescription} />
        <meta property="og:url" content={`https://wellwell.app/blog/${article.slug}`} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={article.publishedAt} />
        <meta property="article:author" content={article.author} />
        {article.tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.metaTitle} />
        <meta name="twitter:description" content={article.metaDescription} />
      </Helmet>

      <Layout scrollable>
        <article className="pb-8">
          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All articles
          </Link>

          {/* Header */}
          <header className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {article.readingTime} min read
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {new Date(article.publishedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>

            <h1 className="font-display text-2xl font-bold text-foreground mb-3">
              {article.title}
            </h1>

            <p className="text-muted-foreground">
              {article.excerpt}
            </p>
          </header>

          {/* Share button */}
          <div className="flex items-center gap-2 mb-6 pb-6 border-b border-border/50">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Content */}
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
          />

          {/* Author */}
          <div className="mt-8 p-4 bg-muted/30 rounded-2xl border border-border/50">
            <p className="text-sm text-muted-foreground mb-1">Written by</p>
            <p className="font-medium text-foreground">{article.author}</p>
          </div>

          {/* Tags */}
          <div className="mt-6 flex flex-wrap gap-2">
            {article.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-muted/50 text-muted-foreground text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Navigation */}
          <nav className="mt-8 grid grid-cols-2 gap-4">
            {prevArticle ? (
              <Link
                to={`/blog/${prevArticle.slug}`}
                className="p-4 bg-card/50 rounded-xl border border-border/50 hover:border-primary/30 transition-colors group"
              >
                <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                  <ArrowLeft className="w-3 h-3" />
                  Previous
                </span>
                <span className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {prevArticle.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {nextArticle && (
              <Link
                to={`/blog/${nextArticle.slug}`}
                className="p-4 bg-card/50 rounded-xl border border-border/50 hover:border-primary/30 transition-colors group text-right"
              >
                <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1 justify-end">
                  Next
                  <ArrowRight className="w-3 h-3" />
                </span>
                <span className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {nextArticle.title}
                </span>
              </Link>
            )}
          </nav>

          {/* CTA */}
          <div className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl border border-primary/30 text-center">
            <h2 className="font-display text-lg font-bold text-foreground mb-2">
              Practice What You've Learned
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              WellWell brings Stoic philosophy to life with AI-powered daily practices.
            </p>
            <Link to="/auth">
              <Button variant="brand">
                Start Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </article>
      </Layout>
    </>
  );
}
