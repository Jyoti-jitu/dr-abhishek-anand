import { NextRequest, NextResponse } from "next/server";
import { clinicDb } from "@/lib/db/database";
import { requireUserWithRole } from "@/lib/auth/session";
import { PrescriptionItem } from "@/lib/db/types";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireUserWithRole(["ADMIN", "DOCTOR", "RECEPTIONIST", "BILLING"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId") || undefined;
    const doctorId = searchParams.get("doctorId") || undefined;

    const prescriptions = clinicDb.listPrescriptions(patientId, doctorId);
    
    // Enrich with patient details
    const enriched = prescriptions.map(p => ({
      ...p,
      patient: clinicDb.getPatientById(p.patientId)
    }));

    return NextResponse.json({ success: true, count: enriched.length, prescriptions: enriched });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireUserWithRole(["DOCTOR", "ADMIN"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const currentUser = authResult.user;

    const body = await req.json();
    const {
      consultationId,
      patientId,
      diagnosisSummary,
      generalAdvice,
      dietaryAdvice,
      followUpAdvice,
      items = [],
      isSigned = true
    } = body;

    if (!patientId || !consultationId || !diagnosisSummary || items.length === 0) {
      return NextResponse.json(
        { error: "Required fields missing: Patient, Consultation, Diagnosis, and at least one medication item are mandatory." },
        { status: 400 }
      );
    }

    const patient = clinicDb.getPatientById(patientId);
    if (!patient) {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const prescriptionId = `rx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Prepare items with IDs
    const preparedItems: PrescriptionItem[] = items.map((item: Partial<PrescriptionItem>, idx: number) => ({
      id: `rxi_${Date.now()}_${idx}`,
      prescriptionId,
      medicineName: item.medicineName || "Prescribed Medicine",
      composition: item.composition || "",
      strength: item.strength || "Standard",
      form: item.form || "Syrup",
      dosage: item.dosage || "As directed",
      route: item.route || "Oral",
      frequency: item.frequency || "BD (Twice daily)",
      duration: item.duration || "5 days",
      instructions: item.instructions || "",
      sortOrder: idx + 1
    }));

    const newPrescription = clinicDb.createPrescription({
      consultationId,
      patientId: patient.id,
      doctorId: currentUser.id,
      prescriptionDate: todayStr,
      diagnosisSummary,
      generalAdvice,
      dietaryAdvice,
      followUpAdvice,
      isDraft: !isSigned,
      isSigned: Boolean(isSigned),
      signedAt: isSigned ? new Date().toISOString() : undefined,
      signedByDoctorName: currentUser.fullName,
      doctorRegistrationNumber: currentUser.registrationNumber || "State Medical Council Verified",
      items: preparedItems,
      clinicId: currentUser.clinicId || "NLC-BHUBANESWAR"
    });

    clinicDb.logAudit(
      "PRESCRIPTION_SIGNED",
      "Prescription",
      `Prescription ${newPrescription.prescriptionNumber} (${preparedItems.length} items) issued for ${patient.fullName} by ${currentUser.fullName}`,
      currentUser.id,
      currentUser.role,
      currentUser.fullName,
      newPrescription.id
    );

    return NextResponse.json({
      success: true,
      prescription: newPrescription,
      message: `Prescription ${newPrescription.prescriptionNumber} created and signed successfully.`
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
