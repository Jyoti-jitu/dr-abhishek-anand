"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  CreditCard, 
  Receipt, 
  Plus, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  IndianRupee, 
  Printer, 
  TrendingUp, 
  Clock, 
  FileText, 
  User, 
  QrCode, 
  Building2, 
  Check, 
  X,
  RefreshCw,
  Trash2
} from "lucide-react";

interface Patient {
  id: string;
  fullName: string;
  guardianName?: string;
  parentGuardianName?: string;
  phone?: string;
  contactNumber?: string;
}

interface InvoiceItem {
  id: string;
  serviceName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  appointmentId?: string;
  consultationId?: string;
  invoiceDate: string;
  items: InvoiceItem[];
  subtotalAmount: number;
  taxPercent: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: "PAID" | "PARTIALLY_PAID" | "UNPAID";
  paymentMethod?: "CASH" | "UPI" | "CARD" | "NET_BANKING";
  transactionReference?: string;
  billingStaffName: string;
  notes?: string;
  patient?: Patient;
}

interface FinancialReport {
  dailyCollections: number;
  monthlyCollections: number;
  totalReceivables: number;
  invoicesCount: number;
  paidInvoicesCount: number;
  unpaidInvoicesCount: number;
}

const PRESET_SERVICES = [
  { name: "New Paediatric Surgical Consultation", price: 500 },
  { name: "Follow-up Clinical Review", price: 300 },
  { name: "Minor Dressing / Suture Removal", price: 250 },
  { name: "Pre-operative Surgical Assessment", price: 600 },
  { name: "Circumcision Consultation & Care", price: 800 },
  { name: "Tongue-Tie (Ankyloglossia) Assessment", price: 500 },
  { name: "Emergency Surgical Triage", price: 750 }
];

