"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Play, 
  Plus, 
  FileText, 
  Pill, 
  Search, 
  AlertCircle, 
  ArrowRight, 
  Stethoscope, 
  Building2, 
  ChevronRight, 
  RefreshCw, 
  Baby, 
  AlertTriangle, 
  Ticket,
  X,
  UserPlus
} from "lucide-react";

interface QueueItem {
  id: string;
  tokenCode: string;
  tokenNumber: number;
  queueStatus: string;
  checkInTime: string;
  priorityLevel: string;
  patientId?: string;
  appointmentId?: string;
  patient?: {
    id: string;
    patientId: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
    contactNumber: string;
    parentGuardianName: string;
    allergies?: string;
  };
  appointment?: {
    id: string;
    appointmentTime: string;
    reasonForVisit: string;
    consultationType: string;
  };
}

interface AppointmentItem {
  id: string;
  appointmentNumber: string;
  appointmentDate?: string;
  appointmentTime: string;
  status: string;
  consultationType: string;
  reasonForVisit: string;
  tokenCode?: string;
  tokenNumber?: number;
  patientId?: string;
  patient?: {
    id: string;
    patientId: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
    contactNumber: string;
    parentGuardianName: string;
  };
}

function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function calculateAge(dob?: string) {
  if (!dob) return "";
  const birth = new Date(dob);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years === 0) {
    return `${Math.max(1, months)} mo`;
  }
  return `${years} yr${years > 1 ? "s" : ""}`;
}

