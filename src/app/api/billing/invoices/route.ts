import { NextRequest, NextResponse } from "next/server";
import { clinicDb } from "@/lib/db/database";
import { requireUserWithRole } from "@/lib/auth/session";
import { PaymentStatus, PaymentMethod, InvoiceItem } from "@/lib/db/types";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireUserWithRole(["ADMIN", "BILLING", "DOCTOR", "RECEPTIONIST"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId") || undefined;
    const status = (searchParams.get("status") as PaymentStatus) || undefined;

    const invoices = clinicDb.listInvoices(patientId, status);
    
    // Enrich with patient details
    const enriched = invoices.map(inv => ({
      ...inv,
      patient: clinicDb.getPatientById(inv.patientId)
    }));

    return NextResponse.json({ success: true, count: enriched.length, invoices: enriched });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireUserWithRole(["ADMIN", "BILLING", "RECEPTIONIST", "DOCTOR"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const currentUser = authResult.user;

    const body = await req.json();
    const {
      patientId,
      appointmentId,
      consultationId,
      items = [],
      taxPercent = 0,
      discountAmount = 0,
      paymentMethod,
      paidAmount = 0,
      transactionReference,
      notes
    } = body;

    if (!patientId || items.length === 0) {
      return NextResponse.json(
        { error: "Required fields missing: Patient and at least one service item are mandatory." },
        { status: 400 }
      );
    }

    const patient = clinicDb.getPatientById(patientId);
    if (!patient) {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Calculate subtotal
    const preparedItems: InvoiceItem[] = items.map((item: Partial<InvoiceItem>, idx: number) => {
      const unitPrice = parseFloat(String(item.unitPrice || 0));
      const quantity = parseInt(String(item.quantity || 1), 10);
      return {
        id: `invi_${Date.now()}_${idx}`,
        invoiceId,
        serviceName: item.serviceName || "Clinical Service",
        unitPrice,
        quantity,
        totalPrice: unitPrice * quantity
      };
    });

    const subtotal = preparedItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const parsedTaxPercent = parseFloat(String(taxPercent || 0));
    const taxAmount = (subtotal * parsedTaxPercent) / 100;
    const parsedDiscount = parseFloat(String(discountAmount || 0));
    const totalAmount = Math.max(0, subtotal + taxAmount - parsedDiscount);
    const parsedPaid = parseFloat(String(paidAmount || 0));
    const balanceAmount = Math.max(0, totalAmount - parsedPaid);

    let paymentStatus: PaymentStatus = "UNPAID";
    if (balanceAmount === 0 && totalAmount > 0) {
      paymentStatus = "PAID";
    } else if (parsedPaid > 0) {
      paymentStatus = "PARTIALLY_PAID";
    }

    const newInvoice = clinicDb.createInvoice({
      patientId: patient.id,
      appointmentId,
      consultationId,
      invoiceDate: todayStr,
      items: preparedItems,
      subtotalAmount: subtotal,
      taxPercent: parsedTaxPercent,
      taxAmount,
      discountAmount: parsedDiscount,
      totalAmount,
      paidAmount: parsedPaid,
      balanceAmount,
      paymentStatus,
      paymentMethod: (paymentMethod as PaymentMethod) || undefined,
      transactionReference,
      billingStaffId: currentUser.id,
      billingStaffName: currentUser.fullName,
      notes,
      clinicId: currentUser.clinicId || "NLC-BHUBANESWAR"
    });

    clinicDb.logAudit(
      "INVOICE_GENERATED",
      "Invoice",
      `Invoice ${newInvoice.invoiceNumber} for ₹${totalAmount} (${paymentStatus}) created for ${patient.fullName} by ${currentUser.fullName}`,
      currentUser.id,
      currentUser.role,
      currentUser.fullName,
      newInvoice.id
    );

    await clinicDb.flushPendingWrites();

    const enrichedInvoice = {
      ...newInvoice,
      patient
    };

    return NextResponse.json({
      success: true,
      invoice: enrichedInvoice,
      message: `Invoice ${newInvoice.invoiceNumber} generated successfully.`
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
