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
    const currentUser = authResult.user;

    const { id } = await params;
    const patient = clinicDb.getPatientById(id);
    if (!patient) {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }

    // Scoped queries for full clinical timeline
    const consultations = clinicDb.listConsultations(patient.id);
    const prescriptions = clinicDb.listPrescriptions(patient.id);
    const documents = clinicDb.listPatientDocuments(patient.id);
    const appointments = clinicDb.listAppointments(undefined, undefined).filter(a => a.patientId === patient.id);
    
    // Billing history: accessible to both Doctor & Admin and Reception & Billing roles
    const invoices = clinicDb.listInvoices(patient.id);

    return NextResponse.json({
      success: true,
      patient,
      records: {
        consultations,
        prescriptions,
        documents,
        appointments,
        invoices
      }
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireUserWithRole(["ADMIN", "RECEPTIONIST", "DOCTOR"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const currentUser = authResult.user;

    const { id } = await params;
    const patient = clinicDb.getPatientById(id);
    if (!patient) {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }

    const updates = await req.json();

    // Prevent overwriting immutable keys
    delete updates.id;
    delete updates.patientId;
    delete updates.createdAt;
    delete updates.clinicId;

    const updated = clinicDb.updatePatient(patient.id, updates);

    clinicDb.logAudit(
      "PATIENT_UPDATED",
      "Patient",
      `Demographics updated for ${patient.fullName} (${patient.patientId}) by ${currentUser.fullName}`,
      currentUser.id,
      currentUser.role,
      currentUser.fullName,
      patient.id
    );

    return NextResponse.json({
      success: true,
      patient: updated,
      message: "Patient demographics updated successfully."
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
