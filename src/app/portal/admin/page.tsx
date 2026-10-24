"use client";

import { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  Settings as SettingsIcon, 
  History, 
  Users, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Clock, 
  Lock, 
  FileText, 
  UserCheck, 
  CreditCard, 
  Calendar,
  Building2,
  Phone,
  Mail,
  MapPin,
  Search,
  Download,
  FileSpreadsheet,
  Database,
  Activity,
  ArrowUpRight
} from "lucide-react";

interface ClinicSettings {
  id: string;
  clinicName: string;
  doctorName: string;
  specialization: string;
  address: string;
  phone: string;
  email: string;
  opdTimings: string;
  opdDays: string;
  consultationFeeNew: number;
  consultationFeeFollowup: number;
}

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  performedByUserId: string;
  performedByUserRole: string;
  performedByUserName: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"SETTINGS" | "AUDIT" | "ROLES" | "EXPORT">("SETTINGS");
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [auditSearch, setAuditSearch] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsRes, logsRes] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/admin/audit-logs?limit=100")
      ]);

      const [sData, lData] = await Promise.all([
        settingsRes.json(),
        logsRes.json()
      ]);

      if (sData.success) setSettings(sData.settings);
      if (lData.success) setLogs(lData.logs || []);
    } catch {
      setActionMessage({ text: "Failed to load clinic administration data.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSaving(true);
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");

      setActionMessage({ text: "Clinic settings updated and persisted successfully.", type: "success" });
      setSettings(data.settings);
    } catch (err: unknown) {
      const e = err as Error;
      setActionMessage({ text: e.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const exportAuditLogsCsv = () => {
    if (!logs || logs.length === 0) {
      setActionMessage({ text: "No audit logs available to export.", type: "error" });
      return;
    }
    const headers = ["Timestamp", "Action", "Entity Type", "Performed By User", "Role", "Details"];
    const rows = logs.map(l => [
      `"${new Date(l.timestamp).toISOString()}"`,
      `"${l.action}"`,
      `"${l.entityType}"`,
      `"${l.performedByUserName}"`,
      `"${l.performedByUserRole}"`,
      `"${l.details.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `clinic_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActionMessage({ text: "Audit logs exported successfully to CSV.", type: "success" });
  };

  const exportSettingsCsv = () => {
    if (!settings) return;
    const headers = ["Parameter", "Configured Value"];
    const rows = [
      ["Clinic Name", `"${settings.clinicName}"`],
      ["Consulting Doctor", `"${settings.doctorName}"`],
      ["Specialization", `"${settings.specialization}"`],
      ["Helpline Phone", `"${settings.phone}"`],
      ["Email", `"${settings.email}"`],
      ["Address", `"${settings.address}"`],
      ["OPD Days", `"${settings.opdDays}"`],
      ["OPD Timings", `"${settings.opdTimings}"`],
      ["New Consultation Fee", `"${settings.consultationFeeNew}"`],
      ["Followup Consultation Fee", `"${settings.consultationFeeFollowup}"`]
    ];
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `clinic_configuration_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActionMessage({ text: "Clinic settings exported successfully to CSV.", type: "success" });
  };

  const filteredLogs = logs.filter(log => {
    const term = auditSearch.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term) ||
      log.performedByUserName.toLowerCase().includes(term) ||
      log.performedByUserRole.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#12304A]">Clinic Administration & Governance</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-light text-teal-dark border border-teal/20">
              Full System Access
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Operational hours, clinical fee parameters, role-based controls, security audit trail, and data exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData()}
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Refresh administration data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#1769D2]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Operational Highlights Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-slate-400 font-medium">OPD Session</span>
          <span className="font-bold text-[#12304A] mt-1">5:00 PM – 9:00 PM</span>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1">● Active Mon–Sat</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-slate-400 font-medium">Consulting Specialist</span>
          <span className="font-bold text-[#12304A] mt-1">Dr. Abhishek Anand</span>
          <span className="text-[10px] text-teal font-medium mt-1">Paediatric Surgeon</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-slate-400 font-medium">Standard OPD Fee</span>
          <span className="font-bold text-[#12304A] mt-1">₹{settings?.consultationFeeNew ?? 500} / ₹{settings?.consultationFeeFollowup ?? 300}</span>
          <span className="text-[10px] text-slate-500 mt-1">New / Review</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-slate-400 font-medium">Security Audit Trail</span>
          <span className="font-bold text-[#12304A] mt-1">{logs.length} Events</span>
          <span className="text-[10px] text-purple-700 font-semibold mt-1">Immutable Log</span>
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
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("SETTINGS")}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "SETTINGS" 
              ? "bg-white text-[#12304A] shadow-sm font-bold" 
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <SettingsIcon className="w-4 h-4 text-[#1769D2]" />
          OPD Timings & Clinic Profile
        </button>

        <button
          onClick={() => setActiveTab("AUDIT")}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "AUDIT" 
              ? "bg-white text-[#12304A] shadow-sm font-bold" 
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <History className="w-4 h-4 text-[#1769D2]" />
          Clinical Audit Trail ({logs.length})
        </button>

        <button
          onClick={() => setActiveTab("ROLES")}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "ROLES" 
              ? "bg-white text-[#12304A] shadow-sm font-bold" 
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Users className="w-4 h-4 text-[#1769D2]" />
          Staff Role Governance & Accounts
        </button>

        <button
          onClick={() => setActiveTab("EXPORT")}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "EXPORT" 
              ? "bg-white text-[#12304A] shadow-sm font-bold" 
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Download className="w-4 h-4 text-[#1769D2]" />
          Data Exports & System Backup
        </button>
      </div>

      {/* TAB 1: CLINIC PROFILE & OPD SETTINGS */}
      {activeTab === "SETTINGS" && settings && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-[#12304A]">Clinic Operational Configuration</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Updates to these values will reflect automatically across official prescriptions, receipts, and appointment slots.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Clinic Name</label>
              <input
                type="text"
                required
                value={settings.clinicName}
                onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Consulting Specialist Name</label>
              <input
                type="text"
                required
                value={settings.doctorName}
                onChange={(e) => setSettings({ ...settings, doctorName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Specialization & Credentials</label>
              <input
                type="text"
                required
                value={settings.specialization}
                onChange={(e) => setSettings({ ...settings, specialization: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Clinic Contact Helpline</label>
              <input
                type="text"
                required
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Clinic Physical Address</label>
              <input
                type="text"
                required
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">OPD Operational Days</label>
              <input
                type="text"
                required
                value={settings.opdDays}
                onChange={(e) => setSettings({ ...settings, opdDays: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">OPD Timings</label>
              <input
                type="text"
                required
                value={settings.opdTimings}
                onChange={(e) => setSettings({ ...settings, opdTimings: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Default New Consultation Fee (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={settings.consultationFeeNew}
                onChange={(e) => setSettings({ ...settings, consultationFeeNew: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Follow-up Review Fee (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={settings.consultationFeeFollowup}
                onChange={(e) => setSettings({ ...settings, consultationFeeFollowup: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={exportSettingsCsv}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Config (CSV)</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#1769D2] hover:bg-[#1258b5] text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving Changes..." : "Save Clinic Configuration"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === "AUDIT" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit action, user or details..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1769D2] outline-none"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono">
                Showing {filteredLogs.length} entries
              </span>
              <button
                onClick={exportAuditLogsCsv}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">Performed By</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                        No audit records matched your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-slate-500 font-mono whitespace-nowrap text-[11px]">
                          {new Date(log.timestamp).toLocaleString("en-IN", { 
                            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" 
                          })}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                            {log.action}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-700 whitespace-nowrap font-medium">
                          {log.entityType}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap font-sans">
                          <span className="font-semibold text-slate-900 block">{log.performedByUserName}</span>
                          <span className="text-[10px] text-slate-400 font-mono uppercase">{log.performedByUserRole}</span>
                        </td>

                        <td className="py-3 px-4 font-sans text-slate-600 text-xs">
                          {log.details}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STAFF ROLES & PERMISSIONS (ALL 4 ACCOUNTS UNDER 2 STREAMLINED WINGS) */}
      {activeTab === "ROLES" && (
        <div className="space-y-6">
          {/* Top Architectural Notice */}
          <div className="bg-gradient-to-r from-teal-light/50 via-blue-50 to-purple-50 p-4 rounded-2xl border border-teal/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-extrabold text-[#12304A] block text-sm">
                Two-Role Consolidated Access Structure
              </span>
              <p className="text-slate-600 mt-0.5">
                The clinic operations are governed through 2 unified access levels: <strong>Doctor & Admin</strong> (Clinical EMR + Governance) and <strong>Reception & Billing</strong> (Front Desk + Patient Accounts). All 4 staff accounts are fully active below.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. DOCTOR ROLE */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 relative">
              <span className="absolute top-4 right-4 text-[10px] font-bold text-teal-dark bg-teal-light px-2 py-0.5 rounded border border-teal/20">
                Doctor & Admin Wing
              </span>
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1769D2] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#12304A]">Doctor Role</h3>
                  <p className="text-xs text-slate-500">Dr. Abhishek Anand (<span className="font-mono text-teal-dark font-semibold">dr.anand</span>)</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Full Access to Clinical EMR Workspace
                </li>
                <li className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Exclusively Authorised to Sign & Finalise Prescriptions
                </li>
                <li className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Manage OPD Queue & Live Consultations
                </li>
                <li className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Review Paediatric Medical Timelines & Ultrasound Scans
                </li>
              </ul>
            </div>

            {/* 2. CLINIC ADMINISTRATOR */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 relative">
              <span className="absolute top-4 right-4 text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
                Doctor & Admin Wing
              </span>
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#12304A]">Clinic Administrator</h3>
                  <p className="text-xs text-slate-500">Admin Account (<span className="font-mono text-purple-700 font-semibold">admin</span>)</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Configure Clinic OPD Timings & Fee Schedules
                </li>
                <li className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Inspect Chronological Security Audit Trail
                </li>
                <li className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Full Financial Analytics & Collection Reports
                </li>
                <li className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Override and Manage Clinical Appointments
                </li>
              </ul>
            </div>

            {/* 3. RECEPTIONIST DESK */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 relative">
              <span className="absolute top-4 right-4 text-[10px] font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded border border-cyan-200">
                Reception & Billing Wing
              </span>
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#12304A]">Receptionist Desk</h3>
                  <p className="text-xs text-slate-500">Priyanka Nayak (<span className="font-mono text-cyan-800 font-semibold">reception</span>)</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Register New Paediatric Patients with Guardian Details
                </li>
                <li className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Prevent Duplicate Phone & Name Records
                </li>
                <li className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Schedule Appointments & Check in Patients
                </li>
                <li className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Issue Sequential Queue Tokens (T-01, T-02)
                </li>
              </ul>
            </div>

            {/* 4. BILLING DESK */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 relative">
              <span className="absolute top-4 right-4 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                Reception & Billing Wing
              </span>
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#12304A]">Billing Desk</h3>
                  <p className="text-xs text-slate-500">Rajesh Das (<span className="font-mono text-emerald-700 font-semibold">billing</span>)</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Generate Official Invoices with Preset Paediatric Fees
                </li>
                <li className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Record Settlement (Cash, UPI QR, Card)
                </li>
                <li className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Print Tax Invoices and Money Receipts
                </li>
                <li className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Export Collections Data to CSV
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DATA EXPORTS & CLINIC SYSTEM TOOLS */}
      {activeTab === "EXPORT" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-[#12304A]">Data Management & Backup Exports</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Download structured records and clinical reports in CSV format for local record-keeping and external audits.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 font-bold text-[#12304A]">
                    <History className="w-4 h-4 text-purple-600" />
                    <span>Audit Trail Log</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Complete chronological history of staff actions, logins, patient modifications, and appointments.
                  </p>
                </div>
                <button
                  onClick={exportAuditLogsCsv}
                  className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 font-semibold text-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-purple-600" />
                  <span>Download Audit CSV</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 font-bold text-[#12304A]">
                    <SettingsIcon className="w-4 h-4 text-teal" />
                    <span>Clinic Configuration</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Export registered clinic profile, doctor specialization, operational timings, and fee structure.
                  </p>
                </div>
                <button
                  onClick={exportSettingsCsv}
                  className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 font-semibold text-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-teal" />
                  <span>Download Config CSV</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 font-bold text-[#12304A]">
                    <Database className="w-4 h-4 text-blue-600" />
                    <span>Local Database Health</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Status: <span className="text-emerald-700 font-bold">Operational</span> • Storage: Local JSON DB • Encrypted Session Token
                  </p>
                </div>
                <button
                  onClick={() => loadData()}
                  className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 font-semibold text-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sync & Verify DB</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
