"use client";

import { useEffect, useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  UserCheck, 
  PlayCircle, 
  XCircle, 
  RefreshCw, 
  Phone, 
  Ticket, 
  ChevronRight, 
  Stethoscope, 
  ChevronLeft 
} from "lucide-react";

interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  guardianName?: string;
  parentGuardianName?: string;
  phone?: string;
  contactNumber?: string;
}

interface Appointment {
  id: string;
  appointmentNumber: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  slotDurationMinutes: number;
  status: "SCHEDULED" | "CHECKED_IN" | "WAITING" | "IN_CONSULTATION" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  consultationType: string;
  reasonForVisit: string;
  notes?: string;
  patient?: Patient;
}

interface QueueEntry {
  id: string;
  tokenCode: string;
  patientId: string;
  patientName?: string;
  guardianName?: string;
  appointmentId?: string;
  doctorId: string;
  status: "WAITING" | "IN_CONSULTATION" | "COMPLETED" | "CANCELLED";
  checkInTime: string;
  consultationStartTime?: string;
  priorityLevel: "NORMAL" | "HIGH" | "EMERGENCY";
}

const OPD_SLOTS = [
  "05:00 PM", "05:20 PM", "05:40 PM", 
  "06:00 PM", "06:20 PM", "06:40 PM",
  "07:00 PM", "07:20 PM", "07:40 PM",
  "08:00 PM", "08:20 PM", "08:40 PM"
];

