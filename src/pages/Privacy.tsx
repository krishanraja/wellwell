import { useEffect } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { Helmet } from "react-helmet-async";
import { Shield, Lock, Eye, Database, UserCheck, AlertCircle, Mail } from "lucide-react";

export default function Privacy() {
  // Add structured data for SEO
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Privacy Policy",
      "description": "WellWell's privacy policy detailing how we collect, use, and protect your personal information",
      "publisher": {
        "@type": "Organization",
        "name": "WellWell",
        "url": "https://wellwell.ai"
      },
      "dateModified": "2026-01-13"
    });
    script.id = 'privacy-schema';
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('privacy-schema');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Privacy Policy - WellWell | Your Data Privacy & Protection</title>
        <meta name="description" content="WellWell's comprehensive privacy policy. Learn how we protect your personal data, what information we collect, and your privacy rights. Last updated January 2026." />
        <meta name="keywords" content="privacy policy, data protection, personal information, user privacy, GDPR, data security, wellwell privacy" />
        <link rel="canonical" href="https://wellwell.ai/privacy" />
        <meta property="og:title" content="Privacy Policy - WellWell" />
        <meta property="og:description" content="Learn how WellWell protects your personal data and respects your privacy." />
        <meta property="og:url" content="https://wellwell.ai/privacy" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <Layout scrollable>
        <div className="pb-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center py-6 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-3">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Privacy & Security</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-sm">
              Last updated: January 13, 2026
            </p>
          </div>

          {/* Introduction */}
          <div className="mb-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <p className="text-foreground leading-relaxed">
              At <strong>WellWell</strong>, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Stoic philosophy application and services.
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">

            {/* Information We Collect */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Information We Collect
                </h2>
              </div>

              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Personal Information</h3>
                  <p className="leading-relaxed mb-2">When you register for WellWell, we collect:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Email address (for authentication and communication)</li>
                    <li>Account credentials (securely encrypted)</li>
                    <li>Profile information (name, preferences)</li>
                    <li>Usage data (check-ins, reflections, activities)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Usage Information</h3>
                  <p className="leading-relaxed mb-2">We automatically collect certain information when you use our services:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Device information (type, operating system, browser)</li>
                    <li>Log data (IP address, access times, pages viewed)</li>
                    <li>Performance metrics (app crashes, response times)</li>
                    <li>Analytics data (feature usage, engagement patterns)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Personal Reflections & Journal Data</h3>
                  <p className="leading-relaxed">
                    Your personal reflections, check-ins, and journal entries are stored securely and encrypted. This sensitive information is never shared with third parties and is used solely to provide you with personalized Stoic guidance.
                  </p>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  How We Use Your Information
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><strong className="text-foreground">Provide personalized experiences:</strong> Tailor Stoic guidance based on your emotional state and patterns</li>
                  <li><strong className="text-foreground">Maintain and improve our services:</strong> Fix bugs, optimize performance, and develop new features</li>
                  <li><strong className="text-foreground">Communicate with you:</strong> Send important updates, security alerts, and optional newsletters</li>
                  <li><strong className="text-foreground">Ensure security:</strong> Detect and prevent fraud, abuse, or unauthorized access</li>
                  <li><strong className="text-foreground">Analyze usage patterns:</strong> Understand how users engage with WellWell to improve the experience</li>
                  <li><strong className="text-foreground">Provide customer support:</strong> Respond to your inquiries and resolve issues</li>
                </ul>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Data Security
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  We implement industry-standard security measures to protect your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>End-to-end encryption for sensitive data</li>
                  <li>Secure HTTPS connections for all data transmission</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Access controls limiting who can view your data</li>
                  <li>Secure cloud infrastructure with automatic backups</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  While we take every precaution to protect your data, no method of transmission over the internet is 100% secure. We encourage you to use strong passwords and enable two-factor authentication.
                </p>
              </div>
            </section>

            {/* Data Sharing & Disclosure */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Data Sharing & Disclosure
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  <strong className="text-foreground">We do not sell your personal information.</strong> We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><strong className="text-foreground">Service Providers:</strong> We work with trusted third-party services (hosting, analytics, email) who process data on our behalf under strict confidentiality agreements</li>
                  <li><strong className="text-foreground">Legal Requirements:</strong> When required by law, court order, or to protect our rights and safety</li>
                  <li><strong className="text-foreground">Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, with advance notice to you</li>
                  <li><strong className="text-foreground">With Your Consent:</strong> When you explicitly authorize us to share specific information</li>
                </ul>
              </div>
            </section>

            {/* Your Privacy Rights */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Your Privacy Rights
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">You have the following rights regarding your personal data:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><strong className="text-foreground">Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong className="text-foreground">Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong className="text-foreground">Deletion:</strong> Request deletion of your account and associated data</li>
                  <li><strong className="text-foreground">Export:</strong> Download your data in a portable format</li>
                  <li><strong className="text-foreground">Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
                  <li><strong className="text-foreground">Restrict Processing:</strong> Limit how we use your information</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  To exercise any of these rights, please contact us at <a href="mailto:privacy@wellwell.ai" className="text-primary hover:underline">privacy@wellwell.ai</a>
                </p>
              </div>
            </section>

            {/* Cookies & Tracking */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Cookies & Tracking Technologies
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  We use cookies and similar tracking technologies to improve your experience:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><strong className="text-foreground">Essential Cookies:</strong> Required for authentication and core functionality</li>
                  <li><strong className="text-foreground">Analytics Cookies:</strong> Help us understand how you use WellWell (can be disabled)</li>
                  <li><strong className="text-foreground">Preference Cookies:</strong> Remember your settings and preferences</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  You can control cookies through your browser settings, though disabling certain cookies may affect functionality.
                </p>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Data Retention
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  We retain your personal information only as long as necessary to provide our services and comply with legal obligations:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Active account data is retained while your account is active</li>
                  <li>Deleted account data is permanently removed within 30 days</li>
                  <li>Backup copies are automatically purged after 90 days</li>
                  <li>Anonymized analytics data may be retained indefinitely</li>
                </ul>
              </div>
            </section>

            {/* Children's Privacy */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Children's Privacy
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  WellWell is not intended for children under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                </p>
              </div>
            </section>

            {/* International Users */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  International Users
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  WellWell operates globally and complies with international privacy regulations including GDPR (European Union) and CCPA (California). Your data may be transferred and processed in countries where our service providers operate, always with appropriate safeguards in place.
                </p>
              </div>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Changes to This Privacy Policy
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Continued use of WellWell after changes constitutes acceptance of the updated policy.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Contact Us
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                  <p className="text-foreground"><strong>Email:</strong> <a href="mailto:privacy@wellwell.ai" className="text-primary hover:underline">privacy@wellwell.ai</a></p>
                  <p className="text-foreground mt-2"><strong>Support:</strong> <a href="mailto:support@wellwell.ai" className="text-primary hover:underline">support@wellwell.ai</a></p>
                  <p className="text-foreground mt-2"><strong>Website:</strong> <a href="https://wellwell.ai" className="text-primary hover:underline">wellwell.ai</a></p>
                </div>
              </div>
            </section>

          </div>

          {/* Bottom CTA */}
          <div className="mt-12 p-6 bg-primary/5 rounded-2xl border border-primary/10 text-center">
            <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-foreground mb-2">
              Your Privacy Matters
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              We're committed to protecting your personal information and maintaining your trust.
            </p>
            <a
              href="mailto:privacy@wellwell.ai"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              <Mail className="w-4 h-4" />
              Questions? Contact Privacy Team
            </a>
          </div>
        </div>
      </Layout>
    </>
  );
}
