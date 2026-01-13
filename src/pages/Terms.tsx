import { useEffect } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { Helmet } from "react-helmet-async";
import { FileText, Scale, AlertTriangle, UserX, Shield, Gavel, Mail } from "lucide-react";

export default function Terms() {
  // Add structured data for SEO
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Terms of Service",
      "description": "WellWell's terms of service outlining user agreements, acceptable use, and legal terms",
      "publisher": {
        "@type": "Organization",
        "name": "WellWell",
        "url": "https://wellwell.ai"
      },
      "dateModified": "2026-01-13"
    });
    script.id = 'terms-schema';
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('terms-schema');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Terms of Service - WellWell | User Agreement & Legal Terms</title>
        <meta name="description" content="WellWell's terms of service, user agreement, and legal terms. Understand your rights and responsibilities when using our Stoic philosophy app. Last updated January 2026." />
        <meta name="keywords" content="terms of service, user agreement, terms and conditions, legal terms, acceptable use policy, wellwell terms" />
        <link rel="canonical" href="https://wellwell.ai/terms" />
        <meta property="og:title" content="Terms of Service - WellWell" />
        <meta property="og:description" content="Legal terms and user agreement for WellWell's Stoic philosophy application." />
        <meta property="og:url" content="https://wellwell.ai/terms" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <Layout scrollable>
        <div className="pb-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center py-6 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-3">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Legal Agreement</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-sm">
              Last updated: January 13, 2026
            </p>
          </div>

          {/* Introduction */}
          <div className="mb-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <p className="text-foreground leading-relaxed">
              Welcome to <strong>WellWell</strong>. By accessing or using our Stoic philosophy application and services, you agree to be bound by these Terms of Service. Please read them carefully before using our platform.
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">

            {/* Acceptance of Terms */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Acceptance of Terms
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  By creating an account, accessing, or using WellWell, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Comply with these Terms of Service and all applicable laws</li>
                  <li>Be at least 13 years of age (or the age of majority in your jurisdiction)</li>
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  If you do not agree to these terms, you may not use our services.
                </p>
              </div>
            </section>

            {/* Description of Service */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Description of Service
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  WellWell provides a digital platform for practicing Stoic philosophy through:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><strong className="text-foreground">Daily check-ins:</strong> Emotional awareness and reflection tools</li>
                  <li><strong className="text-foreground">Stoic guidance:</strong> Personalized philosophical insights based on your state</li>
                  <li><strong className="text-foreground">Practice exercises:</strong> Meditation, journaling, and mental training</li>
                  <li><strong className="text-foreground">Progress tracking:</strong> Analytics and patterns over time</li>
                  <li><strong className="text-foreground">Educational content:</strong> Stoic wisdom library and resources</li>
                </ul>
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground mb-1">Not a Substitute for Professional Care</p>
                      <p className="text-sm leading-relaxed">
                        WellWell is a self-help and educational tool. It is not a substitute for professional mental health care, therapy, or medical advice. If you're experiencing a mental health crisis, please contact a qualified healthcare provider or emergency services immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* User Accounts */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  User Accounts & Responsibilities
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">When you create a WellWell account, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your information as needed</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Not share your account with others</li>
                  <li>Not create multiple accounts to circumvent restrictions</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  You are responsible for all activities that occur under your account. We reserve the right to suspend or terminate accounts that violate these terms.
                </p>
              </div>
            </section>

            {/* Acceptable Use Policy */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Gavel className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Acceptable Use Policy
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">You agree NOT to use WellWell to:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Violate any laws, regulations, or third-party rights</li>
                  <li>Harass, abuse, or harm other users or individuals</li>
                  <li>Upload malicious code, viruses, or harmful content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Scrape, crawl, or collect user data without permission</li>
                  <li>Reverse engineer or decompile our software</li>
                  <li>Impersonate others or misrepresent your identity</li>
                  <li>Use automated systems (bots) without authorization</li>
                  <li>Interfere with or disrupt service operation</li>
                  <li>Share or distribute content you don't have rights to</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  Violation of these policies may result in immediate account suspension or termination.
                </p>
              </div>
            </section>

            {/* Subscription & Payments */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Subscription & Payments
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  WellWell offers both free and premium subscription tiers:
                </p>
                <div className="space-y-3 mt-3">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Free Tier</h3>
                    <p className="leading-relaxed">Access to basic features with usage limits</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Premium Subscription</h3>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Billed monthly or annually</li>
                      <li>Automatically renews unless cancelled</li>
                      <li>Cancellable at any time (access continues until period ends)</li>
                      <li>No refunds for partial months unless required by law</li>
                      <li>Price changes communicated 30 days in advance</li>
                    </ul>
                  </div>
                </div>
                <p className="leading-relaxed mt-3">
                  You authorize us to charge your payment method for applicable fees. Failure to pay may result in service suspension.
                </p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Intellectual Property Rights
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Our Content</h3>
                  <p className="leading-relaxed">
                    All content, features, and functionality of WellWell (including text, graphics, logos, icons, images, software, and stoic teachings) are owned by WellWell and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without written permission.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Your Content</h3>
                  <p className="leading-relaxed">
                    You retain ownership of your personal reflections, journal entries, and user-generated content. By using WellWell, you grant us a limited license to store, process, and display your content solely to provide our services to you. We will never use your personal reflections for marketing or share them publicly.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Stoic Philosophy</h3>
                  <p className="leading-relaxed">
                    WellWell's interpretations and applications of Stoic philosophy are our original work. Classical Stoic texts cited are in the public domain and properly attributed.
                  </p>
                </div>
              </div>
            </section>

            {/* Privacy & Data */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Privacy & Data Protection
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  Your privacy is important to us. Our collection and use of personal information is governed by our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>, which is incorporated into these Terms by reference. By using WellWell, you consent to our privacy practices as described in the Privacy Policy.
                </p>
              </div>
            </section>

            {/* Disclaimers */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Disclaimers & Limitations
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="leading-relaxed">
                    <strong className="text-foreground">AS-IS SERVICE:</strong> WellWell is provided "as is" without warranties of any kind, express or implied. We do not guarantee that the service will be uninterrupted, error-free, or meet your specific requirements.
                  </p>
                </div>
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="leading-relaxed">
                    <strong className="text-foreground">NO MEDICAL ADVICE:</strong> WellWell does not provide medical or mental health advice, diagnosis, or treatment. Our content is for educational and self-help purposes only.
                  </p>
                </div>
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="leading-relaxed">
                    <strong className="text-foreground">LIMITATION OF LIABILITY:</strong> To the maximum extent permitted by law, WellWell and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.
                  </p>
                </div>
              </div>
            </section>

            {/* Termination */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <UserX className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Account Termination
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Your Rights</h3>
                  <p className="leading-relaxed">
                    You may terminate your account at any time by contacting us or using the account deletion feature in settings. Upon termination, your data will be deleted according to our data retention policy.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Our Rights</h3>
                  <p className="leading-relaxed">
                    We may suspend or terminate your account immediately if you violate these Terms, engage in fraudulent activity, or for any reason at our discretion. We will provide notice when reasonably possible.
                  </p>
                </div>
              </div>
            </section>

            {/* Modifications */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Changes to Terms
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  We may modify these Terms at any time. Material changes will be communicated via email or in-app notification at least 30 days before taking effect. Your continued use of WellWell after changes become effective constitutes acceptance of the modified Terms.
                </p>
              </div>
            </section>

            {/* Dispute Resolution */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Gavel className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Dispute Resolution
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  If you have a dispute with WellWell, please contact us first at <a href="mailto:support@wellwell.ai" className="text-primary hover:underline">support@wellwell.ai</a> to attempt informal resolution. If we cannot resolve the dispute informally:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Disputes will be resolved through binding arbitration</li>
                  <li>You waive the right to a jury trial</li>
                  <li>Class action lawsuits are not permitted</li>
                  <li>Arbitration will be conducted under applicable arbitration rules</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  Some jurisdictions do not allow arbitration agreements. If you reside in such a jurisdiction, this clause may not apply to you.
                </p>
              </div>
            </section>

            {/* Governing Law */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Governing Law
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of the United States and the state in which WellWell is registered, without regard to conflict of law principles.
                </p>
              </div>
            </section>

            {/* Severability */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Severability
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Contact Information
                </h2>
              </div>

              <div className="space-y-3 text-muted-foreground">
                <p className="leading-relaxed">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                  <p className="text-foreground"><strong>Email:</strong> <a href="mailto:legal@wellwell.ai" className="text-primary hover:underline">legal@wellwell.ai</a></p>
                  <p className="text-foreground mt-2"><strong>Support:</strong> <a href="mailto:support@wellwell.ai" className="text-primary hover:underline">support@wellwell.ai</a></p>
                  <p className="text-foreground mt-2"><strong>Website:</strong> <a href="https://wellwell.ai" className="text-primary hover:underline">wellwell.ai</a></p>
                </div>
              </div>
            </section>

          </div>

          {/* Bottom CTA */}
          <div className="mt-12 p-6 bg-primary/5 rounded-2xl border border-primary/10 text-center">
            <Scale className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-foreground mb-2">
              Questions About These Terms?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              We're here to help clarify any aspect of our Terms of Service.
            </p>
            <a
              href="mailto:legal@wellwell.ai"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              <Mail className="w-4 h-4" />
              Contact Legal Team
            </a>
          </div>
        </div>
      </Layout>
    </>
  );
}
