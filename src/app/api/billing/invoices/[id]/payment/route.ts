import { NextRequest, NextResponse } from "next/server";
import { clinicDb } from "@/lib/db/database";
import { requireUserWithRole } from "@/lib/auth/session";
import { PaymentMethod } from "@/lib/db/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireUserWithRole(["ADMIN", "BILLING", "RECEPTIONIST", "DOCTOR"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const currentUser = authResult.user;

    const { id } = await params;
    const body = await req.json();
    const { amount, method, reference } = body;

    const parsedAmount = parseFloat(String(amount || 0));
    if (parsedAmount <= 0 || !method) {
      return NextResponse.json(
        { error: "Valid payment amount and payment method are required." },
        { status: 400 }
      );
    }

    const updated = clinicDb.recordPayment(id, parsedAmount, method as PaymentMethod, reference);
    if (!updated) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    clinicDb.logAudit(
      "PAYMENT_RECORDED",
      "Invoice",
      `Payment of ₹${parsedAmount} (${method}) recorded for Invoice ${updated.invoiceNumber} by ${currentUser.fullName}`,
      currentUser.id,
      currentUser.role,
      currentUser.fullName,
      updated.id
    );

    await clinicDb.flushPendingWrites();

    return NextResponse.json({
      success: true,
      invoice: updated,
      message: `Payment of ₹${parsedAmount} recorded successfully. Balance: ₹${updated.balanceAmount}`
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
