import { NextResponse } from "next/server";
import { destroySession, getAuthenticatedUser } from "@/lib/auth/session";
import { clinicDb } from "@/lib/db/database";

export async function POST() {
  try {
    const user = await getAuthenticatedUser();
    if (user) {
      clinicDb.logAudit(
        "LOGOUT",
        "User",
        `User ${user.fullName} logged out.`,
        user.id,
        user.role,
        user.fullName,
        user.id
      );
      await clinicDb.flushPendingWrites();
    }
    await destroySession();
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
