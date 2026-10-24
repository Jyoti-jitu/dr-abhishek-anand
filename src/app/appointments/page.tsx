import React from "react";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  Phone, 
  MapPin, 
  Ticket, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  Lock,
  Home
} from "lucide-react";
import { CLINIC_DETAILS } from "@/data/doctorData";

export const metadata = {
  title: "Paediatric Surgery Appointments & OPD Queue | Dr. Abhishek Anand",
  description: "Schedule consultations and review OPD queue timings for Dr. Abhishek Anand at New Life Clinic, Soubhagya Nagar, Bhubaneswar."
};

export default function PublicAppointmentsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb / Top Back Link */}
      <div className="flex items-center justify-between text-xs text-charcoal-muted border-b border-border-subtle pb-4">
        <Link href="/" className="inline-flex items-center gap-1.5 hover:text-navy transition-colors font-semibold">
          <Home className="w-3.5 h-3.5" />
          <span>Return Home</span>
        </Link>
        <span className="text-teal font-semibold flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> OPD Evening Clinic: 5:00 PM – 9:00 PM
        </span>
      </div>

      {/* Hero Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-light text-teal-dark border border-teal/30">
          <Calendar className="w-3.5 h-3.5 text-teal" />
          <span>Consultation Schedule & OPD Token Queue</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy tracking-tight">
          Paediatric Surgical Appointments & Queue Management
        </h1>
        <p className="text-sm sm:text-base text-charcoal-muted leading-relaxed max-w-3xl">
          Consult Dr. Abhishek Anand (Consultant Paediatric Surgeon & Paediatric Urologist) at New Life Clinic, Bhubaneswar. Learn how appointments, walk-in tokens, and clinic queueing work for children and families.
        </p>
      </div>

      {/* Main Grid: How Appointments Work & Contact Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Card 1: Parent Booking Information */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-border-subtle shadow-editorial space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-border-subtle">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1769D2] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy">How Parents Book a Visit</h2>
              <p className="text-xs text-charcoal-muted">Simple, direct outpatient booking</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-charcoal">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-navy">Prior Phone Scheduling:</strong> Call the dedicated clinic helpline at{" "}
                <a href={`tel:${CLINIC_DETAILS.phone.replace(/\s+/g, "")}`} className="font-bold text-medical hover:underline">
                  {CLINIC_DETAILS.phone}
                </a>{" "}
                between 4:00 PM and 9:00 PM to reserve a consultation slot.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-navy">Walk-in OPD Tokens:</strong> Same-day tokens (T-01, T-02, etc.) are issued on arrival at the clinic reception desk from 5:00 PM onwards.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-navy">Infant & Emergency Priority:</strong> Newborns and acute surgical referrals (severe pain, vomiting, strangulated hernia) receive immediate triage priority.
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href={`tel:${CLINIC_DETAILS.phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-medical hover:bg-medical-hover text-white text-xs font-bold transition-all shadow-xs"
            >
              <Phone className="w-4 h-4" />
              <span>Call {CLINIC_DETAILS.phone}</span>
            </a>
            <Link
              href="/clinic"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-subtle bg-light-bg hover:bg-slate-200 text-charcoal text-xs font-semibold transition-all"
            >
              <Building2 className="w-4 h-4 text-teal" />
              <span>Clinic Location</span>
            </Link>
          </div>
        </div>

        {/* Card 2: Live Queue & Staff CMS Access */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-border-subtle shadow-editorial space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-border-subtle">
            <div className="w-10 h-10 rounded-xl bg-teal-light text-teal-dark flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy">Clinic Staff & Live OPD Portal</h2>
              <p className="text-xs text-charcoal-muted">Authorized clinic management</p>
            </div>
          </div>

          <p className="text-xs text-charcoal-muted leading-relaxed">
            Clinic receptionists and Dr. Abhishek Anand manage the real-time OPD waiting room tokens, appointment time slots, and patient EMR records via the secure New Life Clinic Staff Portal.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-semibold">Clinic Session:</span>
              <span className="font-mono font-bold text-navy">Evening (5:00 PM – 9:00 PM)</span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-semibold">Token System:</span>
              <span className="text-emerald-700 font-bold">Sequential (T-01, T-02...)</span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-semibold">Staff CMS:</span>
              <span className="text-[#1769D2] font-semibold">Active for authorized personnel</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/clinic-login?from=/portal/appointments"
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-navy hover:bg-navy-light text-white text-xs font-bold transition-all shadow-xs"
            >
              <Lock className="w-4 h-4 text-teal" />
              <span>Open Staff Portal (Appointments & Queue)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Consultation Timings & Landmark Banner */}
      <div className="p-6 rounded-2xl bg-navy text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-teal">Daily Clinic Schedule</span>
          <h3 className="text-lg font-bold text-white">New Life Clinic, Soubhagya Nagar</h3>
          <p className="text-xs text-slate-300">
            Monday to Saturday: 5:00 PM – 9:00 PM • Soubhagya Nagar, Bhubaneswar, Odisha 751003
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-white text-xs font-semibold transition-colors"
          >
            Home Page
          </Link>
          <Link
            href="/contact"
            className="px-4 py-2.5 rounded-xl bg-medical hover:bg-medical-hover text-white text-xs font-bold transition-colors"
          >
            Contact Clinic
          </Link>
        </div>
      </div>
    </div>
  );
}
