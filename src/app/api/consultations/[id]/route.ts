import { NextRequest, NextResponse } from "next/server";
import { clinicDb } from "@/lib/db/database";
import { requireUserWithRole } from "@/lib/auth/session";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireUserWithRole(["ADMIN", "DOCTOR", "RECEPTIONIST", "BILLING"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    const consultation = clinicDb.getConsultationById(id);
    if (!consultation) {
      return NextResponse.json({ error: "Consultation not found." }, { status: 404 });
    }

    const patient = clinicDb.getPatientById(consultation.patientId);
    const doctor = clinicDb.getUserById(consultation.doctorId);
    const prescription = clinicDb.listPrescriptions(consultation.patientId).find(p => p.consultationId === consultation.id);

    return NextResponse.json({
      success: true,
      consultation: {
        ...consultation,
        patient,
        doctor,
        prescription
      }
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireUserWithRole(["DOCTOR", "ADMIN"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const currentUser = authResult.user;

    const { id } = await params;
    const consultation = clinicDb.getConsultationById(id);
    if (!consultation) {
      return NextResponse.json({ error: "Consultation not found." }, { status: 404 });
    }

    // If already signed, only authorized corrections with audit log
    const updates = await req.json();

    if (updates.isSigned && !consultation.isSigned) {
      updates.signedAt = new Date().toISOString();
      updates.isDraft = false;
    }

    const updated = clinicDb.updateConsultation(consultation.id, updates);

    clinicDb.logAudit(
      updates.isSigned ? "CONSULTATION_SIGNED" : "CONSULTATION_CREATED",
      "Consultation",
      `Consultation ${consultation.consultationNumber} updated by ${currentUser.fullName}`,
      currentUser.id,
      currentUser.role,
      currentUser.fullName,
      consultation.id
    );

    await clinicDb.flushPendingWrites();

    return NextResponse.json({
      success: true,
      consultation: updated,
      message: "Consultation updated successfully."
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