function DoctorDashboardContent() {
  const router = useRouter();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [recentConsultations, setRecentConsultations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"QUEUE" | "SCHEDULE">("QUEUE");
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Date filtering state - dynamic local date
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // Quick Book / Walk-in Modal State
  const [showQuickBookModal, setShowQuickBookModal] = useState(false);
  const [allPatients, setAllPatients] = useState<any[]>([]);
  const [bookingPatientId, setBookingPatientId] = useState("");
  const [bookingDate, setBookingDate] = useState(getTodayDateString());
  const [bookingTime, setBookingTime] = useState("05:00 PM");
  const [bookingType, setBookingType] = useState("GENERAL");
  const [bookingReason, setBookingReason] = useState("");
  const [bookingAssignTicketNow, setBookingAssignTicketNow] = useState(true);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const fetchData = async (targetDate = selectedDate) => {
    try {
      setIsLoading(true);
      const queueUrl = targetDate === "ALL" ? "/api/queue?date=ALL" : `/api/queue?date=${targetDate}`;
      const aptUrl = targetDate === "ALL" ? "/api/appointments?date=ALL" : `/api/appointments?date=${targetDate}`;

      const [queueRes, aptRes, cnsRes] = await Promise.all([
        fetch(queueUrl),
        fetch(aptUrl),
        fetch("/api/consultations")
      ]);

      const queueData = await queueRes.json();
      const aptData = await aptRes.json();
      const cnsData = await cnsRes.json();

      if (queueData.queue) setQueue(queueData.queue);
      if (aptData.appointments) setAppointments(aptData.appointments);
      if (cnsData.consultations) setRecentConsultations(cnsData.consultations.slice(0, 5));
    } catch (err) {
      console.error("Error loading doctor dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    fetch("/api/patients")
      .then(res => res.json())
      .then(data => {
        if (data.patients) setAllPatients(data.patients);
      })
      .catch(console.error);
  }, []);

  const handleCheckInAppointment = async (apt: AppointmentItem) => {
    try {
      const pId = apt.patient?.id || apt.patientId;
      const aptDate = apt.appointmentDate || (selectedDate === "ALL" ? getTodayDateString() : selectedDate);

      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: apt.id,
          patientId: pId,
          date: aptDate,
          priorityLevel: "NORMAL"
        })
      });
      const data = await res.json();
      if (data.token) {
        fetchData();
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error("Error issuing ticket:", err);
    }
  };

  const handleQuickBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingPatientId) {
      alert("Please select a child patient.");
      return;
    }
    try {
      setIsSubmittingBooking(true);
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: bookingPatientId,
          doctorId: "usr_doctor_01",
          appointmentDate: bookingDate,
          appointmentTime: bookingTime,
          consultationType: bookingType,
          reasonForVisit: bookingReason || "OPD Clinical Consultation",
          checkInImmediately: bookingAssignTicketNow
        })
      });
      const data = await res.json();
      if (data.appointment) {
        setShowQuickBookModal(false);
        setBookingReason("");
        if (selectedDate !== "ALL" && selectedDate !== bookingDate) {
          setSelectedDate(bookingDate);
        } else {
          fetchData();
        }
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error("Quick booking error:", err);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleSearchPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientSearchQuery.trim()) return;

    try {
      setIsSearching(true);
      const res = await fetch(`/api/patients?q=${encodeURIComponent(patientSearchQuery.trim())}`);
      const data = await res.json();
      if (data.patients) {
        setSearchResults(data.patients);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdateQueueStatus = async (queueId: string, newStatus: string) => {
    try {
      await fetch("/api/queue", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queueId, status: newStatus })
      });
      fetchData();
    } catch (err) {
      console.error("Queue update error:", err);
    }
  };

  // Metrics computation from real database values
  const waitingPatients = queue.filter(q => q.queueStatus === "WAITING");
  const inConsultationPatient = queue.find(q => q.queueStatus === "IN_CONSULTATION");
  const completedTodayCount = queue.filter(q => q.queueStatus === "COMPLETED").length;
  const totalTodayApts = appointments.length;

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions Strip */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#12304A]">
              Dr. Abhishek Anand
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#1769D2] border border-blue-200">
              Cabin Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-700">Evening OPD: 5:00 PM – 9:00 PM</span>
            <span>•</span>
            <span>New Life Clinic, Soubhagya Nagar, Bhubaneswar</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => fetchData()}
            className="p-2.5 text-slate-500 hover:text-[#1769D2] hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            title="Refresh clinical data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#1769D2]" : ""}`} />
          </button>
          <button
            onClick={() => {
              setBookingDate(selectedDate === "ALL" ? getTodayDateString() : selectedDate);
              setShowQuickBookModal(true);
            }}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            title="Book an appointment or issue a walk-in token"
          >
            <Ticket className="w-4 h-4" />
            <span>Book / Assign Ticket</span>
          </button>
          <Link
            href="/portal/consultations/new"
            className="px-4 py-2.5 bg-[#1769D2] hover:bg-[#1258b5] text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Consultation</span>
          </Link>
          <Link
            href="/portal/appointments"
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors hidden md:inline-flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Schedule</span>
          </Link>
        </div>
      </div>

      {/* 2. Clinical KPI Metrics (4 Clean Uniform Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span>Waiting Room</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{waitingPatients.length}</div>
          <p className="text-[11px] text-amber-700 font-medium">Patients waiting for token call</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span>Inside Cabin</span>
            <Stethoscope className="w-4 h-4 text-[#1769D2]" />
          </div>
          <div className="text-2xl font-black text-[#1769D2]">
            {inConsultationPatient ? inConsultationPatient.tokenCode : "Ready"}
          </div>
          <p className="text-[11px] text-slate-500 truncate font-medium">
            {inConsultationPatient?.patient?.fullName || "Awaiting next patient"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{completedTodayCount}</div>
          <p className="text-[11px] text-emerald-700 font-medium">Consultations signed today</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span>Today&apos;s Bookings</span>
            <Calendar className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalTodayApts}</div>
          <p className="text-[11px] text-slate-500 font-medium">Scheduled OPD consultations</p>
        </div>
      </div>

      {/* 3. Hero Cabin Card (When a patient is actively in consultation) */}
      {inConsultationPatient && inConsultationPatient.patient && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white border-2 border-[#1769D2] shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/60 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-[#1769D2] text-white font-black text-sm flex items-center justify-center shadow-xs">
                {inConsultationPatient.tokenCode}
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1769D2] block">
                  Active in Doctor Cabin
                </span>
                <span className="text-xs text-slate-500">
                  Checked in at {inConsultationPatient.checkInTime ? new Date(inConsultationPatient.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Earlier"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/portal/consultations/new?patientId=${inConsultationPatient.patient.id}&appointmentId=${inConsultationPatient.appointment?.id || ""}`}
                className="px-4 py-2 bg-[#1769D2] hover:bg-[#1258b5] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Open EMR & Prescribe</span>
              </Link>
              <button
                onClick={() => handleUpdateQueueStatus(inConsultationPatient.id, "COMPLETED")}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Mark Finished</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Patient Name & Age:</span>
              <span className="text-base font-bold text-slate-900 block">
                {inConsultationPatient.patient.fullName}
              </span>
              <span className="text-slate-500">
                {calculateAge(inConsultationPatient.patient.dateOfBirth)} • {inConsultationPatient.patient.gender} • ID: {inConsultationPatient.patient.patientId}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Parent / Guardian:</span>
              <span className="font-semibold text-slate-800 block">
                {inConsultationPatient.patient.parentGuardianName}
              </span>
              <span className="text-slate-500 font-mono">
                {inConsultationPatient.patient.contactNumber}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Chief Reason / Visit:</span>
              <span className="font-semibold text-slate-800 block">
                {inConsultationPatient.appointment?.reasonForVisit || "Paediatric surgical review"}
              </span>
              <span className="text-slate-500">
                Type: {(inConsultationPatient.appointment?.consultationType || "GENERAL").replace("_", " ")}
              </span>
            </div>
          </div>

          {inConsultationPatient.patient.allergies && inConsultationPatient.patient.allergies !== "None" && inConsultationPatient.patient.allergies !== "No known drug allergies (NKDA)" && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Medical Alert: {inConsultationPatient.patient.allergies}</span>
            </div>
          )}
        </div>
      )}

      {/* 4. Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Queue & Today's Schedule Tabs */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Card Header with View Switcher & Date Controls */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("QUEUE")}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
                  activeTab === "QUEUE"
                    ? "bg-white text-[#12304A] shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Ticket className="w-3.5 h-3.5 text-[#1769D2]" />
                <span>Live Waiting Queue ({waitingPatients.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("SCHEDULE")}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
                  activeTab === "SCHEDULE"
                    ? "bg-white text-[#12304A] shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-[#1769D2]" />
                <span>Schedule ({appointments.length})</span>
              </button>
            </div>

            {/* Date Selector for Doctor OPD Schedule & Queue */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <button
                onClick={() => setSelectedDate(getTodayDateString())}
                className={`px-2.5 py-1 font-semibold rounded-lg border transition-colors ${
                  selectedDate === getTodayDateString()
                    ? "bg-[#1769D2] text-white border-[#1769D2]"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setSelectedDate("ALL")}
                className={`px-2.5 py-1 font-semibold rounded-lg border transition-colors ${
                  selectedDate === "ALL"
                    ? "bg-[#1769D2] text-white border-[#1769D2]"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                All Dates
              </button>
              <input
                type="date"
                value={selectedDate === "ALL" ? getTodayDateString() : selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2.5 py-1 font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1769D2]"
              />
            </div>
          </div>

          {/* TAB 1: LIVE WAITING QUEUE */}
          {activeTab === "QUEUE" && (
            <div>
              {isLoading ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#1769D2] mx-auto mb-2" />
                  <span>Loading waiting queue...</span>
                </div>
              ) : waitingPatients.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-800">Waiting Room is Currently Clear</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    No children are currently waiting in the OPD queue. New arrivals will appear automatically when checked in or assigned a ticket.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {waitingPatients.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 flex flex-col items-center justify-center shrink-0">
                          <span className="text-[9px] font-bold uppercase leading-none">Token</span>
                          <span className="text-base font-black leading-tight">{item.tokenCode}</span>
                        </div>

                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">
                              {item.patient?.fullName || "Patient"}
                            </h4>
                            <span className="text-slate-400 font-mono text-[11px]">
                              {calculateAge(item.patient?.dateOfBirth)} • {item.patient?.gender}
                            </span>
                            {item.priorityLevel === "INFANT_PRIORITY" && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                                <Baby className="w-3 h-3" /> Infant
                              </span>
                            )}
                          </div>

                          <p className="text-slate-500">
                            Parent: <span className="font-medium text-slate-700">{item.patient?.parentGuardianName}</span> • Contact: <span className="font-mono text-slate-700">{item.patient?.contactNumber}</span>
                          </p>
                          <p className="text-slate-700 font-medium">
                            Reason: {item.appointment?.reasonForVisit || "OPD consultation"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleUpdateQueueStatus(item.id, "IN_CONSULTATION")}
                          className="px-4 py-2 bg-[#1769D2] hover:bg-[#1258b5] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Call In</span>
                        </button>
                        <Link
                          href={`/portal/patients/${item.patient?.id}`}
                          className="px-3 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl transition-colors"
                        >
                          History
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TODAY'S SCHEDULE */}
          {activeTab === "SCHEDULE" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Slot Time</th>
                    <th className="py-3 px-4">Patient & Guardian</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No appointments found for {selectedDate === "ALL" ? "all dates" : selectedDate}.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((apt) => {
                      const queueItem = queue.find(q => q.appointment?.id === apt.id || q.appointmentId === apt.id);
                      return (
                        <tr key={apt.id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                            <span className="block">{apt.appointmentTime}</span>
                            {selectedDate === "ALL" && apt.appointmentDate && (
                              <span className="text-[10px] text-slate-400 block font-normal">{apt.appointmentDate}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <Link
                              href={`/portal/patients/${apt.patient?.id || (apt as any).patientId}`}
                              className="font-bold text-[#1769D2] hover:underline block"
                            >
                              {apt.patient?.fullName || "Patient"}
                            </Link>
                            <span className="text-[11px] text-slate-500">
                              {calculateAge(apt.patient?.dateOfBirth)} • Parent: {apt.patient?.parentGuardianName || (apt.patient as any)?.guardianName || "N/A"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 capitalize font-medium">
                            {(apt.consultationType || "GENERAL").toLowerCase().replace("_", " ")}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                            {apt.reasonForVisit}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              apt.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                              apt.status === "IN_CONSULTATION" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                              apt.status === "WAITING" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                              "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}>
                              {apt.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                            {apt.status === "SCHEDULED" && (
                              <button
                                onClick={() => handleCheckInAppointment(apt)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5"
                                title="Assign sequential ticket of the day according to slot"
                              >
                                <Ticket className="w-3.5 h-3.5" />
                                <span>Assign Ticket</span>
                              </button>
                            )}

                            {apt.status === "WAITING" && (
                              <div className="inline-flex items-center gap-2">
                                {(apt.tokenCode || queueItem?.tokenCode) && (
                                  <span className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-300 font-black text-xs rounded-lg inline-flex items-center gap-1 shadow-xs">
                                    <Ticket className="w-3.5 h-3.5 text-amber-600" />
                                    {apt.tokenCode || queueItem?.tokenCode}
                                  </span>
                                )}
                                {queueItem && (
                                  <button
                                    onClick={() => handleUpdateQueueStatus(queueItem.id, "IN_CONSULTATION")}
                                    className="px-2.5 py-1 bg-[#1769D2] hover:bg-[#1258b5] text-white text-xs font-bold rounded-lg shadow-xs transition-colors inline-flex items-center gap-1"
                                    title="Call into Cabin"
                                  >
                                    <Play className="w-3 h-3 fill-current" />
                                    <span>Call In</span>
                                  </button>
                                )}
                              </div>
                            )}

                            {apt.status === "IN_CONSULTATION" && (
                              <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold rounded-lg inline-flex items-center gap-1">
                                <Stethoscope className="w-3.5 h-3.5" /> In Cabin
                              </span>
                            )}

                            {apt.status === "COMPLETED" && (
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Done
                              </span>
                            )}

                            <Link
                              href={`/portal/patients/${apt.patient?.id || (apt as any).patientId}`}
                              className="px-2 py-1 text-slate-500 hover:text-[#1769D2] font-semibold text-xs inline-block ml-1"
                            >
                              Profile →
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Search, Quick Actions & Recent EMR */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Quick Patient Search */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-[#1769D2]" />
              <span>Search Patient File</span>
            </h3>

            <form onSubmit={handleSearchPatient} className="flex gap-2">
              <input
                type="text"
                value={patientSearchQuery}
                onChange={(e) => setPatientSearchQuery(e.target.value)}
                placeholder="Child's name, ID, or phone..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1769D2] outline-none"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-3.5 py-2 bg-[#12304A] hover:bg-[#1b4367] text-white text-xs font-bold rounded-xl transition-colors shrink-0"
              >
                {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Search"}
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-1.5 max-h-52 overflow-y-auto text-xs">
                <span className="text-[11px] font-semibold text-slate-400">
                  {searchResults.length} Match(es):
                </span>
                {searchResults.map((p) => (
                  <Link
                    key={p.id}
                    href={`/portal/patients/${p.id}`}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-[#1769D2] hover:bg-blue-50/40 flex items-center justify-between transition-colors block"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{p.fullName}</span>
                      <span className="text-[11px] text-slate-500">
                        {p.patientId} • Parent: {p.parentGuardianName || p.guardianName}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 2. Quick Clinical Shortcuts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Clinical Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/portal/consultations/new"
                className="p-3 rounded-xl border border-slate-200 hover:border-[#1769D2] hover:bg-blue-50/30 transition-all flex flex-col space-y-1"
              >
                <FileText className="w-4 h-4 text-[#1769D2]" />
                <span className="font-bold text-slate-900">New Clinical Note</span>
                <span className="text-[10px] text-slate-400">Digital EMR visit</span>
              </Link>

              <Link
                href="/portal/patients"
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex flex-col space-y-1"
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-900">Patient Directory</span>
                <span className="text-[10px] text-slate-400">Registered children</span>
              </Link>

              <Link
                href="/portal/prescriptions"
                className="p-3 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/30 transition-all flex flex-col space-y-1"
              >
                <Pill className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-slate-900">Prescriptions</span>
                <span className="text-[10px] text-slate-400">Signed Rx orders</span>
              </Link>

              <Link
                href="/portal/appointments"
                className="p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/30 transition-all flex flex-col space-y-1"
              >
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-slate-900">Appointments</span>
                <span className="text-[10px] text-slate-400">Manage queue slots</span>
              </Link>
            </div>
          </div>

          {/* 3. Recent Signed Consultations */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Recent Consultations
              </h3>
              <Link
                href="/portal/consultations"
                className="text-[11px] text-[#1769D2] font-semibold hover:underline"
              >
                All Records →
              </Link>
            </div>

            {recentConsultations.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No recent consultations recorded.
              </p>
            ) : (
              <div className="space-y-2.5">
                {recentConsultations.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 text-xs space-y-1 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {c.patient?.fullName || "Child Patient"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {c.consultationDate}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#1769D2] truncate">
                      {c.primaryDiagnosis || "General Review"}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-400 font-mono">{c.consultationNumber}</span>
                      <Link
                        href={`/portal/patients/${c.patientId}`}
                        className="text-slate-600 font-semibold hover:text-[#1769D2] inline-flex items-center gap-0.5"
                      >
                        <span>History</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Quick Book / Walk-in Ticket Modal */}
      {showQuickBookModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#12304A] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Book Appointment / Issue Ticket</h3>
              </div>
              <button
                onClick={() => setShowQuickBookModal(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickBookAppointment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Child Patient *</label>
                <select
                  value={bookingPatientId}
                  onChange={(e) => setBookingPatientId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1769D2] outline-none text-xs"
                >
                  <option value="">-- Choose Patient --</option>
                  {allPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.patientId}) — Parent: {p.parentGuardianName || p.guardianName || "N/A"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Appointment Date *</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1769D2] outline-none text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Slot Time *</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1769D2] outline-none text-xs font-mono font-medium"
                  >
                    {["05:00 PM", "05:20 PM", "05:40 PM", "06:00 PM", "06:20 PM", "06:40 PM", "07:00 PM", "07:20 PM", "07:40 PM", "08:00 PM", "08:20 PM", "08:40 PM"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Consultation Type</label>
                  <select
                    value={bookingType}
                    onChange={(e) => setBookingType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1769D2] outline-none text-xs"
                  >
                    <option value="GENERAL">General Paediatric Review</option>
                    <option value="NEW_CONSULTATION">New Consultation</option>
                    <option value="POST_OP_REVIEW">Post-Op Review</option>
                    <option value="SECOND_OPINION">Second Opinion</option>
                    <option value="SURGICAL_CONSULTATION">Surgical Consultation</option>
                    <option value="EMERGENCY">Emergency OPD</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reason for Visit</label>
                  <input
                    type="text"
                    placeholder="e.g. Abdominal colic check, stitch removal"
                    value={bookingReason}
                    onChange={(e) => setBookingReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1769D2] outline-none text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 cursor-pointer" onClick={() => setBookingAssignTicketNow(!bookingAssignTicketNow)}>
                <input
                  type="checkbox"
                  id="doctorAssignTicketNow"
                  checked={bookingAssignTicketNow}
                  onChange={(e) => setBookingAssignTicketNow(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="doctorAssignTicketNow" className="cursor-pointer text-xs font-bold text-emerald-900 select-none">
                  Assign ticket of the day (e.g. T-01, T-02) and add to Live Waiting Queue immediately
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickBookModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 font-semibold text-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {isSubmittingBooking ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Ticket className="w-3.5 h-3.5" />
                      <span>{bookingAssignTicketNow ? "Book & Assign Ticket" : "Save Appointment"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DoctorDashboardPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-slate-500 font-medium flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-[#1769D2]" />
        <span>Loading clinical dashboard...</span>
      </div>
    }>
      <DoctorDashboardContent />
    </Suspense>
  );
}
