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
    const q = searchParams.get("q") || undefined;
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const patients = clinicDb.listPatients(q, limit);
    return NextResponse.json({ success: true, count: patients.length, patients });
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
      fullName, 
      dateOfBirth, 
      gender, 
      bloodGroup, 
      parentGuardianName, 
      guardianRelationship, 
      contactNumber, 
      email, 
      address, 
      emergencyContact,
      allergies,
      chronicConditions,
      ignoreDuplicateWarning
    } = body;

    if (!fullName || !dateOfBirth || !gender || !parentGuardianName || !contactNumber) {
      return NextResponse.json(
        { error: "Required fields missing: Full Name, Date of Birth, Gender, Guardian Name, and Contact Number are mandatory." },
        { status: 400 }
      );
    }

    // Check for duplicate records
    const existing = clinicDb.checkDuplicatePatient(fullName, contactNumber, dateOfBirth);
    if (existing && !ignoreDuplicateWarning) {
      return NextResponse.json(
        { 
          isDuplicateWarning: true,
          error: `Potential duplicate record found: Patient ${existing.fullName} (${existing.patientId}) is already registered with contact ${existing.contactNumber}.`,
          existingPatient: existing
        },
        { status: 409 }
      );
    }

    const newPatient = clinicDb.createPatient({
      fullName: fullName.trim(),
      dateOfBirth,
      gender,
      bloodGroup: bloodGroup || undefined,
      parentGuardianName: parentGuardianName.trim(),
      guardianRelationship: guardianRelationship || "Father",
      contactNumber: contactNumber.trim(),
      email: email ? email.trim() : undefined,
      address: address ? address.trim() : undefined,
      emergencyContact: emergencyContact ? emergencyContact.trim() : undefined,
      allergies: allergies ? allergies.trim() : "None reported",
      chronicConditions: chronicConditions ? chronicConditions.trim() : undefined,
      clinicId: currentUser.clinicId || "NLC-BHUBANESWAR",
      registeredByUserId: currentUser.id
    });

    clinicDb.logAudit(
      "PATIENT_REGISTERED",
      "Patient",
      `New patient registered: ${newPatient.fullName} (${newPatient.patientId}) by ${currentUser.fullName}`,
      currentUser.id,
      currentUser.role,
      currentUser.fullName,
      newPatient.id
    );

    await clinicDb.flushPendingWrites();

    return NextResponse.json({
      success: true,
      patient: newPatient,
      message: `Patient ${newPatient.fullName} registered successfully with ID ${newPatient.patientId}`
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
