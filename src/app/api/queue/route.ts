import { NextRequest, NextResponse } from "next/server";
import { clinicDb } from "@/lib/db/database";
import { requireUserWithRole } from "@/lib/auth/session";
import { QueueStatus } from "@/lib/db/types";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireUserWithRole(["ADMIN", "DOCTOR", "RECEPTIONIST", "BILLING"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId") || undefined;
    const date = searchParams.get("date") || undefined;

    const queueEntries = clinicDb.getTodayQueue(doctorId, date);
    return NextResponse.json({ success: true, count: queueEntries.length, queue: queueEntries });
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
    const priority = body.priorityLevel || body.priority || "NORMAL";
    const { patientId, appointmentId, doctorId = "usr_doctor_01", date } = body;

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required." }, { status: 400 });
    }

    const patient = clinicDb.getPatientById(patientId);
    if (!patient) {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }

    const newEntry = clinicDb.createQueueToken(patient.id, appointmentId, doctorId, priority, date);

    clinicDb.logAudit(
      "QUEUE_CHECKIN",
      "Queue",
      `Queue token ${newEntry.tokenCode} issued for ${patient.fullName} (${newEntry.priorityLevel}) by ${currentUser.fullName}`,
      currentUser.id,
      currentUser.role,
      currentUser.fullName,
      newEntry.id
    );

    await clinicDb.flushPendingWrites();

    return NextResponse.json({
      success: true,
      queueEntry: newEntry,
      message: `Token ${newEntry.tokenCode} issued for ${patient.fullName}`
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await requireUserWithRole(["ADMIN", "DOCTOR", "RECEPTIONIST"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const currentUser = authResult.user;

    const body = await req.json();
    const { queueId, status } = body;

    if (!queueId || !status) {
      return NextResponse.json({ error: "Queue ID and status are required." }, { status: 400 });
    }

    const updated = clinicDb.updateQueueStatus(queueId, status as QueueStatus);
    if (!updated) {
      return NextResponse.json({ error: "Queue entry not found." }, { status: 404 });
    }

    clinicDb.logAudit(
      "QUEUE_STATUS_CHANGED",
      "Queue",
      `Queue ${updated.tokenCode} status changed to ${status} by ${currentUser.fullName}`,
      currentUser.id,
      currentUser.role,
      currentUser.fullName,
      updated.id
    );

    await clinicDb.flushPendingWrites();

    return NextResponse.json({
      success: true,
      queueEntry: updated,
      message: `Queue status updated to ${status}`
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