function AppointmentsQueueContent() {
  const [activeTab, setActiveTab] = useState<"QUEUE" | "SCHEDULE">("QUEUE");
  const [selectedDate, setSelectedDate] = useState<string>("2026-10-24");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modals state
  const [showBookModal, setShowBookModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState<Appointment | null>(null);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");

  // New Appointment Form State
  const [newApptData, setNewApptData] = useState({
    patientId: "",
    appointmentDate: "2026-10-24",
    appointmentTime: "05:00 PM",
    consultationType: "NEW_CONSULTATION",
    reasonForVisit: "",
    notes: "",
    checkInImmediately: false,
    priority: "NORMAL"
  });

  const [rescheduleData, setRescheduleData] = useState({
    date: "",
    time: "",
    status: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [queueRes, apptsRes, patientsRes] = await Promise.all([
        fetch(`/api/queue?date=${selectedDate}`),
        fetch(`/api/appointments?date=${selectedDate}`),
        fetch("/api/patients")
      ]);

      const [qData, aData, pData] = await Promise.all([
        queueRes.json(),
        apptsRes.json(),
        patientsRes.json()
      ]);

      if (qData.success) {
        const normalizedQueue: QueueEntry[] = (qData.queue || []).map((entry: any) => ({
          id: entry.id,
          tokenCode: entry.tokenCode,
          patientId: entry.patientId,
          patientName: entry.patient?.fullName || entry.patientName || "Unknown Patient",
          guardianName: entry.patient?.parentGuardianName || entry.guardianName || "N/A",
          appointmentId: entry.appointmentId,
          doctorId: entry.doctorId,
          status: (entry.queueStatus || entry.status || "WAITING") as any,
          checkInTime: entry.checkInTime ? new Date(entry.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A",
          consultationStartTime: entry.consultationStartTime,
          priorityLevel: entry.priorityLevel || "NORMAL"
        }));
        setQueue(normalizedQueue);
      }
      if (aData.success) setAppointments(aData.appointments || []);
      if (pData.success) setPatients(pData.patients || []);
    } catch {
      setActionMessage({ text: "Failed to sync appointments and queue.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const handleUpdateQueueStatus = async (queueId: string, status: "WAITING" | "IN_CONSULTATION" | "COMPLETED" | "CANCELLED") => {
    try {
      const res = await fetch("/api/queue", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queueId, status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update queue.");
      setActionMessage({ text: `Queue status updated to ${status}.`, type: "success" });
      loadData();
    } catch (err: unknown) {
      const e = err as Error;
      setActionMessage({ text: e.message, type: "error" });
    }
  };

  const handleCheckInAppointment = async (appt: Appointment) => {
    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: appt.patientId,
          appointmentId: appt.id,
          doctorId: appt.doctorId,
          priority: "NORMAL"
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to check in.");
      setActionMessage({ text: `Token ${data.queueEntry.tokenCode} issued for ${appt.patient?.fullName}!`, type: "success" });
      loadData();
    } catch (err: unknown) {
      const e = err as Error;
      setActionMessage({ text: e.message, type: "error" });
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApptData.patientId) {
      setActionMessage({ text: "Please select a registered patient.", type: "error" });
      return;
    }

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newApptData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scheduling failed.");

      setActionMessage({ 
        text: `Appointment scheduled successfully! ${data.queueToken ? `Token ${data.queueToken.tokenCode} issued.` : ""}`, 
        type: "success" 
      });
      setShowBookModal(false);
      setNewApptData({
        patientId: "",
        appointmentDate: selectedDate,
        appointmentTime: "05:00 PM",
        consultationType: "NEW_CONSULTATION",
        reasonForVisit: "",
        notes: "",
        checkInImmediately: false,
        priority: "NORMAL"
      });
      loadData();
    } catch (err: unknown) {
      const e = err as Error;
      setActionMessage({ text: e.message, type: "error" });
    }
  };

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRescheduleModal) return;

    try {
      const res = await fetch(`/api/appointments/${showRescheduleModal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentDate: rescheduleData.date,
          appointmentTime: rescheduleData.time,
          status: rescheduleData.status
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed.");

      setActionMessage({ text: "Appointment updated successfully.", type: "success" });
      setShowRescheduleModal(null);
      loadData();
    } catch (err: unknown) {
      const e = err as Error;
      setActionMessage({ text: e.message, type: "error" });
    }
  };

  const filteredAppointments = appointments.filter(a => {
    if (statusFilter === "ALL") return true;
    return a.status === statusFilter;
  });

  const waitingCount = queue.filter(q => q.status === "WAITING").length;
  const inConsultCount = queue.filter(q => q.status === "IN_CONSULTATION").length;
  const completedCount = queue.filter(q => q.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#12304A]">Appointments & OPD Queue</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#1769D2] border border-blue-200">
              Dr. Abhishek Anand
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time OPD token distribution, walk-in check-in, and conflict-free paediatric schedule.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            title="Refresh queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#1769D2]" : ""}`} />
          </button>
          <button
            onClick={() => setShowBookModal(true)}
            className="px-4 py-2.5 bg-[#1769D2] hover:bg-[#1258b5] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Book / Walk-In Token
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium ${
          actionMessage.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
            : "bg-red-50 text-red-800 border-red-200"
        }`}>
          <div className="flex items-center gap-2">
            {actionMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600">
            &times;
          </button>
        </div>
      )}

      {/* Date Bar & View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Tab Switcher */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("QUEUE")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === "QUEUE" 
                ? "bg-white text-[#12304A] shadow-sm font-bold" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Ticket className="w-4 h-4 text-[#1769D2]" />
            Live Clinic Queue ({queue.length})
          </button>
          <button
            onClick={() => setActiveTab("SCHEDULE")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === "SCHEDULE" 
                ? "bg-white text-[#12304A] shadow-sm font-bold" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarIcon className="w-4 h-4 text-[#1769D2]" />
            Schedule List ({appointments.length})
          </button>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1769D2]"
          />
          <button
            onClick={() => setSelectedDate("2026-10-24")}
            className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* VIEW 1: LIVE OPD QUEUE */}
      {activeTab === "QUEUE" && (
        <div className="space-y-6">
          {/* Quick Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Waiting in Clinic</p>
                <p className="text-2xl font-black text-amber-900 mt-1">{waitingCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#1769D2] uppercase tracking-wide">Inside Doctor Cabin</p>
                <p className="text-2xl font-black text-[#12304A] mt-1">{inConsultCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1769D2] flex items-center justify-center font-bold">
                <Stethoscope className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Consultations Done</p>
                <p className="text-2xl font-black text-emerald-900 mt-1">{completedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Queue Token Stream */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#12304A]">Live Token Board • {selectedDate}</h2>
              <span className="text-xs text-slate-500 font-medium">Auto-synced with doctor cabin</span>
            </div>

            {queue.length === 0 ? (
              <div className="p-12 text-center">
                <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700">No active queue tokens for {selectedDate}</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Check in a patient or issue a walk-in token to start the OPD queue.
                </p>
                <button
                  onClick={() => setShowBookModal(true)}
                  className="px-4 py-2 bg-[#1769D2] text-white text-xs font-semibold rounded-xl hover:bg-[#1258b5] transition-colors"
                >
                  Generate Walk-in Token
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {queue.map((entry) => (
                  <div key={entry.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Token badge */}
                      <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-sm shrink-0 ${
                        entry.status === "IN_CONSULTATION" 
                          ? "bg-[#1769D2] text-white" 
                          : entry.status === "WAITING"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : entry.status === "COMPLETED"
                          ? "bg-slate-100 text-slate-500"
                          : "bg-red-50 text-red-500"
                      }`}>
                        <span className="text-[10px] uppercase font-bold tracking-wider leading-none">Token</span>
                        <span className="text-lg leading-tight">{entry.tokenCode}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{entry.patientName || entry.patientId}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            entry.status === "IN_CONSULTATION"
                              ? "bg-blue-100 text-[#1769D2]"
                              : entry.status === "WAITING"
                              ? "bg-amber-100 text-amber-800"
                              : entry.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {(entry.status || "WAITING").replace("_", " ")}
                          </span>
                          {entry.priorityLevel === "EMERGENCY" && (
                            <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse">
                              EMERGENCY
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Guardian: <span className="text-slate-700 font-medium">{entry.guardianName || "N/A"}</span> • 
                          Checked in at: <span className="font-mono text-slate-700">{entry.checkInTime}</span>
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {entry.status === "WAITING" && (
                        <>
                          <button
                            onClick={() => handleUpdateQueueStatus(entry.id, "IN_CONSULTATION")}
                            className="px-3 py-1.5 bg-[#1769D2] hover:bg-[#1258b5] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            Call into Cabin
                          </button>
                          <button
                            onClick={() => handleUpdateQueueStatus(entry.id, "CANCELLED")}
                            className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            No-Show / Cancel
                          </button>
                        </>
                      )}

                      {entry.status === "IN_CONSULTATION" && (
                        <>
                          <Link
                            href={`/portal/consultations/new?patientId=${entry.patientId}`}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            EMR / Prescribe
                          </Link>
                          <button
                            onClick={() => handleUpdateQueueStatus(entry.id, "COMPLETED")}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Mark Finished
                          </button>
                        </>
                      )}

                      {entry.status === "COMPLETED" && (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Consultation Completed
                        </span>
                      )}

                      <Link
                        href={`/portal/patients/${entry.patientId}`}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                        title="View Patient Profile"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: APPOINTMENT SCHEDULE LIST */}
      {activeTab === "SCHEDULE" && (
        <div className="space-y-4">
          {/* Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-semibold text-xs flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {["ALL", "SCHEDULED", "WAITING", "IN_CONSULTATION", "COMPLETED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  statusFilter === st 
                    ? "bg-[#12304A] text-white" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {(st || "").replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Patient & Guardian</th>
                  <th className="py-3 px-4">Consultation Type</th>
                  <th className="py-3 px-4">Reason For Visit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No appointments found matching the current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#1769D2]" />
                          {a.appointmentTime}
                        </div>
                        <span className="text-[10px] font-normal text-slate-400">{a.slotDurationMinutes} min</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <Link
                          href={`/portal/patients/${a.patientId}`}
                          className="font-bold text-[#1769D2] hover:underline block"
                        >
                          {a.patient?.fullName || a.patientId}
                        </Link>
                        <span className="text-[11px] text-slate-500">
                          {a.patient?.parentGuardianName ? `Guardian: ${a.patient.parentGuardianName}` : (a.patient as any)?.guardianName ? `Guardian: ${(a.patient as any).guardianName}` : "Paediatric Patient"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {(a.consultationType || "GENERAL").replace("_", " ")}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {a.reasonForVisit}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          a.status === "SCHEDULED" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                          a.status === "WAITING" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          a.status === "IN_CONSULTATION" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                          a.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          "bg-slate-100 text-slate-500"
                        }`}>
                          {(a.status || "SCHEDULED").replace("_", " ")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                        {a.status === "SCHEDULED" && (
                          <button
                            onClick={() => handleCheckInAppointment(a)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                            title="Check-in and issue queue token"
                          >
                            <Ticket className="w-3.5 h-3.5" /> Check In
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setShowRescheduleModal(a);
                            setRescheduleData({
                              date: a.appointmentDate,
                              time: a.appointmentTime,
                              status: a.status
                            });
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Modify
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: BOOK / WALK-IN APPOINTMENT */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#12304A]">Schedule Appointment / Walk-in</h3>
                <p className="text-xs text-slate-500">Dr. Abhishek Anand • OPD Evening Clinics</p>
              </div>
              <button onClick={() => setShowBookModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
              {/* Patient Selection with Live Search */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Patient *</label>
                <input
                  type="text"
                  placeholder="Type child's or guardian's name to filter..."
                  value={patientSearchTerm}
                  onChange={(e) => setPatientSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl mb-2 text-xs focus:ring-2 focus:ring-[#1769D2] outline-none"
                />
                <select
                  required
                  value={newApptData.patientId}
                  onChange={(e) => setNewApptData({ ...newApptData, patientId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#1769D2] outline-none bg-slate-50"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients
                    .filter(p => 
                      p.fullName.toLowerCase().includes(patientSearchTerm.toLowerCase()) || 
                      (p.parentGuardianName || p.guardianName || "").toLowerCase().includes(patientSearchTerm.toLowerCase())
                    )
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.id}) — Guardian: {p.parentGuardianName || p.guardianName || "N/A"}
                      </option>
                    ))}
                </select>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Not registered yet?</span>
                  <Link href="/portal/patients" className="text-[#1769D2] font-semibold hover:underline">
                    + Register New Child Patient
                  </Link>
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Consultation Date *</label>
                  <input
                    type="date"
                    required
                    value={newApptData.appointmentDate}
                    onChange={(e) => setNewApptData({ ...newApptData, appointmentDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1769D2] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time Slot (OPD Hours) *</label>
                  <select
                    required
                    value={newApptData.appointmentTime}
                    onChange={(e) => setNewApptData({ ...newApptData, appointmentTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1769D2] outline-none font-mono"
                  >
                    {OPD_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Consultation Type */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Consultation Type</label>
                <select
                  value={newApptData.consultationType}
                  onChange={(e) => setNewApptData({ ...newApptData, consultationType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1769D2] outline-none"
                >
                  <option value="NEW_CONSULTATION">New Paediatric Consultation (₹500)</option>
                  <option value="FOLLOW_UP">Follow-up Review (₹300)</option>
                  <option value="POST_OPERATIVE">Post-operative Checkup</option>
                  <option value="SECOND_OPINION">Second Opinion / Surgical Evaluation</option>
                  <option value="EMERGENCY">Emergency Surgical Triage</option>
                </select>
              </div>

              {/* Reason for Visit */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chief Reason for Visit *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inguinal swelling, recurring abdominal colic, circumcision consult"
                  value={newApptData.reasonForVisit}
                  onChange={(e) => setNewApptData({ ...newApptData, reasonForVisit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1769D2] outline-none"
                />
              </div>

              {/* Immediate Check-In Toggle */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newApptData.checkInImmediately}
                    onChange={(e) => setNewApptData({ ...newApptData, checkInImmediately: e.target.checked })}
                    className="rounded border-slate-300 text-[#1769D2] focus:ring-[#1769D2]"
                  />
                  <span className="font-bold text-[#12304A]">
                    Patient is present in clinic — Issue Queue Token immediately
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 mt-1 pl-5">
                  Generates sequential OPD token (e.g. T-03) and places patient directly in the waiting queue.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1769D2] text-white rounded-xl font-bold hover:bg-[#1258b5] shadow-sm"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RESCHEDULE / MODIFY APPOINTMENT */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-[#12304A]">
                Modify Appointment {showRescheduleModal.appointmentNumber}
              </h3>
              <button onClick={() => setShowRescheduleModal(null)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateAppointment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">New Date</label>
                <input
                  type="date"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Time Slot</label>
                <select
                  value={rescheduleData.time}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                >
                  {OPD_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={rescheduleData.status}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="WAITING">Checked In / Waiting</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="NO_SHOW">No Show</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1769D2] text-white rounded-xl font-bold hover:bg-[#1258b5]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppointmentsQueuePage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-slate-500 font-medium flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-[#1769D2]" />
        <span>Loading clinic appointments and live queue...</span>
      </div>
    }>
      <AppointmentsQueueContent />
    </Suspense>
  );
}

