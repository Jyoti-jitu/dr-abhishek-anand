import React, { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PARENT_ARTICLES, CLINIC_DETAILS, DOCTOR_DETAILS } from "@/data/doctorData";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Share2, 
  Phone,
  BookOpen,
  Calendar,
  Building2,
  Lightbulb
} from "lucide-react";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return PARENT_ARTICLES.map((article) => ({
    slug: article.slug
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = PARENT_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return {
      title: "Article Not Found | Dr. Abhishek Anand"
    };
  }

  return {
    title: `${article.title} | Parent Guidance | Dr. Abhishek Anand`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article"
    }
  };
}

async function ArticleContent({ params }: Props) {
  const { slug } = await params;
  const article = PARENT_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Back Link */}
        <div>
          <Link
            href="/parent-information"
            className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal-muted hover:text-navy transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Parent Guides</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="space-y-4 pb-8 border-b border-border-subtle">
          <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-muted">
            <span className="font-bold text-teal uppercase tracking-wider">
              Educational Guide
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {article.readTime}
            </span>
            <span>•</span>
            <span>{article.publishedDate}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight leading-tight">
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-teal-dark font-medium">
            {article.subtitle}
          </p>

          <p className="text-sm text-charcoal-muted leading-relaxed">
            {article.summary}
          </p>

          {/* Editorial governance tag */}
          <div className="p-3 rounded-lg bg-light-bg border border-border-subtle text-xs text-charcoal-muted flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-teal shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-charcoal">Governance Note:</span>{" "}
              {article.reviewStatus}. Compiled from verified paediatric surgery clinical literature.
            </div>
          </div>
        </header>

        {/* Key Takeaways Box */}
        <section className="p-6 rounded-2xl bg-teal-subtle/70 border border-teal/20 space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-teal" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-teal-dark">
              Key Takeaways for Parents
            </h2>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-charcoal">
            {article.keyTakeaways.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Content Sections */}
        <div className="space-y-10 text-charcoal leading-relaxed">
          {article.contentSections.map((section, sIdx) => (
            <section key={sIdx} className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-navy tracking-tight">
                {section.heading}
              </h2>
              <div className="space-y-3 text-sm sm:text-base text-charcoal">
                {section.body.map((p, pIdx) => (
                  <p key={pIdx} className="leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              {section.tips && (
                <div className="p-5 rounded-xl bg-light-bg border border-border-subtle space-y-2 my-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-medical block">
                    Helpful Tip for Families:
                  </span>
                  <ul className="space-y-1.5 text-xs text-charcoal-muted">
                    {section.tips.map((tip, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-medical shrink-0 mt-1.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* FAQs */}
        {article.faqList.length > 0 && (
          <section className="pt-8 border-t border-border-subtle space-y-6">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-teal" />
              <h2 className="text-xl font-bold text-navy">
                Frequently Asked Parent Questions
              </h2>
            </div>
            <div className="space-y-4">
              {article.faqList.map((faq, fIdx) => (
                <div
                  key={fIdx}
                  className="p-5 rounded-xl bg-white border border-border-subtle shadow-2xs space-y-2"
                >
                  <h3 className="text-sm font-bold text-navy">
                    {faq.question}
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Clinic Appointment Consultation Card */}
        <section className="p-8 rounded-2xl bg-white border border-border-subtle shadow-editorial space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal uppercase tracking-wider">
              In-Person Consultation
            </span>
            <span className="text-xs text-slate-400">
              New Life Clinic • Soubhagya Nagar
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-navy">
            Would You Like Dr. Abhishek Anand to Review Your Child&apos;s Case?
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
            Every child is unique. If you have questions about a recent diagnosis, scan report, or doctor referral, you can schedule an unhurried consultation at New Life Clinic in Bhubaneswar.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href={`tel:${CLINIC_DETAILS.phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-medical hover:bg-medical-hover text-white text-xs font-semibold transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Clinic: {CLINIC_DETAILS.phone}</span>
            </a>
            <Link
              href="/clinic"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border-subtle bg-light-bg hover:bg-slate-200 text-charcoal text-xs font-semibold transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Clinic Details & Timings</span>
            </Link>
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-border-subtle flex items-center justify-between text-xs">
          <Link
            href="/parent-information"
            className="text-medical font-medium hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>All Articles</span>
          </Link>
          <Link
            href="/services"
            className="text-medical font-medium hover:underline inline-flex items-center gap-1"
          >
            <span>Explore Surgical Services</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ArticleDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-charcoal-muted">Loading article...</div>}>
      <ArticleContent params={params} />
    </Suspense>
  );
}
