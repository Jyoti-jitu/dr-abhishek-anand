import { NextRequest, NextResponse } from "next/server";
import { clinicDb } from "@/lib/db/database";
import { requireUserWithRole } from "@/lib/auth/session";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireUserWithRole(["ADMIN", "RECEPTIONIST", "DOCTOR"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const currentUser = authResult.user;

    const { id } = await params;
    const appointment = clinicDb.getAppointmentById(id);
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
    }

    const updates = await req.json();

    // If rescheduling, check slot conflict
    if (updates.appointmentDate && updates.appointmentTime && 
       (updates.appointmentDate !== appointment.appointmentDate || updates.appointmentTime !== appointment.appointmentTime)) {
      const hasConflict = clinicDb.checkSlotConflict(
        updates.doctorId || appointment.doctorId,
        updates.appointmentDate,
        updates.appointmentTime
      );
      if (hasConflict) {
        return NextResponse.json(
          { error: `Slot conflict: The requested slot on ${updates.appointmentDate} at ${updates.appointmentTime} is already booked.` },
          { status: 409 }
        );
      }
    }

    const updated = clinicDb.updateAppointment(appointment.id, updates);

    clinicDb.logAudit(
      updates.status === "CANCELLED" ? "APPOINTMENT_CANCELLED" : "APPOINTMENT_RESCHEDULED",
      "Appointment",
      `Appointment ${appointment.appointmentNumber} updated (Status: ${updates.status || appointment.status}) by ${currentUser.fullName}`,
      currentUser.id,
      currentUser.role,
      currentUser.fullName,
      appointment.id
    );

    await clinicDb.flushPendingWrites();

    return NextResponse.json({
      success: true,
      appointment: updated,
      message: "Appointment updated successfully."
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
