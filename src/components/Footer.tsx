import React from "react";
import Link from "next/link";
import { CLINIC_DETAILS, DOCTOR_DETAILS } from "@/data/doctorData";
import { Phone, Mail, MapPin, Clock, ExternalLink, AlertTriangle } from "lucide-react";

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="bg-navy text-slate-300 pt-16 pb-12 border-t border-navy-light/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Urgent Medical Emergency Note */}
        <div className="mb-12 p-4 rounded-xl bg-navy-dark/90 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300 text-sm">
                Emergency Medical Notice
              </p>
              <p className="text-slate-300 mt-0.5 leading-relaxed">
                This website is for informational and outpatient consultation scheduling only. If your child is experiencing an acute, severe medical emergency (such as breathing difficulty, severe trauma, or acute scrotal pain), please proceed immediately to the nearest hospital emergency paediatric department.
              </p>
            </div>
          </div>
          <a
            href="tel:108"
            className="shrink-0 px-3.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 font-medium transition-colors"
          >
            National Ambulance: 108
          </a>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-navy-light/50">
          {/* Identity & Mission */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white">
                {DOCTOR_DETAILS.name}
              </h3>
              <p className="text-sm font-medium text-teal-light mt-0.5">
                {DOCTOR_DETAILS.title}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                MBBS (RGUHS), MS (Gen Surg), DrNB (Paediatric Surgery - ICH Kolkata)
              </p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Specialist surgical consultations, paediatric urology, and neonatal care in Bhubaneswar, Odisha. Dedicated to gentle surgical care and transparent guidance for families.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal/20 text-teal-light border border-teal/30">
                <span>New Life Clinic Partner</span>
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Website Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Dr. Abhishek Anand
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Surgical & Clinical Services
                </Link>
              </li>
              <li>
                <Link href="/parent-information" className="hover:text-white transition-colors">
                  Parent Guidance & Articles
                </Link>
              </li>
              <li>
                <Link href="/clinic" className="hover:text-white transition-colors">
                  New Life Clinic, Bhubaneswar
                </Link>
              </li>
              <li>
                <Link href="/appointments" className="hover:text-white transition-colors">
                  Appointments & OPD Queue
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact & Directions
                </Link>
              </li>
            </ul>
          </div>

          {/* Educational Guides for Parents */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Parent Resources
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link
                  href="/parent-information/what-does-a-paediatric-surgeon-do"
                  className="hover:text-white transition-colors line-clamp-1"
                >
                  What Does a Paediatric Surgeon Do?
                </Link>
              </li>
              <li>
                <Link
                  href="/parent-information/preparing-for-your-child-consultation"
                  className="hover:text-white transition-colors line-clamp-1"
                >
                  Preparing for Your Child&apos;s Consultation
                </Link>
              </li>
              <li>
                <Link
                  href="/parent-information/understanding-common-surgical-conditions"
                  className="hover:text-white transition-colors line-clamp-1"
                >
                  Understanding Common Surgical Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/parent-information/questions-parents-may-wish-to-ask"
                  className="hover:text-white transition-colors line-clamp-1"
                >
                  Questions Parents May Wish to Ask
                </Link>
              </li>
              <li className="pt-1">
                <Link
                  href="/parent-information"
                  className="text-teal-light hover:underline font-medium inline-flex items-center gap-1"
                >
                  <span>View All 4 Guides</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinic Information & Timings */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              New Life Clinic
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                <span>
                  {CLINIC_DETAILS.address}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal shrink-0" />
                <a
                  href={`tel:${CLINIC_DETAILS.phone.replace(/\s+/g, "")}`}
                  className="hover:text-white font-medium text-teal-light transition-colors"
                >
                  {CLINIC_DETAILS.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-teal shrink-0" />
                <a
                  href={`mailto:${CLINIC_DETAILS.email}`}
                  className="hover:text-white transition-colors"
                >
                  {CLINIC_DETAILS.email}
                </a>
              </div>
              <div className="flex items-start gap-2.5 pt-1">
                <Clock className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-white">Mon – Sat: 5:00 PM – 9:00 PM</span>
                  <span className="text-slate-400">Sunday: Closed for routine OPD</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Legal & Attribution */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-4 text-center md:text-left">
            <span>© {currentYear} Dr. Abhishek Anand. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <Link href="/privacy-policy" className="hover:text-slate-200 transition-colors">
              Privacy Policy
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link href="/medical-disclaimer" className="hover:text-slate-200 transition-colors">
              Medical Disclaimer
            </Link>
          </div>

          {/* Jovix Technologies Attribution as requested */}
          <div className="flex items-center gap-2 text-center md:text-right">
            <span>Website concept prepared by</span>
            <a
              href="https://www.jovix.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-teal-light hover:text-white transition-colors underline decoration-teal/40 underline-offset-2"
            >
              JOVIX Technologies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
