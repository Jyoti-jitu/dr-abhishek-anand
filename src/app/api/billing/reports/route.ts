import { NextRequest, NextResponse } from "next/server";
import { clinicDb } from "@/lib/db/database";
import { requireUserWithRole } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireUserWithRole(["ADMIN", "BILLING", "DOCTOR", "RECEPTIONIST"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format");

    const financialData = clinicDb.getFinancialReports();
    const allInvoices = clinicDb.listInvoices();

    if (format === "csv") {
      // Export all invoices to CSV
      const headers = ["Invoice Number", "Date", "Patient ID", "Services", "Subtotal", "Tax", "Discount", "Total", "Paid", "Balance", "Status", "Payment Method", "Billed By"];
      const rows = allInvoices.map(inv => {
        const services = inv.items.map(i => `${i.serviceName} (${i.quantity}x)`).join("; ");
        return [
          `"${inv.invoiceNumber}"`,
          `"${inv.invoiceDate}"`,
          `"${inv.patientId}"`,
          `"${services}"`,
          inv.subtotalAmount,
          inv.taxAmount,
          inv.discountAmount,
          inv.totalAmount,
          inv.paidAmount,
          inv.balanceAmount,
          `"${inv.paymentStatus}"`,
          `"${inv.paymentMethod || 'N/A'}"`,
          `"${inv.billingStaffName || 'Staff'}"`
        ].join(",");
      });

      const csvContent = [headers.join(","), ...rows].join("\n");
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="new_life_clinic_billing_report_${new Date().toISOString().split("T")[0]}.csv"`
        }
      });
    }

    return NextResponse.json({
      success: true,
      report: financialData,
      recentInvoices: allInvoices.slice(0, 10)
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
