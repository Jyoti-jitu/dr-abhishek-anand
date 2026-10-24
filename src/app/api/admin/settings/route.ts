import { NextRequest, NextResponse } from "next/server";
import { clinicDb } from "@/lib/db/database";
import { requireUserWithRole } from "@/lib/auth/session";

export async function GET() {
  try {
    const authResult = await requireUserWithRole(["ADMIN", "DOCTOR", "RECEPTIONIST", "BILLING"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const settings = clinicDb.getClinicSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await requireUserWithRole(["ADMIN", "DOCTOR", "RECEPTIONIST", "BILLING"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const currentUser = authResult.user;

    const updates = await req.json();
    const updated = clinicDb.updateClinicSettings(updates);

    clinicDb.logAudit(
      "SETTINGS_UPDATED",
      "Settings",
      `Clinic operational settings updated by ${currentUser.fullName}`,
      currentUser.id,
      currentUser.role,
      currentUser.fullName,
      updated.id
    );

    return NextResponse.json({
      success: true,
      settings: updated,
      message: "Clinic settings updated successfully."
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
