import { NextRequest, NextResponse } from "next/server";
import { clinicDb } from "@/lib/db/database";
import { requireUserWithRole } from "@/lib/auth/session";
import { AppointmentStatus, ConsultationType } from "@/lib/db/types";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireUserWithRole(["ADMIN", "DOCTOR", "RECEPTIONIST", "BILLING"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || undefined;
    const doctorId = searchParams.get("doctorId") || undefined;
    const status = (searchParams.get("status") as AppointmentStatus) || undefined;

    const appointments = clinicDb.listAppointments(date, doctorId, status);
    
    // Enrich with patient details
    const enriched = appointments.map(a => ({
      ...a,
      patient: clinicDb.getPatientById(a.patientId)
    }));

    return NextResponse.json({ success: true, count: enriched.length, appointments: enriched });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireUserWithRole(["ADMIN", "RECEPTIONIST", "DOCTOR"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const currentUser = authResult.user;

    const body = await req.json();
    const {
      patientId,
      doctorId = "usr_doctor_01",
      appointmentDate,
      appointmentTime,
      slotDurationMinutes = 20,
      consultationType = "NEW_CONSULTATION",
      reasonForVisit,
      notes,
      checkInImmediately
    } = body;

    if (!patientId || !appointmentDate || !appointmentTime || !reasonForVisit) {
      return NextResponse.json(
        { error: "Required fields missing: Patient, Date, Time, and Reason for visit are mandatory." },
        { status: 400 }
      );
    }

    // Verify patient exists
    const patient = clinicDb.getPatientById(patientId);
    if (!patient) {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }

    // Check slot conflict
    const hasConflict = clinicDb.checkSlotConflict(doctorId, appointmentDate, appointmentTime);
    if (hasConflict) {
      return NextResponse.json(
        { error: `Slot conflict: An active appointment already exists at ${appointmentTime} on ${appointmentDate} for this clinician.` },
        { status: 409 }
      );
    }

    const newAppointment = clinicDb.createAppointment({
      patientId: patient.id,
      doctorId,
      appointmentDate,
      appointmentTime,
      slotDurationMinutes,
      status: checkInImmediately ? "WAITING" : "SCHEDULED",
      consultationType: consultationType as ConsultationType,
      reasonForVisit,
      notes,
      clinicId: currentUser.clinicId || "NLC-BHUBANESWAR",
      bookedByUserId: currentUser.id
    });

    // If walk-in / immediate check-in
    let queueToken = null;
    if (checkInImmediately) {
      queueToken = clinicDb.createQueueToken(patient.id, newAppointment.id, doctorId, "NORMAL");
    }

    clinicDb.logAudit(
      "APPOINTMENT_SCHEDULED",
      "Appointment",
      `Appointment ${newAppointment.appointmentNumber} scheduled for ${patient.fullName} on ${appointmentDate} at ${appointmentTime} by ${currentUser.fullName}`,
      currentUser.id,
      currentUser.role,
      currentUser.fullName,
      newAppointment.id
    );

    await clinicDb.flushPendingWrites();

    return NextResponse.json({
      success: true,
      appointment: newAppointment,
      queueToken,
      message: `Appointment scheduled successfully for ${patient.fullName}`
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
