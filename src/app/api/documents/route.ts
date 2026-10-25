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
    const patientId = searchParams.get("patientId");
    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required." }, { status: 400 });
    }

    const docs = clinicDb.listPatientDocuments(patientId);
    return NextResponse.json({ success: true, count: docs.length, documents: docs });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireUserWithRole(["ADMIN", "DOCTOR", "RECEPTIONIST"]);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const currentUser = authResult.user;

    const body = await req.json();
    const { patientId, documentTitle, documentType, fileName, fileSize, mimeType, notes } = body;

    if (!patientId || !documentTitle || !documentType || !fileName) {
      return NextResponse.json(
        { error: "Required fields missing: Patient, Document Title, Document Type, and File Name are mandatory." },
        { status: 400 }
      );
    }

    const patient = clinicDb.getPatientById(patientId);
    if (!patient) {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }

    const newDoc = clinicDb.createPatientDocument({
      patientId: patient.id,
      documentTitle: documentTitle.trim(),
      documentType,
      fileUrl: `/documents/secure/${encodeURIComponent(fileName)}`,
      fileName: fileName.trim(),
      fileSize: fileSize || 256000,
      mimeType: mimeType || "application/pdf",
      uploadedByUserId: currentUser.id,
      uploadedByUserName: currentUser.fullName,
      notes: notes ? notes.trim() : undefined,
      clinicId: currentUser.clinicId || "NLC-BHUBANESWAR"
    });

    clinicDb.logAudit(
      "DOCUMENT_UPLOADED",
      "Document",
      `Document "${newDoc.documentTitle}" (${newDoc.documentType}) attached to patient ${patient.fullName} by ${currentUser.fullName}`,
      currentUser.id,
      currentUser.role,
      currentUser.fullName,
      newDoc.id
    );

    await clinicDb.flushPendingWrites();

    return NextResponse.json({
      success: true,
      document: newDoc,
      message: `Document "${newDoc.documentTitle}" attached successfully.`
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
