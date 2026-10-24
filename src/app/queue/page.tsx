import React from "react";
import Link from "next/link";
import { 
  Ticket, 
  Clock, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Home, 
  Calendar 
} from "lucide-react";
import { CLINIC_DETAILS } from "@/data/doctorData";

export const metadata = {
  title: "OPD Waiting Queue & Live Token Status | Dr. Abhishek Anand",
  description: "Check live OPD queue policies, sequential tokens, and consultation timings at New Life Clinic, Soubhagya Nagar, Bhubaneswar."
};

export default function PublicQueuePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Navigation */}
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
          <Ticket className="w-3.5 h-3.5 text-teal" />
          <span>OPD Waiting Room & Live Token Queue</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy tracking-tight">
          Real-Time Clinic Queue & Outpatient Flow
        </h1>
        <p className="text-sm sm:text-base text-charcoal-muted leading-relaxed max-w-3xl">
          New Life Clinic uses a transparent sequential token system to minimize waiting times for young children and infants. Review today&apos;s queue procedure or access the staff queue board.
        </p>
      </div>

      {/* Queue Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Token Process Card */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-border-subtle shadow-editorial space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-border-subtle">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy">OPD Token Procedure</h2>
              <p className="text-xs text-charcoal-muted">How children are called into the cabin</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs text-charcoal">
            <div className="p-3 bg-light-bg rounded-xl border border-border-subtle">
              <span className="font-bold text-navy block text-sm mb-1">1. Arrival & Check-In</span>
              <p className="text-charcoal-muted">
                Report to the reception desk at New Life Clinic on arrival. Your child is issued the next sequential token (e.g. T-01, T-02, T-03).
              </p>
            </div>

            <div className="p-3 bg-light-bg rounded-xl border border-border-subtle">
              <span className="font-bold text-navy block text-sm mb-1">2. Cabin Calling</span>
              <p className="text-charcoal-muted">
                Dr. Abhishek Anand calls each token directly into the consultation cabin. Average slot time is 15–20 minutes to allow thorough clinical examination.
              </p>
            </div>

            <div className="p-3 bg-light-bg rounded-xl border border-border-subtle">
              <span className="font-bold text-navy block text-sm mb-1">3. Priority Triage</span>
              <p className="text-charcoal-muted">
                Neonates (babies under 28 days) and acute surgical emergencies are prioritized to ensure rapid care.
              </p>
            </div>
          </div>
        </div>

        {/* Staff Queue Management Access */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-border-subtle shadow-editorial space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-border-subtle">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1769D2] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy">Live Digital Queue Board</h2>
              <p className="text-xs text-charcoal-muted">Doctor & Reception Staff Workspace</p>
            </div>
          </div>

          <p className="text-xs text-charcoal-muted leading-relaxed">
            Authorized staff and Dr. Anand manage live check-ins, advance the token board, and record digital notes in the Clinic Management System.
          </p>

          <div className="pt-4 space-y-3">
            <Link
              href="/clinic-login?from=/portal/appointments"
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-[#1769D2] hover:bg-[#1258b5] text-white text-xs font-bold transition-all shadow-xs"
            >
              <Ticket className="w-4 h-4" />
              <span>Open Staff Live Queue & Appointments</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/appointments"
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl border border-border-subtle bg-light-bg hover:bg-slate-200 text-charcoal text-xs font-semibold transition-all"
            >
              <Calendar className="w-4 h-4 text-teal" />
              <span>View Appointment Schedule Info</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Helpline Contact Footer */}
      <div className="p-6 rounded-2xl bg-white border border-border-subtle shadow-editorial flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm font-bold text-navy">Need Immediate Assistance with Queue or Timing?</h3>
          <p className="text-xs text-charcoal-muted">
            Call New Life Clinic reception at {CLINIC_DETAILS.phone} (5:00 PM – 9:00 PM)
          </p>
        </div>

        <a
          href={`tel:${CLINIC_DETAILS.phone.replace(/\s+/g, "")}`}
          className="px-5 py-2.5 rounded-xl bg-medical hover:bg-medical-hover text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 shrink-0"
        >
          <Phone className="w-4 h-4" />
          <span>Call Reception</span>
        </a>
      </div>
    </div>
  );
}
