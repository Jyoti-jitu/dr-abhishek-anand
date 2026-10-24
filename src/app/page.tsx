import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  DOCTOR_DETAILS, 
  CLINIC_DETAILS, 
  SERVICES, 
  PARENT_ARTICLES 
} from "@/data/doctorData";
import { 
  ArrowRight, 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Award, 
  GraduationCap, 
  Stethoscope, 
  Baby, 
  Activity, 
  CheckCircle2, 
  BookOpen, 
  Building2,
  Calendar,
  AlertCircle
} from "lucide-react";

export default function HomePage() {
  const iconMap: Record<string, React.ReactNode> = {
    Stethoscope: <Stethoscope className="w-5 h-5 text-teal" />,
    Baby: <Baby className="w-5 h-5 text-teal" />,
    Activity: <Activity className="w-5 h-5 text-teal" />,
    ShieldCheck: <ShieldCheck className="w-5 h-5 text-teal" />,
    HeartHandshake: <Award className="w-5 h-5 text-teal" />
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-12 pb-12 sm:pb-20 overflow-hidden bg-gradient-to-b from-warm-white via-light-bg/40 to-warm-white border-b border-border-subtle/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Text & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-light border border-teal/20 text-teal-dark text-xs font-semibold tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                PAEDIATRIC SURGERY
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-navy leading-[1.15]">
                  Specialist Surgical Care for Children.{" "}
                  <span className="text-medical font-bold">Clear Guidance for Families.</span>
                </h1>
                <p className="text-base sm:text-lg text-charcoal-muted leading-relaxed max-w-2xl">
                  Discover Dr. Abhishek Anand&apos;s professional background, explore paediatric surgical information and find useful details for contacting New Life Clinic.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-navy hover:bg-navy-light text-white font-semibold text-sm shadow-xs hover:shadow-editorial transition-all"
                >
                  <span>Meet Dr. Anand</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/clinic"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white hover:bg-light-bg text-charcoal hover:text-navy border border-border-subtle font-semibold text-sm transition-all shadow-2xs"
                >
                  <Building2 className="w-4 h-4 text-medical" />
                  <span>Clinic Information</span>
                </Link>
              </div>

              {/* Verified Credentials Pills */}
              <div className="pt-6 border-t border-border-subtle/80 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-charcoal">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-border-subtle">
                  <GraduationCap className="w-4 h-4 text-medical shrink-0" />
                  <div>
                    <span className="font-bold block text-navy">DrNB Paediatric Surgery</span>
                    <span className="text-charcoal-muted text-[11px]">ICH Kolkata</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-border-subtle">
                  <Award className="w-4 h-4 text-teal shrink-0" />
                  <div>
                    <span className="font-bold block text-navy">MBBS, MS (Gen Surg)</span>
                    <span className="text-charcoal-muted text-[11px]">RGUHS Certified</span>
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1 flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-border-subtle">
                  <MapPin className="w-4 h-4 text-medical shrink-0" />
                  <div>
                    <span className="font-bold block text-navy">New Life Clinic</span>
                    <span className="text-charcoal-muted text-[11px]">Soubhagya Nagar, BBSR</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Authentic Professional Portrait */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                <div className="relative rounded-2xl overflow-hidden border border-border-subtle bg-white shadow-editorial">
                  <Image
                    src="/images/dr-abhishek-anand.jpg"
                    alt="Dr. Abhishek Anand - Consultant Paediatric Surgeon"
                    width={480}
                    height={640}
                    priority
                    className="w-full h-auto object-cover object-top aspect-3/4"
                  />
                  
                  {/* Portrait Caption Strip */}
                  <div className="p-4 bg-white/95 backdrop-blur-xs border-t border-border-subtle space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-navy">Dr. Abhishek Anand</span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Consultant Surgeon
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-muted">
                      Paediatric Surgeon & Paediatric Urologist
                    </p>
                    <div className="text-[10px] text-slate-400 pt-1 flex items-center gap-1 border-t border-slate-100">
                      <span>Concept Portrait</span>
                      <span>•</span>
                      <span>Pending Doctor&apos;s High-Res Approved Photo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-hero Clinic Introduction */}
          <div className="mt-14 p-5 sm:p-6 rounded-xl bg-white border border-border-subtle shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal">
                  <Building2 className="w-4 h-4" />
                  <span>Practice Location in Bhubaneswar</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-navy">
                  New Life Clinic, Soubhagya Nagar, Bhubaneswar
                </h2>
                <p className="text-xs sm:text-sm text-charcoal-muted max-w-3xl leading-relaxed">
                  Serving families across Bhubaneswar and Odisha with specialized outpatient surgical consultations, antenatal counselling, and gentle pre- and post-operative follow-up care in a calm, child-friendly clinic environment.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <a
                  href={`tel:${CLINIC_DETAILS.phone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-light text-teal-dark font-semibold text-xs border border-teal/20 hover:bg-teal-subtle transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{CLINIC_DETAILS.phone}</span>
                </a>
                <Link
                  href="/clinic"
                  className="text-xs font-medium text-medical hover:underline"
                >
                  Directions & Timings →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT DOCTOR PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-medical">
              <span>Doctor Profile</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
              Dedicated to the Unique Needs of Growing Bodies
            </h2>
            <p className="text-sm text-charcoal-muted leading-relaxed">
              Dr. Abhishek Anand completed specialized super-specialty training (DrNB) at the prestigious Institute of Child Health (ICH), Kolkata, providing expert care from premature newborns to older teenagers.
            </p>
            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-medical hover:text-medical-hover"
              >
                <span>Read Full Professional Biography</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-white border border-border-subtle shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-lg bg-medical-light text-medical flex items-center justify-center mb-3">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy">
                Super-Specialty Training
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Trained at the Institute of Child Health, Kolkata, Dr. Anand specializes exclusively in paediatric conditions, complex neonatal surgery, and reconstructive urology.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-border-subtle shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-lg bg-teal-light text-teal flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy">
                Gentle & Minimally Invasive
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Whenever appropriate, laparoscopic keyhole techniques are utilized to reduce pain, minimize scarring, and facilitate a fast return to everyday childhood activities.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-border-subtle shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy">
                Transparent Family Guidance
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Every consultation is unhurried. Diagnosis, non-surgical alternatives, and surgical expectations are explained clearly without intimidating medical jargon.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-border-subtle shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-charcoal flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy">
                Hospital Affiliations
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Consults at New Life Clinic and Rahat Hospital (Centre for Woman & Child Care), coordinating hospital surgical admissions at equipped tertiary medical facilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SURGICAL SERVICES OVERVIEW */}
      <section className="bg-light-bg py-16 sm:py-20 border-y border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal">
                <span>Clinical Scope</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
                Confirmed Surgical Specialties
              </h2>
              <p className="text-sm text-charcoal-muted leading-relaxed">
                Dr. Abhishek Anand provides evaluation and surgical management for children from the first hours of life through adolescence.
              </p>
            </div>

            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-medical hover:text-medical-hover"
            >
              <span>View All Detailed Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Location distinction notice */}
          <div className="p-4 rounded-xl bg-medical-light/60 border border-medical/20 text-xs text-navy flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-medical shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Consultation & Surgical Facility Note:</strong> Outpatient evaluations, dressing inspections, and pre-operative counselling are conducted at New Life Clinic, Soubhagya Nagar. Inpatient surgical operations requiring general anaesthesia are performed at partner multi-specialty hospitals in Bhubaneswar.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.slice(0, 5).map((service) => (
              <div
                key={service.id}
                className="p-6 rounded-xl bg-white border border-border-subtle shadow-editorial hover:border-medical/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-light flex items-center justify-center">
                    {iconMap[service.iconName] || <Stethoscope className="w-5 h-5 text-teal" />}
                  </div>
                  <h3 className="text-lg font-bold text-navy">
                    {service.title}
                  </h3>
                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    {service.shortDesc}
                  </p>
                  
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-charcoal uppercase tracking-wider block mb-1">
                      Common Conditions:
                    </span>
                    <ul className="space-y-1 text-xs text-charcoal-muted">
                      {service.commonConditions.slice(0, 3).map((cond, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal/60" />
                          <span>{cond}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-border-subtle flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-slate-500">
                    {service.careLocation}
                  </span>
                  <Link
                    href={`/services#${service.id}`}
                    className="font-semibold text-medical hover:underline inline-flex items-center gap-1"
                  >
                    <span>Read Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}

            {/* Inpatient Hospital Coordination Card */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-navy to-navy-dark text-white border border-navy-light shadow-editorial flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-teal-light">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Hospital Surgical Arrangements
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Surgeries are scheduled in modern operating rooms with specialized paediatric anaesthesia teams and dedicated child recovery suites in Bhubaneswar.
                </p>
                <div className="pt-2 text-xs text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-light shrink-0" />
                    <span>Dedicated Paediatric Anaesthetist</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-light shrink-0" />
                    <span>Neonatal Intensive Care (NICU) Backup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-light shrink-0" />
                    <span>Parent-Present Recovery Protocols</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10">
                <Link
                  href="/services"
                  className="text-xs font-semibold text-teal-light hover:text-white inline-flex items-center gap-1"
                >
                  <span>Learn How Surgery is Arranged</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PARENT INFORMATION ARTICLES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-medical">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Parent Information</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
              Clear Answers for Anxious Moments
            </h2>
            <p className="text-sm text-charcoal-muted leading-relaxed">
              Concise, reputable medical guidance prepared to help parents feel informed, prepared, and reassured.
            </p>
          </div>

          <Link
            href="/parent-information"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-medical hover:text-medical-hover"
          >
            <span>Browse All Guides</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PARENT_ARTICLES.map((article) => (
            <article
              key={article.slug}
              className="p-6 rounded-xl bg-white border border-border-subtle shadow-editorial hover:border-teal/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-charcoal-muted">
                  <span className="font-semibold text-teal">{article.readTime}</span>
                  <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-charcoal-muted">
                    Evidence-Based Guide
                  </span>
                </div>
                <h3 className="text-lg font-bold text-navy hover:text-medical transition-colors">
                  <Link href={`/parent-information/${article.slug}`}>
                    {article.title}
                  </Link>
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                  {article.summary}
                </p>

                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-charcoal uppercase tracking-wider block mb-1.5">
                    Key Highlights:
                  </span>
                  <ul className="space-y-1 text-xs text-charcoal-muted">
                    {article.keyTakeaways.slice(0, 2).map((takeaway, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-border-subtle flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  JOVIX Clinical Review
                </span>
                <Link
                  href={`/parent-information/${article.slug}`}
                  className="font-semibold text-medical hover:underline inline-flex items-center gap-1"
                >
                  <span>Read Full Article</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. NEW LIFE CLINIC SPOTLIGHT */}
      <section className="bg-warm-card py-16 sm:py-20 border-t border-border-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Clinic Details */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal">
                <Building2 className="w-3.5 h-3.5" />
                <span>Primary Clinic Consultation</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
                  New Life Clinic, Soubhagya Nagar
                </h2>
                <p className="text-sm font-medium text-teal-dark">
                  Soubhagya Nagar, Bhubaneswar, Odisha — 751003
                </p>
                <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                  A tranquil, family-friendly medical facility designed to give parents plenty of time to discuss their child&apos;s condition without feeling rushed.
                </p>
              </div>

              {/* Verified Information Box */}
              <div className="p-5 rounded-xl bg-white border border-border-subtle shadow-2xs space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-navy">
                      Consultation Hours
                    </h3>
                    <p className="text-xs text-charcoal mt-0.5">
                      <strong>Monday to Saturday:</strong> 5:00 PM – 9:00 PM (Evening OPD)
                    </p>
                    <p className="text-xs text-charcoal-muted mt-0.5">
                      Sunday: By prior emergency arrangement
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-border-subtle">
                  <Phone className="w-5 h-5 text-medical shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-navy">
                      Appointments & Enquiries
                    </h3>
                    <a
                      href={`tel:${CLINIC_DETAILS.phone.replace(/\s+/g, "")}`}
                      className="text-base font-bold text-medical hover:underline block"
                    >
                      {CLINIC_DETAILS.phone}
                    </a>
                    <p className="text-xs text-charcoal-muted mt-0.5">
                      Please call during clinic hours for slot availability.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-border-subtle">
                  <MapPin className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-navy">
                      Location & Landmark
                    </h3>
                    <p className="text-xs text-charcoal-muted mt-0.5">
                      Soubhagya Nagar, Baramunda locality, Bhubaneswar, Odisha 751003.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`tel:${CLINIC_DETAILS.phone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-medical hover:bg-medical-hover text-white text-sm font-semibold shadow-xs transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {CLINIC_DETAILS.phone}</span>
                </a>
                <Link
                  href="/appointments"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-teal-light text-teal-dark border border-teal/20 hover:bg-teal-subtle text-sm font-semibold transition-all"
                >
                  <Calendar className="w-4 h-4 text-teal" />
                  <span>Appointments & Queue</span>
                </Link>
                <a
                  href={CLINIC_DETAILS.googleMapsQuery}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white border border-border-subtle text-charcoal hover:bg-light-bg text-sm font-semibold transition-all"
                >
                  <MapPin className="w-4 h-4 text-teal" />
                  <span>Open in Maps</span>
                </a>
              </div>
            </div>

            {/* Right: Clinic Photo & Features */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-border-subtle bg-white shadow-editorial">
                <Image
                  src="/images/new-life-clinic.jpg"
                  alt="New Life Clinic Bhubaneswar Consultation Room"
                  width={640}
                  height={360}
                  className="w-full h-auto object-cover aspect-16/9"
                />
                <div className="p-4 bg-white border-t border-border-subtle">
                  <span className="text-xs font-semibold text-navy block">
                    New Life Clinic — Soubhagya Nagar, Bhubaneswar
                  </span>
                  <span className="text-[11px] text-charcoal-muted">
                    Warm, clean, child-friendly environment with gentle examination amenities.
                  </span>
                </div>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-border-subtle">
                  <span className="font-bold text-navy block">Child-Friendly Nook</span>
                  <span className="text-charcoal-muted text-[11px]">Calm waiting spaces</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-border-subtle">
                  <span className="font-bold text-navy block">Easy Parking</span>
                  <span className="text-charcoal-muted text-[11px]">Ground floor access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION FOR PARENTS */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="p-8 sm:p-12 rounded-2xl bg-navy text-white text-center space-y-6 shadow-editorial border border-navy-light">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/20 text-teal-light text-xs font-semibold tracking-wider uppercase">
            <Calendar className="w-3.5 h-3.5" />
            SCHEDULE A VISIT
          </div>
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Have Questions About Your Child&apos;s Surgical Health?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Dr. Abhishek Anand is available for unhurried outpatient consultations at New Life Clinic, Soubhagya Nagar, Bhubaneswar. Get clear, reassuring surgical guidance for your child.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <a
              href={`tel:${CLINIC_DETAILS.phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-medical hover:bg-medical-hover text-white text-sm font-semibold shadow-xs transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Call Clinic: {CLINIC_DETAILS.phone}</span>
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/20 transition-all"
            >
              <span>Contact Page & Location</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