function BillingContent() {
  const searchParams = useSearchParams();
  const urlPatientId = searchParams.get("patientId");

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<Invoice | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<Invoice | null>(null);

  // New Invoice State
  const [newInvData, setNewInvData] = useState({
    patientId: "",
    taxPercent: 0,
    discountAmount: 0,
    paidAmount: 500,
    paymentMethod: "UPI",
    transactionReference: "",
    notes: ""
  });

  const [invItems, setInvItems] = useState<Array<{ serviceName: string; unitPrice: number; quantity: number }>>([
    { serviceName: "New Paediatric Surgical Consultation", unitPrice: 500, quantity: 1 }
  ]);

  // Payment Recording State
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<"CASH" | "UPI" | "CARD">("UPI");
  const [payRef, setPayRef] = useState<string>("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, repRes, patRes] = await Promise.all([
        fetch("/api/billing/invoices"),
        fetch("/api/billing/reports"),
        fetch("/api/patients")
      ]);

      const [iData, rData, pData] = await Promise.all([
        invRes.json(),
        repRes.json(),
        patRes.json()
      ]);

      if (iData.success) setInvoices(iData.invoices || []);
      if (rData.success) setReport(rData.report || null);
      if (pData.success) setPatients(pData.patients || []);
    } catch {
      setActionMessage({ text: "Failed to load billing records.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (urlPatientId) {
      setNewInvData((prev) => ({ ...prev, patientId: urlPatientId }));
      setShowCreateModal(true);
    }
  }, [urlPatientId]);

  const handleAddItem = (preset?: { name: string; price: number }) => {
    if (preset) {
      setInvItems([...invItems, { serviceName: preset.name, unitPrice: preset.price, quantity: 1 }]);
    } else {
      setInvItems([...invItems, { serviceName: "", unitPrice: 0, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (invItems.length === 1) return;
    setInvItems(invItems.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return invItems.reduce((acc, curr) => acc + (curr.unitPrice * (curr.quantity || 1)), 0);
  };

  const calculateNetTotal = () => {
    const sub = calculateSubtotal();
    const tax = (sub * (newInvData.taxPercent || 0)) / 100;
    return Math.max(0, sub + tax - (newInvData.discountAmount || 0));
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    if (!newInvData.patientId) {
      setModalError("Please select a registered patient from the list.");
      return;
    }

    const validItems = invItems.filter((i) => i.serviceName.trim() !== "");
    if (validItems.length === 0) {
      setModalError("Please specify at least one clinical service item.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/billing/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: newInvData.patientId,
          items: validItems,
          taxPercent: newInvData.taxPercent,
          discountAmount: newInvData.discountAmount,
          paidAmount: newInvData.paidAmount,
          paymentMethod: newInvData.paymentMethod,
          transactionReference: newInvData.transactionReference,
          notes: newInvData.notes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create invoice.");

      setActionMessage({ text: `Invoice ${data.invoice.invoiceNumber} created successfully!`, type: "success" });
      setShowCreateModal(false);
      setModalError("");
      setShowReceiptModal(data.invoice);
      loadData();
    } catch (err: unknown) {
      const e = err as Error;
      setModalError(e.message);
      setActionMessage({ text: e.message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPaymentModal) return;

    try {
      const res = await fetch(`/api/billing/invoices/${showPaymentModal.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payAmount,
          method: payMethod,
          reference: payRef
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment recording failed.");

      setActionMessage({ text: data.message, type: "success" });
      setShowPaymentModal(null);
      loadData();
    } catch (err: unknown) {
      const e = err as Error;
      setActionMessage({ text: e.message, type: "error" });
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = statusFilter === "ALL" || inv.paymentStatus === statusFilter;
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.patient?.fullName && inv.patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#12304A]">Billing, Receipts & Financials</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              New Life Clinic OPD
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authorised paediatric consultation invoicing, digital payment receipts, and collection audits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/billing/reports?format=csv"
            download
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </a>
          <button
            onClick={() => {
              setInvItems([{ serviceName: "New Paediatric Surgical Consultation", unitPrice: 500, quantity: 1 }]);
              setNewInvData({
                patientId: "",
                taxPercent: 0,
                discountAmount: 0,
                paidAmount: 500,
                paymentMethod: "UPI",
                transactionReference: "",
                notes: ""
              });
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 bg-[#1769D2] hover:bg-[#1258b5] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Today&apos;s Collection</p>
            <p className="text-2xl font-black text-[#12304A] mt-1">₹{report?.dailyCollections || 0}</p>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> Real-time settled
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Monthly Collection</p>
            <p className="text-2xl font-black text-[#1769D2] mt-1">₹{report?.monthlyCollections || 0}</p>
            <span className="text-[11px] text-slate-400 font-medium">October 2026</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1769D2] flex items-center justify-center font-bold">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Balance Receivables</p>
            <p className="text-2xl font-black text-amber-600 mt-1">₹{report?.totalReceivables || 0}</p>
            <span className="text-[11px] text-amber-700 font-medium">
              {report?.unpaidInvoicesCount || 0} pending payment
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Invoices Issued</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{report?.invoicesCount || 0}</p>
            <span className="text-[11px] text-emerald-600 font-medium">
              {report?.paidInvoicesCount || 0} fully cleared
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice # or child's name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1769D2] outline-none"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {["ALL", "PAID", "PARTIALLY_PAID", "UNPAID"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === st 
                  ? "bg-[#12304A] text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {(st || "").replace("_", " ")}
            </button>
          ))}
          <button
            onClick={() => loadData()}
            className="p-1.5 text-slate-400 hover:text-slate-700 ml-1"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#1769D2]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <th className="py-3 px-4">Invoice # & Date</th>
              <th className="py-3 px-4">Patient & Guardian</th>
              <th className="py-3 px-4">Services Billed</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Paid / Balance</th>
              <th className="py-3 px-4">Status & Method</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No invoices found matching criteria.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-mono">
                    <span className="font-bold text-slate-900 block">{inv.invoiceNumber}</span>
                    <span className="text-[11px] text-slate-400">{inv.invoiceDate}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <Link
                      href={`/portal/patients/${inv.patientId}`}
                      className="font-bold text-[#1769D2] hover:underline block"
                    >
                      {inv.patient?.fullName || inv.patientId}
                    </Link>
                    <span className="text-[11px] text-slate-500">
                      {inv.patient?.parentGuardianName ? `Guardian: ${inv.patient.parentGuardianName}` : (inv.patient as any)?.guardianName ? `Guardian: ${(inv.patient as any).guardianName}` : "Patient"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700">
                    <div className="max-w-xs truncate font-medium">
                      {inv.items.map(i => `${i.serviceName} (${i.quantity}x)`).join(", ")}
                    </div>
                    {inv.discountAmount > 0 && (
                      <span className="text-[10px] text-emerald-600">Discount: ₹{inv.discountAmount} applied</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                    ₹{inv.totalAmount}
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <span className="text-emerald-700 font-semibold block">Paid: ₹{inv.paidAmount}</span>
                    {inv.balanceAmount > 0 ? (
                      <span className="text-amber-600 font-semibold">Bal: ₹{inv.balanceAmount}</span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Cleared</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      inv.paymentStatus === "PAID" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                        : inv.paymentStatus === "PARTIALLY_PAID"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {(inv.paymentStatus || "PENDING").replace("_", " ")}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                      {inv.paymentMethod || "Pending"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                    {inv.balanceAmount > 0 && (
                      <button
                        onClick={() => {
                          setShowPaymentModal(inv);
                          setPayAmount(inv.balanceAmount);
                          setPayMethod("UPI");
                          setPayRef("");
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Pay
                      </button>
                    )}
                    <button
                      onClick={() => setShowReceiptModal(inv)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                      title="Print Official Receipt"
                    >
                      <Receipt className="w-3.5 h-3.5 text-slate-500" /> Receipt
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: CREATE INVOICE */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#12304A]">Generate Clinical Invoice</h3>
                <p className="text-xs text-slate-500">New Life Clinic, Soubhagya Nagar, Bhubaneswar</p>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setModalError("");
                }} 
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              {/* Inline Modal Error Banner */}
              {modalError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="font-medium">{modalError}</span>
                </div>
              )}

              {/* Patient Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Patient *</label>
                <select
                  required
                  value={newInvData.patientId}
                  onChange={(e) => {
                    setNewInvData({ ...newInvData, patientId: e.target.value });
                    if (modalError) setModalError("");
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#1769D2] outline-none"
                >
                  <option value="">-- Choose Registered Patient ({patients.length} available) --</option>
                  {patients.map((p) => {
                    const guardian = p.parentGuardianName || p.guardianName || "N/A";
                    return (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.id}) — Guardian: {guardian}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Service Presets Quick Add */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Quick Add Presets:</label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_SERVICES.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleAddItem(preset)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition-colors"
                    >
                      + {preset.name} (₹{preset.price})
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="py-2 px-3">Service Description</th>
                      <th className="py-2 px-3 w-28">Price (₹)</th>
                      <th className="py-2 px-3 w-20">Qty</th>
                      <th className="py-2 px-3 w-24 text-right">Total</th>
                      <th className="py-2 px-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            required
                            placeholder="Clinical service name"
                            value={item.serviceName}
                            onChange={(e) => {
                              const copy = [...invItems];
                              copy[idx].serviceName = e.target.value;
                              setInvItems(copy);
                            }}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            required
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const copy = [...invItems];
                              copy[idx].unitPrice = parseFloat(e.target.value) || 0;
                              setInvItems(copy);
                            }}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-mono"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            required
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const copy = [...invItems];
                              copy[idx].quantity = parseInt(e.target.value) || 1;
                              setInvItems(copy);
                            }}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-mono"
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                          ₹{item.unitPrice * (item.quantity || 1)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {invItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold">₹{calculateSubtotal()}</span>
                </div>
                
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-600">Authorised Discount (₹):</span>
                  <input
                    type="number"
                    min="0"
                    value={newInvData.discountAmount}
                    onChange={(e) => setNewInvData({ ...newInvData, discountAmount: parseFloat(e.target.value) || 0 })}
                    className="w-28 px-2 py-1 border border-slate-200 rounded text-right font-mono text-xs"
                  />
                </div>

                <div className="flex items-center justify-between text-sm font-bold text-[#12304A] border-t border-slate-200 pt-2">
                  <span>Net Payable Amount:</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base text-[#1769D2]">₹{calculateNetTotal()}</span>
                    <button
                      type="button"
                      onClick={() => setNewInvData({ ...newInvData, paidAmount: calculateNetTotal() })}
                      className="text-[11px] font-bold text-[#1769D2] hover:underline bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors border border-blue-200"
                    >
                      Set Full Payment
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount Paid Now (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newInvData.paidAmount}
                    onChange={(e) => setNewInvData({ ...newInvData, paidAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={newInvData.paymentMethod}
                    onChange={(e) => setNewInvData({ ...newInvData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Credit / Debit Card</option>
                    <option value="NET_BANKING">Net Banking</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Txn / UTR Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. UPI-984210"
                    value={newInvData.transactionReference}
                    onChange={(e) => setNewInvData({ ...newInvData, transactionReference: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setModalError("");
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#1769D2] text-white rounded-xl font-bold hover:bg-[#1258b5] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Issuing Invoice & Receipt...</span>
                    </>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4" />
                      <span>Issue Invoice & Receipt</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD PAYMENT TOWARDS BALANCE */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#12304A]">Record Payment</h3>
                <p className="text-xs text-slate-500 font-mono">Invoice {showPaymentModal.invoiceNumber}</p>
              </div>
              <button onClick={() => setShowPaymentModal(null)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex justify-between items-center">
                <span className="text-amber-800 font-medium">Outstanding Balance:</span>
                <span className="text-base font-black text-amber-900 font-mono">
                  ₹{showPaymentModal.balanceAmount}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Paying Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={showPaymentModal.balanceAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as "CASH" | "UPI" | "CARD")}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Credit / Debit Card</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Transaction Ref / Note</label>
                <input
                  type="text"
                  placeholder="e.g. GooglePay Ref: 981240"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-sm"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: OFFICIAL PRINTABLE RECEIPT */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Action Bar */}
            <div className="print:hidden flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <span className="text-xs font-bold uppercase text-[#1769D2] tracking-wider">Official Clinic Receipt</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-[#1769D2] hover:bg-[#1258b5] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button
                  onClick={() => setShowReceiptModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper */}
            <div className="space-y-6 text-xs text-slate-700">
              {/* Clinic Header */}
              <div className="text-center border-b border-slate-200 pb-4">
                <h2 className="text-lg font-black text-[#12304A]">NEW LIFE CLINIC</h2>
                <p className="text-xs font-semibold text-slate-700">Paediatric Surgery & Child Wellness</p>
                <p className="text-[11px] text-slate-500">Soubhagya Nagar, Bhubaneswar, Odisha • Helpline: +91 91246 16273</p>
                <div className="mt-2 inline-block px-3 py-0.5 rounded bg-blue-50 text-[#1769D2] font-mono text-[10px] font-bold">
                  TAX INVOICE & MONEY RECEIPT
                </div>
              </div>

              {/* Receipt Info */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-400 block font-medium">Receipt / Invoice #</span>
                  <span className="font-bold text-slate-900 font-mono">{showReceiptModal.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Date</span>
                  <span className="font-semibold text-slate-800">{showReceiptModal.invoiceDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Patient Name</span>
                  <span className="font-bold text-slate-900">{showReceiptModal.patient?.fullName || showReceiptModal.patientId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Payment Status</span>
                  <span className="font-bold text-emerald-700 uppercase">{(showReceiptModal.paymentStatus || "PAID").replace("_", " ")}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Service</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {showReceiptModal.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-medium text-slate-800">{item.serviceName}</td>
                        <td className="py-2 px-3 text-center text-slate-500">{item.quantity}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-slate-800">₹{item.totalPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="space-y-1.5 text-right font-mono border-t border-slate-200 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>₹{showReceiptModal.subtotalAmount}</span>
                </div>
                {showReceiptModal.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>-₹{showReceiptModal.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-[#12304A] border-t border-slate-200 pt-1">
                  <span>Total Bill Amount:</span>
                  <span>₹{showReceiptModal.totalAmount}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>Amount Paid:</span>
                  <span>₹{showReceiptModal.paidAmount}</span>
                </div>
                {showReceiptModal.balanceAmount > 0 && (
                  <div className="flex justify-between text-amber-700 font-bold">
                    <span>Balance Due:</span>
                    <span>₹{showReceiptModal.balanceAmount}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-400">
                <div>
                  <p>Billed by: {showReceiptModal.billingStaffName || "Clinic Desk"}</p>
                  <p>Payment Mode: {showReceiptModal.paymentMethod || "Cash/UPI"}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-700">For New Life Clinic</p>
                  <p className="mt-4 text-slate-400">Authorised Signatory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Loading clinical billing system...</div>}>
      <BillingContent />
    </Suspense>
  );
}
