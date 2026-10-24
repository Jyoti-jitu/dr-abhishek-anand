"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Baby, 
  Calendar, 
  Phone, 
  MapPin, 
  ShieldAlert, 
  Plus, 
  FileText, 
  Pill, 
  CreditCard, 
  Paperclip, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  Edit3, 
  Printer, 
  Building2, 
  ExternalLink,
  X,
  Stethoscope,
  Activity
} from "lucide-react";
import { Patient, Consultation, Prescription, PatientDocument, Appointment, Invoice } from "@/lib/db/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default function PatientProfilePage({ params }: Props) {
  const router = useRouter();
  const { id } = use(params);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<{
    consultations: Consultation[];
    prescriptions: Prescription[];
    documents: PatientDocument[];
    appointments: Appointment[];
    invoices: Invoice[];
  }>({
    consultations: [],
    prescriptions: [],
    documents: [],
    appointments: [],
    invoices: []
  });
  const [activeTab, setActiveTab] = useState<"consultations" | "prescriptions" | "documents" | "appointments" | "billing">("consultations");
  const [isLoading, setIsLoading] = useState(true);

  // Upload document modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState<PatientDocument["documentType"]>("ULTRASOUND");
  const [docFileName, setDocFileName] = useState("");
  const [docNotes, setDocNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Edit demographics modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    parentGuardianName: "",
    guardianRelationship: "Father",
    contactNumber: "",
    address: "",
    allergies: "",
    chronicConditions: ""
  });

  const fetchPatientData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/patients/${id}`);
      const data = await res.json();
      if (data.patient) {
        setPatient(data.patient);
        setEditData({
          parentGuardianName: data.patient.parentGuardianName || "",
          guardianRelationship: data.patient.guardianRelationship || "Father",
          contactNumber: data.patient.contactNumber || "",
          address: data.patient.address || "",
          allergies: data.patient.allergies || "",
          chronicConditions: data.patient.chronicConditions || ""
        });
      }
      if (data.records) {
        setRecords(data.records);
      }
    } catch (err) {
      console.error("Error fetching patient details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle || !docFileName) return;
    setIsUploading(true);

    try {
      await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient?.id,
          documentTitle: docTitle,
          documentType: docType,
          fileName: docFileName,
          notes: docNotes
        })
      });
      setIsUploadModalOpen(false);
      setDocTitle("");
      setDocFileName("");
      setDocNotes("");
      fetchPatientData();
    } catch (err) {
      console.error("Document upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDemographics = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`/api/patients/${patient?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData)
      });
      setIsEditModalOpen(false);
      fetchPatientData();
    } catch (err) {
      console.error("Save demographics error:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-xs text-charcoal-muted">
        Loading patient medical file...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-base font-bold text-navy">Patient Not Found</p>
        <Link href="/portal/patients" className="text-xs text-medical hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Patient Directory</span>
        </Link>
      </div>
    );
  }

  const calculateAge = (dobString: string) => {
    const dob = new Date(dobString);
    const today = new Date();
    const diffMonths = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
    if (diffMonths < 1) return "< 1 month";
    if (diffMonths < 12) return `${diffMonths} months`;
    const years = Math.floor(diffMonths / 12);
    const remMonths = diffMonths % 12;
    return remMonths > 0 ? `${years}y ${remMonths}m` : `${years} years`;
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/portal/patients"
          className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal-muted hover:text-navy transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Patient Directory</span>
        </Link>
      </div>

      {/* Patient Header Card */}
      <div className="p-6 rounded-2xl bg-white border border-border-subtle shadow-editorial space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-light text-teal-dark flex items-center justify-center shrink-0 border border-teal/20">
              <Baby className="w-7 h-7 text-teal" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-navy">
                  {patient.fullName}
                </h1>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-navy text-white">
                  {patient.patientId}
                </span>
                {patient.bloodGroup && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                    Blood Group: {patient.bloodGroup}
                  </span>
                )}
              </div>
              <p className="text-xs text-charcoal-muted">
                DOB: <strong>{patient.dateOfBirth}</strong> ({calculateAge(patient.dateOfBirth)}) • Gender: {patient.gender} • Registered: {patient.createdAt.split("T")[0]}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/portal/consultations/new?patientId=${patient.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy hover:bg-navy-light text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Start Consultation</span>
            </Link>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border-subtle bg-white hover:bg-slate-50 text-xs font-semibold text-charcoal transition-colors"
            >
              <Paperclip className="w-3.5 h-3.5 text-teal" />
              <span>Attach Report</span>
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border-subtle bg-white hover:bg-slate-50 text-xs font-semibold text-charcoal transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>

        {/* Demographics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
          <div className="p-3 rounded-xl bg-light-bg space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted block">
              Parent / Guardian
            </span>
            <p className="font-bold text-navy">{patient.parentGuardianName} ({patient.guardianRelationship})</p>
            <p className="text-charcoal-muted">
              Phone: <a href={`tel:${patient.contactNumber.replace(/\D/g, "")}`} className="text-medical font-medium underline">{patient.contactNumber}</a>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-light-bg space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted block">
              Address & Residence
            </span>
            <p className="text-charcoal">{patient.address || "Soubhagya Nagar, Bhubaneswar"}</p>
            <p className="text-charcoal-muted">Clinic: New Life Clinic (Soubhagya Nagar)</p>
          </div>

          <div className="p-3 rounded-xl bg-light-bg space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted block">
              Allergies & Medical Alerts
            </span>
            {patient.allergies && patient.allergies !== "None" && patient.allergies !== "None reported" ? (
              <span className="inline-block text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                ⚠️ {patient.allergies}
              </span>
            ) : (
              <span className="text-emerald-700 font-medium">No Known Drug Allergies (NKDA)</span>
            )}
            {patient.chronicConditions && (
              <p className="text-[11px] text-charcoal-muted mt-0.5">Condition: {patient.chronicConditions}</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border-subtle bg-white px-6 rounded-t-2xl text-xs font-semibold">
        <button
          onClick={() => setActiveTab("consultations")}
          className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === "consultations"
              ? "border-navy text-navy font-bold"
              : "border-transparent text-charcoal-muted hover:text-navy"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Consultations & EMR ({records.consultations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("prescriptions")}
          className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === "prescriptions"
              ? "border-navy text-navy font-bold"
              : "border-transparent text-charcoal-muted hover:text-navy"
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Prescriptions ({records.prescriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("documents")}
          className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === "documents"
              ? "border-navy text-navy font-bold"
              : "border-transparent text-charcoal-muted hover:text-navy"
          }`}
        >
          <Paperclip className="w-4 h-4" />
          <span>Documents & Scans ({records.documents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("appointments")}
          className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === "appointments"
              ? "border-navy text-navy font-bold"
              : "border-transparent text-charcoal-muted hover:text-navy"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Appointments ({records.appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("billing")}
          className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === "billing"
              ? "border-navy text-navy font-bold"
              : "border-transparent text-charcoal-muted hover:text-navy"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Billing History ({records.invoices.length})</span>
        </button>
      </div>

      {/* Tab 1: Consultations Timeline */}
      {activeTab === "consultations" && (
        <div className="p-6 rounded-b-2xl bg-white border border-border-subtle shadow-editorial space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-base font-bold text-navy">
                Clinical Consultation History
              </h3>
              <p className="text-xs text-charcoal-muted">
                Chronological surgical notes and assessments recorded for {patient.fullName}.
              </p>
            </div>
            <Link
              href={`/portal/consultations/new?patientId=${patient.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy hover:bg-navy-light text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record New Visit</span>
            </Link>
          </div>

          {records.consultations.length === 0 ? (
            <div className="p-8 text-center text-xs text-charcoal-muted space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-navy">No Clinical Consultations Yet</p>
              <p>Click &apos;Record New Visit&apos; to write the first EMR entry.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {records.consultations.map((c) => (
                <div
                  key={c.id}
                  className="p-6 rounded-xl border border-border-subtle bg-warm-white space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border-subtle">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-navy text-xs">
                        {c.consultationNumber}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-charcoal-muted">
                        Consultation Date: <strong>{c.consultationDate}</strong>
                      </span>
                    </div>
                    <div>
                      {c.isSigned ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Signed & Audited
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Draft Entry
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Vitals */}
                  {(c.vitalsWeightKg || c.vitalsTempF || c.vitalsHeightCm) && (
                    <div className="p-3 rounded-lg bg-light-bg border border-border-subtle flex flex-wrap gap-4 text-xs">
                      {c.vitalsWeightKg && (
                        <div>
                          <span className="text-charcoal-muted">Weight:</span>{" "}
                          <strong className="text-navy">{c.vitalsWeightKg} kg</strong>
                        </div>
                      )}
                      {c.vitalsHeightCm && (
                        <div>
                          <span className="text-charcoal-muted">Height:</span>{" "}
                          <strong className="text-navy">{c.vitalsHeightCm} cm</strong>
                        </div>
                      )}
                      {c.vitalsTempF && (
                        <div>
                          <span className="text-charcoal-muted">Temp:</span>{" "}
                          <strong className="text-navy">{c.vitalsTempF} °F</strong>
                        </div>
                      )}
                      {c.vitalsHeartRateBpm && (
                        <div>
                          <span className="text-charcoal-muted">Heart Rate:</span>{" "}
                          <strong className="text-navy">{c.vitalsHeartRateBpm} bpm</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Clinical Findings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-navy block mb-0.5">Presenting Complaints:</span>
                      <p className="text-charcoal leading-relaxed">{c.presentingComplaints}</p>
                    </div>
                    <div>
                      <span className="font-bold text-navy block mb-0.5">Primary Diagnosis:</span>
                      <p className="text-teal-dark font-bold text-sm">{c.primaryDiagnosis}</p>
                    </div>
                  </div>

                  <div className="text-xs space-y-2">
                    <span className="font-bold text-navy block">Examination Findings:</span>
                    <p className="text-charcoal leading-relaxed p-3 bg-white rounded-lg border border-border-subtle">
                      {c.examinationFindings}
                    </p>
                  </div>

                  <div className="text-xs space-y-2">
                    <span className="font-bold text-navy block">Treatment & Surgical Plan:</span>
                    <p className="text-charcoal leading-relaxed p-3 bg-white rounded-lg border border-border-subtle">
                      {c.treatmentPlan}
                    </p>
                  </div>

                  {c.surgeryRecommended && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      <strong>Surgical Recommendation:</strong> {c.surgicalProcedureDetails || "Elective paediatric surgical procedure advised."}
                    </div>
                  )}

                  {c.followUpDate && (
                    <div className="text-xs text-charcoal">
                      <span>Follow-up Scheduled: </span>
                      <strong className="text-navy">{c.followUpDate}</strong>
                      {c.followUpInstructions && <span className="text-charcoal-muted ml-1">— {c.followUpInstructions}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Prescriptions */}
      {activeTab === "prescriptions" && (
        <div className="p-6 rounded-b-2xl bg-white border border-border-subtle shadow-editorial space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-base font-bold text-navy">
                Digital Prescriptions (Rx)
              </h3>
              <p className="text-xs text-charcoal-muted">
                Signed prescriptions formatted with doctor credentials and paediatric dosing.
              </p>
            </div>
          </div>

          {records.prescriptions.length === 0 ? (
            <div className="p-8 text-center text-xs text-charcoal-muted space-y-2">
              <Pill className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-navy">No Prescriptions Issued Yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-5 rounded-xl border border-border-subtle bg-warm-white space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                    <div>
                      <span className="font-mono font-bold text-navy text-xs">{rx.prescriptionNumber}</span>
                      <span className="text-xs text-charcoal-muted ml-2">• Issued: {rx.prescriptionDate}</span>
                    </div>
                    <Link
                      href={`/portal/prescriptions/${rx.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-medical hover:bg-medical-hover text-white text-xs font-semibold transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Prescription</span>
                    </Link>
                  </div>

                  <p className="text-xs font-semibold text-teal-dark">
                    Diagnosis: {rx.diagnosisSummary}
                  </p>

                  {/* Medicines Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border-subtle text-charcoal-muted uppercase text-[10px]">
                          <th className="py-2">Medicine Name & Form</th>
                          <th className="py-2">Dosage</th>
                          <th className="py-2">Frequency & Route</th>
                          <th className="py-2">Duration</th>
                          <th className="py-2">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle/50">
                        {rx.items.map((item) => (
                          <tr key={item.id}>
                            <td className="py-2 font-bold text-navy">
                              {item.medicineName} <span className="font-normal text-slate-500">({item.form} {item.strength})</span>
                            </td>
                            <td className="py-2 font-medium">{item.dosage}</td>
                            <td className="py-2">{item.frequency} ({item.route})</td>
                            <td className="py-2">{item.duration}</td>
                            <td className="py-2 text-charcoal-muted">{item.instructions || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {rx.generalAdvice && (
                    <p className="text-xs text-charcoal-muted pt-1">
                      <strong>General Advice:</strong> {rx.generalAdvice}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-charcoal-muted">
                    <span>Signed by: <strong>{rx.signedByDoctorName}</strong> ({rx.doctorRegistrationNumber})</span>
                    <span>{rx.signedAt ? new Date(rx.signedAt).toLocaleString() : ""}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Documents & Scans */}
      {activeTab === "documents" && (
        <div className="p-6 rounded-b-2xl bg-white border border-border-subtle shadow-editorial space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-base font-bold text-navy">
                Attached Medical Documents & Scans
              </h3>
              <p className="text-xs text-charcoal-muted">
                Ultrasounds, radiology films, laboratory panels, and discharge summaries.
              </p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy hover:bg-navy-light text-white text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Attach New Document</span>
            </button>
          </div>

          {records.documents.length === 0 ? (
            <div className="p-8 text-center text-xs text-charcoal-muted space-y-2">
              <Paperclip className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-navy">No Documents Attached Yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {records.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-border-subtle bg-warm-white space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-navy text-sm block">
                      {doc.documentTitle}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-light text-teal-dark border border-teal/20">
                      {doc.documentType}
                    </span>
                  </div>
                  <p className="text-charcoal-muted text-[11px] font-mono">
                    File: {doc.fileName} ({(doc.fileSize / 1024).toFixed(0)} KB)
                  </p>
                  {doc.notes && (
                    <p className="text-charcoal p-2 rounded bg-light-bg text-[11px]">
                      {doc.notes}
                    </p>
                  )}
                  <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-charcoal-muted">
                    <span>Uploaded by {doc.uploadedByUserName || "Staff"}</span>
                    <span>{doc.createdAt.split("T")[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Appointments History */}
      {activeTab === "appointments" && (
        <div className="p-6 rounded-b-2xl bg-white border border-border-subtle shadow-editorial space-y-4">
          <h3 className="text-base font-bold text-navy pb-3 border-b border-border-subtle">
            Appointments & Consultation Visits
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-charcoal-muted uppercase text-[10px]">
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Time</th>
                  <th className="py-2.5">Type</th>
                  <th className="py-2.5">Reason</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/60">
                {records.appointments.map((apt) => (
                  <tr key={apt.id}>
                    <td className="py-2.5 font-bold text-navy">{apt.appointmentDate}</td>
                    <td className="py-2.5">{apt.appointmentTime}</td>
                    <td className="py-2.5 capitalize">{(apt.consultationType || "General").toLowerCase().replace("_", " ")}</td>
                    <td className="py-2.5 text-charcoal-muted">{apt.reasonForVisit}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Billing History */}
      {activeTab === "billing" && (
        <div className="p-6 rounded-b-2xl bg-white border border-border-subtle shadow-editorial space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-base font-bold text-navy">
                Invoices & Receipts
              </h3>
              <p className="text-xs text-charcoal-muted">
                Clinical services billed for {patient.fullName}.
              </p>
            </div>
            <Link
              href={`/portal/billing?patientId=${patient.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-navy text-white text-xs font-semibold"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Create Invoice</span>
            </Link>
          </div>

          {records.invoices.length === 0 ? (
            <p className="text-xs text-charcoal-muted py-6 text-center">No billing records for this patient.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border-subtle text-charcoal-muted uppercase text-[10px]">
                    <th className="py-2.5">Invoice #</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Service Details</th>
                    <th className="py-2.5">Total Amount</th>
                    <th className="py-2.5">Paid</th>
                    <th className="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/60">
                  {records.invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="py-2.5 font-mono font-bold text-navy">{inv.invoiceNumber}</td>
                      <td className="py-2.5">{inv.invoiceDate}</td>
                      <td className="py-2.5 text-charcoal-muted">
                        {inv.items.map(i => i.serviceName).join(", ")}
                      </td>
                      <td className="py-2.5 font-bold text-navy">₹{inv.totalAmount}</td>
                      <td className="py-2.5 text-emerald-700 font-bold">₹{inv.paidAmount}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700"
                        }`}>
                          {inv.paymentStatus} ({inv.paymentMethod || "UNPAID"})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Attach Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-border-subtle overflow-hidden">
            <div className="p-4 bg-navy text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Attach Medical Report</h3>
              <button onClick={() => setIsUploadModalOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUploadDocument} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-charcoal block mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Inguinoscrotal Ultrasound Report"
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-light-bg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Document Category</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-light-bg text-xs"
                >
                  <option value="ULTRASOUND">Ultrasound Report</option>
                  <option value="X_RAY">X-Ray Report</option>
                  <option value="CT_SCAN">CT / MRI Scan</option>
                  <option value="LAB_REPORT">Blood / Urine Lab Report</option>
                  <option value="DISCHARGE_SUMMARY">Hospital Discharge Summary</option>
                  <option value="REFERRAL_SLIP">Paediatrician Referral Slip</option>
                  <option value="CONSENT_FORM">Surgical Consent Form</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">File Name *</label>
                <input
                  type="text"
                  required
                  value={docFileName}
                  onChange={(e) => setDocFileName(e.target.value)}
                  placeholder="e.g. scan_report_oct2026.pdf"
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-light-bg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Clinical Findings Note</label>
                <textarea
                  rows={3}
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  placeholder="Key radiologist findings or test values..."
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-light-bg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-border-subtle flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-border-subtle text-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-1.5 rounded-lg bg-navy text-white font-semibold disabled:opacity-50"
                >
                  {isUploading ? "Attaching..." : "Save Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Demographics Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-border-subtle overflow-hidden">
            <div className="p-4 bg-navy text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Edit Patient Demographics</h3>
              <button onClick={() => setIsEditModalOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveDemographics} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-charcoal block mb-1">Guardian Name</label>
                <input
                  type="text"
                  value={editData.parentGuardianName}
                  onChange={(e) => setEditData({ ...editData, parentGuardianName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-light-bg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Guardian Phone</label>
                <input
                  type="text"
                  value={editData.contactNumber}
                  onChange={(e) => setEditData({ ...editData, contactNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-light-bg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Residential Address</label>
                <input
                  type="text"
                  value={editData.address}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-light-bg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Drug Allergies</label>
                <input
                  type="text"
                  value={editData.allergies}
                  onChange={(e) => setEditData({ ...editData, allergies: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-light-bg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-border-subtle flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-border-subtle text-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-navy text-white font-semibold"
                >
                  Save Demographics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
