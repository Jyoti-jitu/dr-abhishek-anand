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
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const logs = clinicDb.listAuditLogs(limit);
    return NextResponse.json({ success: true, count: logs.length, logs });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
