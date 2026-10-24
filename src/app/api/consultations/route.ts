import { NextRequest, NextResponse } from "next/server";
import { clinicDb } from "@/lib/db/database";
import { requireUserWithRole } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireUserWithRole(["ADMIN", "DOCTOR", "RECEPTIONIST", "BILLING"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId") || undefined;
    const doctorId = searchParams.get("doctorId") || undefined;

    const list = clinicDb.listConsultations(patientId, doctorId);
    
    // Enrich with patient and doctor details
    const enriched = list.map(c => ({
      ...c,
      patient: clinicDb.getPatientById(c.patientId),
      doctor: clinicDb.getUserById(c.doctorId),
      prescription: clinicDb.listPrescriptions(c.patientId).find(p => p.consultationId === c.id)
    }));

    return NextResponse.json({ success: true, count: enriched.length, consultations: enriched });
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
      patientId,
      appointmentId,
      presentingComplaints,
      historyOfPresentIllness,
      pastMedicalHistory,
      pastSurgicalHistory,
      vitalsWeightKg,
      vitalsHeightCm,
      vitalsTempF,
      vitalsHeartRateBpm,
      examinationFindings,
      clinicalAssessment,
      primaryDiagnosis,
      secondaryDiagnosis,
      investigationRecommendations,
      treatmentPlan,
      surgeryRecommended = false,
      surgicalProcedureDetails,
      followUpInstructions,
      followUpDate,
      isSigned = true
    } = body;

    if (!patientId || !presentingComplaints || !primaryDiagnosis || !treatmentPlan) {
      return NextResponse.json(
        { error: "Required fields missing: Patient, Presenting Complaints, Primary Diagnosis, and Treatment Plan are mandatory." },
        { status: 400 }
      );
    }

    const patient = clinicDb.getPatientById(patientId);
    if (!patient) {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    const newConsultation = clinicDb.createConsultation({
      appointmentId,
      patientId: patient.id,
      doctorId: currentUser.id,
      consultationDate: todayStr,
      presentingComplaints,
      historyOfPresentIllness,
      pastMedicalHistory,
      pastSurgicalHistory,
      vitalsWeightKg: vitalsWeightKg ? parseFloat(vitalsWeightKg) : undefined,
      vitalsHeightCm: vitalsHeightCm ? parseFloat(vitalsHeightCm) : undefined,
      vitalsTempF: vitalsTempF ? parseFloat(vitalsTempF) : undefined,
      vitalsHeartRateBpm: vitalsHeartRateBpm ? parseInt(vitalsHeartRateBpm, 10) : undefined,
      examinationFindings: examinationFindings || "No abnormal systemic signs detected.",
      clinicalAssessment: clinicalAssessment || primaryDiagnosis,
      primaryDiagnosis,
      secondaryDiagnosis,
      investigationRecommendations,
      treatmentPlan,
      surgeryRecommended: Boolean(surgeryRecommended),
      surgicalProcedureDetails,
      followUpInstructions,
      followUpDate,
      isDraft: !isSigned,
      isSigned: Boolean(isSigned),
      signedAt: isSigned ? new Date().toISOString() : undefined,
      clinicId: currentUser.clinicId || "NLC-BHUBANESWAR"
    });

    clinicDb.logAudit(
      isSigned ? "CONSULTATION_SIGNED" : "CONSULTATION_CREATED",
      "Consultation",
      `Consultation ${newConsultation.consultationNumber} (${isSigned ? "Signed & Finalized" : "Draft"}) for ${patient.fullName} by ${currentUser.fullName}`,
      currentUser.id,
      currentUser.role,
      currentUser.fullName,
      newConsultation.id
    );

    return NextResponse.json({
      success: true,
      consultation: newConsultation,
      message: `Consultation ${newConsultation.consultationNumber} recorded successfully.`
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
