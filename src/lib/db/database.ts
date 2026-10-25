import fs from "fs";
import path from "path";
import os from "os";
import { getMongoDb } from "./mongodb";
import type { Db } from "mongodb";
import { 
  ClinicDatabaseState, 
  User, 
  Patient, 
  Appointment, 
  QueueEntry, 
  Consultation, 
  Prescription, 
  PatientDocument, 
  Invoice, 
  AuditLog, 
  ClinicSetting,
  UserRole,
  AppointmentStatus,
  QueueStatus,
  PaymentStatus,
  PaymentMethod
} from "./types";
import { hashPassword } from "../auth/crypto";

// Bundled database path (read-only in serverless/Vercel)
const BUNDLED_DB_FILE = path.join(process.cwd(), "data", "clinic-database.json");

/**
 * Resolves the writable database file path.
 * On Vercel / AWS Lambda, the root deployment directory (/var/task) is read-only (EROFS).
 * In serverless environments, writes must go to os.tmpdir() (/tmp).
 */
function getWritableDbFile(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT) {
    return path.join(os.tmpdir(), "clinic-database.json");
  }

  const localDir = path.join(process.cwd(), "data");
  const localFile = path.join(localDir, "clinic-database.json");

  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    fs.accessSync(localDir, fs.constants.W_OK);
    return localFile;
  } catch {
    // If local directory is not writable (read-only filesystem / container), fallback to /tmp
    return path.join(os.tmpdir(), "clinic-database.json");
  }
}

// Initial realistic seed dataset for New Life Clinic & Dr. Abhishek Anand
function getInitialSeedData(): ClinicDatabaseState {
  const doctorHash = hashPassword("Doctor@2026");
  const adminHash = hashPassword("Admin@2026");
  const receptionHash = hashPassword("Reception@2026");
  const billingHash = hashPassword("Billing@2026");

  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const users: User[] = [
    {
      id: "usr_doctor_01",
      username: "dr.anand",
      email: "dr.abhishek.anand@newlifeclinic.in",
      passwordHash: doctorHash.hash,
      salt: doctorHash.salt,
      fullName: "Dr. Abhishek Anand",
      role: "DOCTOR",
      specialty: "Consultant Paediatric Surgeon & Clinic Administrator",
      registrationNumber: "State Medical Council / Verification Pending Formal Submission",
      phone: "+91 91246 16273",
      clinicId: "NLC-BHUBANESWAR",
      isActive: true,
      createdAt: "2026-10-01T10:00:00Z",
      updatedAt: "2026-10-01T10:00:00Z"
    },
    {
      id: "usr_admin_01",
      username: "admin",
      email: "admin@newlifeclinic.in",
      passwordHash: adminHash.hash,
      salt: adminHash.salt,
      fullName: "Doctor & Admin Desk",
      role: "ADMIN",
      phone: "+91 91246 16273",
      clinicId: "NLC-BHUBANESWAR",
      isActive: true,
      createdAt: "2026-10-01T10:00:00Z",
      updatedAt: "2026-10-01T10:00:00Z"
    },
    {
      id: "usr_reception_01",
      username: "reception",
      email: "reception@newlifeclinic.in",
      passwordHash: receptionHash.hash,
      salt: receptionHash.salt,
      fullName: "Priyanka Nayak",
      role: "RECEPTIONIST",
      phone: "+91 91246 16273",
      clinicId: "NLC-BHUBANESWAR",
      isActive: true,
      createdAt: "2026-10-01T10:00:00Z",
      updatedAt: "2026-10-01T10:00:00Z"
    },
    {
      id: "usr_billing_01",
      username: "billing",
      email: "billing@newlifeclinic.in",
      passwordHash: billingHash.hash,
      salt: billingHash.salt,
      fullName: "Reception & Billing Desk",
      role: "BILLING",
      phone: "+91 91246 16273",
      clinicId: "NLC-BHUBANESWAR",
      isActive: true,
      createdAt: "2026-10-01T10:00:00Z",
      updatedAt: "2026-10-01T10:00:00Z"
    }
  ];

  const patients: Patient[] = [
    {
      id: "pat_01",
      patientId: "NLC-2026-0001",
      fullName: "Aarav Patnaik",
      dateOfBirth: "2026-02-14",
      gender: "Male",
      bloodGroup: "O+",
      parentGuardianName: "Subhashree Patnaik",
      guardianRelationship: "Mother",
      contactNumber: "+91 98610 12345",
      email: "patnaik.family@example.com",
      address: "Plot 142, Soubhagya Nagar, Bhubaneswar",
      allergies: "No known drug allergies (NKDA)",
      chronicConditions: "Right congenital inguinal hernia",
      clinicId: "NLC-BHUBANESWAR",
      registeredByUserId: "usr_reception_01",
      createdAt: "2026-10-10T11:00:00Z",
      updatedAt: "2026-10-24T12:00:00Z"
    },
    {
      id: "pat_02",
      patientId: "NLC-2026-0002",
      fullName: "Ananya Mishra",
      dateOfBirth: "2023-08-20",
      gender: "Female",
      bloodGroup: "B+",
      parentGuardianName: "Ramesh Chandra Mishra",
      guardianRelationship: "Father",
      contactNumber: "+91 94370 23456",
      email: "ramesh.mishra@example.com",
      address: "Baramunda Village Road, Bhubaneswar",
      allergies: "Amoxicillin causes skin rash",
      chronicConditions: "Left pelvi-ureteric junction (PUJ) hydronephrosis",
      clinicId: "NLC-BHUBANESWAR",
      registeredByUserId: "usr_reception_01",
      createdAt: "2026-10-12T10:30:00Z",
      updatedAt: "2026-10-24T12:30:00Z"
    },
    {
      id: "pat_03",
      patientId: "NLC-2026-0003",
      fullName: "Sai Krushna Das",
      dateOfBirth: "2025-10-05",
      gender: "Male",
      bloodGroup: "A+",
      parentGuardianName: "Manas Das",
      guardianRelationship: "Father",
      contactNumber: "+91 99371 34567",
      address: "Khandagiri Enclave, Bhubaneswar",
      allergies: "None reported",
      chronicConditions: "Left undescended testis (palpable in superficial pouch)",
      clinicId: "NLC-BHUBANESWAR",
      registeredByUserId: "usr_reception_01",
      createdAt: "2026-10-15T15:20:00Z",
      updatedAt: "2026-10-24T13:00:00Z"
    },
    {
      id: "pat_04",
      patientId: "NLC-2026-0004",
      fullName: "Tanmayee Behera",
      dateOfBirth: "2020-04-12",
      gender: "Female",
      bloodGroup: "AB+",
      parentGuardianName: "Sasmita Behera",
      guardianRelationship: "Mother",
      contactNumber: "+91 98530 45678",
      address: "Soubhagya Nagar Phase-2, Bhubaneswar",
      allergies: "None",
      chronicConditions: "Post-operative follow up: Laparoscopic appendicectomy",
      clinicId: "NLC-BHUBANESWAR",
      registeredByUserId: "usr_reception_01",
      createdAt: "2026-10-18T16:00:00Z",
      updatedAt: "2026-10-24T14:00:00Z"
    },
    {
      id: "pat_05",
      patientId: "NLC-2026-0005",
      fullName: "Baby of Sunita Jena",
      dateOfBirth: "2026-10-06",
      gender: "Male",
      bloodGroup: "O+",
      parentGuardianName: "Sunita Jena",
      guardianRelationship: "Mother",
      contactNumber: "+91 97760 56789",
      address: "Siripur Square, Bhubaneswar",
      allergies: "None",
      chronicConditions: "Umbilical granuloma evaluation",
      clinicId: "NLC-BHUBANESWAR",
      registeredByUserId: "usr_reception_01",
      createdAt: "2026-10-20T17:15:00Z",
      updatedAt: "2026-10-24T14:15:00Z"
    }
  ];

  const appointments: Appointment[] = [
    {
      id: "apt_01",
      appointmentNumber: "APT-2026-0001",
      patientId: "pat_01",
      doctorId: "usr_doctor_01",
      appointmentDate: todayStr,
      appointmentTime: "05:00 PM",
      slotDurationMinutes: 20,
      status: "IN_CONSULTATION",
      consultationType: "NEW_CONSULTATION",
      reasonForVisit: "Right groin swelling appearing when crying (suspected hernia)",
      tokenNumber: 1,
      tokenCode: "T-01",
      notes: "Infant is calm. Mother brought previous ultrasound report.",
      clinicId: "NLC-BHUBANESWAR",
      bookedByUserId: "usr_reception_01",
      createdAt: `${todayStr}T09:00:00Z`,
      updatedAt: `${todayStr}T17:05:00Z`
    },
    {
      id: "apt_02",
      appointmentNumber: "APT-2026-0002",
      patientId: "pat_02",
      doctorId: "usr_doctor_01",
      appointmentDate: todayStr,
      appointmentTime: "05:30 PM",
      slotDurationMinutes: 20,
      status: "WAITING",
      consultationType: "FOLLOW_UP",
      reasonForVisit: "Review of 6-month repeat renal ultrasound for PUJ hydronephrosis",
      tokenNumber: 2,
      tokenCode: "T-02",
      notes: "Checked in at reception at 05:15 PM.",
      clinicId: "NLC-BHUBANESWAR",
      bookedByUserId: "usr_reception_01",
      createdAt: `${todayStr}T09:15:00Z`,
      updatedAt: `${todayStr}T17:15:00Z`
    },
    {
      id: "apt_03",
      appointmentNumber: "APT-2026-0003",
      patientId: "pat_03",
      doctorId: "usr_doctor_01",
      appointmentDate: todayStr,
      appointmentTime: "06:00 PM",
      slotDurationMinutes: 20,
      status: "CHECKED_IN",
      consultationType: "NEW_CONSULTATION",
      reasonForVisit: "Evaluation for left undescended testis, age 1 year",
      tokenNumber: 3,
      tokenCode: "T-03",
      notes: "Father arrived, waiting in reception.",
      clinicId: "NLC-BHUBANESWAR",
      bookedByUserId: "usr_reception_01",
      createdAt: `${todayStr}T10:00:00Z`,
      updatedAt: `${todayStr}T17:25:00Z`
    },
    {
      id: "apt_04",
      appointmentNumber: "APT-2026-0004",
      patientId: "pat_04",
      doctorId: "usr_doctor_01",
      appointmentDate: todayStr,
      appointmentTime: "06:30 PM",
      slotDurationMinutes: 20,
      status: "SCHEDULED",
      consultationType: "POST_OP_REVIEW",
      reasonForVisit: "Day 10 post-laparoscopic appendicectomy wound check",
      notes: "Surgical procedure done at partner hospital.",
      clinicId: "NLC-BHUBANESWAR",
      bookedByUserId: "usr_reception_01",
      createdAt: `${todayStr}T11:00:00Z`,
      updatedAt: `${todayStr}T11:00:00Z`
    },
    {
      id: "apt_05",
      appointmentNumber: "APT-2026-0005",
      patientId: "pat_05",
      doctorId: "usr_doctor_01",
      appointmentDate: todayStr,
      appointmentTime: "07:00 PM",
      slotDurationMinutes: 20,
      status: "SCHEDULED",
      consultationType: "NEW_CONSULTATION",
      reasonForVisit: "Umbilical stump moistness & granuloma check",
      notes: "Newborn infant.",
      clinicId: "NLC-BHUBANESWAR",
      bookedByUserId: "usr_reception_01",
      createdAt: `${todayStr}T12:00:00Z`,
      updatedAt: `${todayStr}T12:00:00Z`
    }
  ];

  const queue: QueueEntry[] = [
    {
      id: "que_01",
      tokenCode: "T-01",
      tokenNumber: 1,
      patientId: "pat_01",
      appointmentId: "apt_01",
      doctorId: "usr_doctor_01",
      queueStatus: "IN_CONSULTATION",
      queueDate: todayStr,
      checkInTime: `${todayStr}T16:55:00Z`,
      consultationStartTime: `${todayStr}T17:05:00Z`,
      priorityLevel: "NORMAL",
      clinicId: "NLC-BHUBANESWAR",
      createdAt: `${todayStr}T16:55:00Z`,
      updatedAt: `${todayStr}T17:05:00Z`
    },
    {
      id: "que_02",
      tokenCode: "T-02",
      tokenNumber: 2,
      patientId: "pat_02",
      appointmentId: "apt_02",
      doctorId: "usr_doctor_01",
      queueStatus: "WAITING",
      queueDate: todayStr,
      checkInTime: `${todayStr}T17:15:00Z`,
      priorityLevel: "NORMAL",
      clinicId: "NLC-BHUBANESWAR",
      createdAt: `${todayStr}T17:15:00Z`,
      updatedAt: `${todayStr}T17:15:00Z`
    },
    {
      id: "que_03",
      tokenCode: "T-03",
      tokenNumber: 3,
      patientId: "pat_03",
      appointmentId: "apt_03",
      doctorId: "usr_doctor_01",
      queueStatus: "WAITING",
      queueDate: todayStr,
      checkInTime: `${todayStr}T17:25:00Z`,
      priorityLevel: "INFANT_PRIORITY",
      clinicId: "NLC-BHUBANESWAR",
      createdAt: `${todayStr}T17:25:00Z`,
      updatedAt: `${todayStr}T17:25:00Z`
    }
  ];

  const consultations: Consultation[] = [
    {
      id: "cns_01",
      consultationNumber: "CNS-2026-0001",
      appointmentId: "apt_01",
      patientId: "pat_01",
      doctorId: "usr_doctor_01",
      consultationDate: todayStr,
      presentingComplaints: "Intermittent right groin swelling for 3 weeks, noticeable when baby cries or strains during bowel movement. Disappears when asleep.",
      historyOfPresentIllness: "8-month-old infant born full term. Mother noticed reducible bulge in right groin. No history of vomiting, abdominal distension, or incarcerated episodes.",
      pastMedicalHistory: "Immunized as per age. No prior hospitalizations.",
      pastSurgicalHistory: "None.",
      vitalsWeightKg: 8.4,
      vitalsHeightCm: 71,
      vitalsTempF: 98.4,
      vitalsHeartRateBpm: 118,
      examinationFindings: "Abdomen soft, non-tender. Right groin demonstrates palpable silk-sign (thickened spermatic cord). Smooth reducible swelling extending to upper scrotum on crying. Bilateral testes normally descended into scrotum.",
      clinicalAssessment: "Right Congenital Inguinal Hernia (Reducible, patent processus vaginalis).",
      primaryDiagnosis: "Right Congenital Inguinal Hernia",
      secondaryDiagnosis: "None",
      investigationRecommendations: "Routine pre-operative workup: Complete Hemogram, Bleeding Time, Clotting Time, Blood grouping.",
      treatmentPlan: "Elective Right Paediatric Herniotomy (day-care procedure) recommended to prevent risk of irreducibility/incarceration. Procedure and anaesthesia safety thoroughly discussed with mother.",
      surgeryRecommended: true,
      surgicalProcedureDetails: "Right Inguinal Herniotomy under general anaesthesia + caudal block at partner surgical facility in Bhubaneswar.",
      followUpInstructions: "Keep baby well-hydrated. If swelling becomes hard, painful, or does not reduce, report to emergency triage immediately.",
      followUpDate: "2026-11-05",
      isDraft: false,
      isSigned: true,
      signedAt: `${todayStr}T17:20:00Z`,
      clinicId: "NLC-BHUBANESWAR",
      createdAt: `${todayStr}T17:05:00Z`,
      updatedAt: `${todayStr}T17:20:00Z`
    }
  ];

  const prescriptions: Prescription[] = [
    {
      id: "rx_01",
      prescriptionNumber: "RX-2026-0001",
      consultationId: "cns_01",
      patientId: "pat_01",
      doctorId: "usr_doctor_01",
      prescriptionDate: todayStr,
      diagnosisSummary: "Right Inguinal Hernia (Reducible) in an 8-month infant",
      generalAdvice: "Avoid vigorous straining. Do not apply tight abdominal binders. Keep area clean and dry.",
      dietaryAdvice: "Continue regular breastfeeds and age-appropriate soft complementary foods. Ensure good hydration.",
      followUpAdvice: "Elective herniotomy consultation planned. Return if acute irreducible bulge develops.",
      isDraft: false,
      isSigned: true,
      signedAt: `${todayStr}T17:22:00Z`,
      signedByDoctorName: "Dr. Abhishek Anand",
      doctorRegistrationNumber: "State Medical Council Verified",
      items: [
        {
          id: "rxi_01",
          prescriptionId: "rx_01",
          medicineName: "Syrup Paracetamol (Paediatric Suspension)",
          composition: "Paracetamol 120mg / 5ml",
          strength: "120mg/5ml",
          form: "Suspension",
          dosage: "3.5 ml (15 mg/kg)",
          route: "Oral",
          frequency: "SOS (As needed)",
          duration: "3 days",
          instructions: "Only if baby is irritable or in pain (minimum 6 hours gap between doses)",
          sortOrder: 1
        },
        {
          id: "rxi_02",
          prescriptionId: "rx_01",
          medicineName: "Paediatric Multivitamin Drops",
          composition: "Essential multivitamins + zinc",
          strength: "Standard infant drops",
          form: "Drops",
          dosage: "0.5 ml",
          route: "Oral",
          frequency: "OD (Once daily)",
          duration: "30 days",
          instructions: "After morning feed",
          sortOrder: 2
        }
      ],
      clinicId: "NLC-BHUBANESWAR",
      createdAt: `${todayStr}T17:20:00Z`,
      updatedAt: `${todayStr}T17:22:00Z`
    }
  ];

  const documents: PatientDocument[] = [
    {
      id: "doc_01",
      patientId: "pat_01",
      documentTitle: "Inguinoscrotal Ultrasound Scan",
      documentType: "ULTRASOUND",
      fileUrl: "/documents/sample-ultrasound-hernia.pdf",
      fileName: "aarav_usg_groin_oct2026.pdf",
      fileSize: 425600,
      mimeType: "application/pdf",
      uploadedByUserId: "usr_reception_01",
      uploadedByUserName: "Priyanka Nayak",
      notes: "Shows 4.2mm patent processus vaginalis with transient herniation of bowel loop.",
      clinicId: "NLC-BHUBANESWAR",
      createdAt: "2026-10-10T11:15:00Z"
    },
    {
      id: "doc_02",
      patientId: "pat_02",
      documentTitle: "Renal & Bladder Ultrasound Report",
      documentType: "ULTRASOUND",
      fileUrl: "/documents/sample-ultrasound-kidney.pdf",
      fileName: "ananya_kidney_usg_aug2026.pdf",
      fileSize: 512000,
      mimeType: "application/pdf",
      uploadedByUserId: "usr_reception_01",
      uploadedByUserName: "Priyanka Nayak",
      notes: "Shows left anteroposterior pelvic diameter (APD) 14mm with calyceal blunting.",
      clinicId: "NLC-BHUBANESWAR",
      createdAt: "2026-10-12T10:45:00Z"
    }
  ];

  const invoices: Invoice[] = [
    {
      id: "inv_01",
      invoiceNumber: "INV-2026-0001",
      patientId: "pat_01",
      appointmentId: "apt_01",
      consultationId: "cns_01",
      invoiceDate: todayStr,
      items: [
        {
          id: "invi_01",
          invoiceId: "inv_01",
          serviceName: "New Paediatric Surgical Consultation",
          unitPrice: 500,
          quantity: 1,
          totalPrice: 500
        }
      ],
      subtotalAmount: 500,
      taxPercent: 0,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 500,
      paidAmount: 500,
      balanceAmount: 0,
      paymentStatus: "PAID",
      paymentMethod: "UPI_QR",
      transactionReference: "UPI/20261024/987654",
      billingStaffId: "usr_billing_01",
      billingStaffName: "Rajesh Das",
      notes: "Payment received via clinic UPI QR desk.",
      clinicId: "NLC-BHUBANESWAR",
      createdAt: `${todayStr}T17:25:00Z`,
      updatedAt: `${todayStr}T17:25:00Z`
    },
    {
      id: "inv_02",
      invoiceNumber: "INV-2026-0002",
      patientId: "pat_02",
      appointmentId: "apt_02",
      invoiceDate: todayStr,
      items: [
        {
          id: "invi_02",
          invoiceId: "inv_02",
          serviceName: "Paediatric Surgical Follow-up OPD Review",
          unitPrice: 300,
          quantity: 1,
          totalPrice: 300
        }
      ],
      subtotalAmount: 300,
      taxPercent: 0,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 300,
      paidAmount: 300,
      balanceAmount: 0,
      paymentStatus: "PAID",
      paymentMethod: "CASH",
      billingStaffId: "usr_billing_01",
      billingStaffName: "Rajesh Das",
      notes: "Cash collection at front desk.",
      clinicId: "NLC-BHUBANESWAR",
      createdAt: `${todayStr}T17:18:00Z`,
      updatedAt: `${todayStr}T17:18:00Z`
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: "aud_01",
      action: "LOGIN",
      userId: "usr_doctor_01",
      userRole: "DOCTOR",
      userName: "Dr. Abhishek Anand",
      entityType: "User",
      entityId: "usr_doctor_01",
      details: "Doctor logged into clinical dashboard from clinic reception IP",
      ipAddress: "192.168.1.10",
      clinicId: "NLC-BHUBANESWAR",
      timestamp: `${todayStr}T16:45:00Z`
    },
    {
      id: "aud_02",
      action: "QUEUE_CHECKIN",
      userId: "usr_reception_01",
      userRole: "RECEPTIONIST",
      userName: "Priyanka Nayak",
      entityType: "Queue",
      entityId: "que_01",
      details: "Patient Aarav Patnaik checked in. Token T-01 issued.",
      ipAddress: "192.168.1.12",
      clinicId: "NLC-BHUBANESWAR",
      timestamp: `${todayStr}T16:55:00Z`
    },
    {
      id: "aud_03",
      action: "CONSULTATION_SIGNED",
      userId: "usr_doctor_01",
      userRole: "DOCTOR",
      userName: "Dr. Abhishek Anand",
      entityType: "Consultation",
      entityId: "cns_01",
      details: "Consultation CNS-2026-0001 signed and finalized for Aarav Patnaik",
      ipAddress: "192.168.1.10",
      clinicId: "NLC-BHUBANESWAR",
      timestamp: `${todayStr}T17:20:00Z`
    },
    {
      id: "aud_04",
      action: "PRESCRIPTION_SIGNED",
      userId: "usr_doctor_01",
      userRole: "DOCTOR",
      userName: "Dr. Abhishek Anand",
      entityType: "Prescription",
      entityId: "rx_01",
      details: "Prescription RX-2026-0001 signed and locked for Aarav Patnaik",
      ipAddress: "192.168.1.10",
      clinicId: "NLC-BHUBANESWAR",
      timestamp: `${todayStr}T17:22:00Z`
    },
    {
      id: "aud_05",
      action: "INVOICE_GENERATED",
      userId: "usr_billing_01",
      userRole: "BILLING",
      userName: "Rajesh Das",
      entityType: "Invoice",
      entityId: "inv_01",
      details: "Invoice INV-2026-0001 for ₹500 generated and marked PAID via UPI_QR",
      ipAddress: "192.168.1.15",
      clinicId: "NLC-BHUBANESWAR",
      timestamp: `${todayStr}T17:25:00Z`
    }
  ];

  const settings: ClinicSetting = {
    id: "set_01",
    clinicName: "New Life Clinic",
    clinicCode: "NLC-BHUBANESWAR",
    address: "Soubhagya Nagar, Bhubaneswar, Odisha — 751003",
    phone: "+91 91246 16273",
    email: "contact@newlifeclinic.in",
    opdStartTime: "17:00",
    opdEndTime: "21:00",
    slotDurationMinutes: 20,
    defaultConsultationFee: 500,
    defaultFollowUpFee: 300,
    consultationDays: "Mon,Tue,Wed,Thu,Fri,Sat",
    currency: "INR"
  };

  return {
    users,
    patients,
    appointments,
    queue,
    consultations,
    prescriptions,
    documents,
    invoices,
    auditLogs,
    settings
  };
}

class ClinicDatabase {
  private state: ClinicDatabaseState | null = null;
  private lastLoadedAt: number = 0;
  private loadPromise: Promise<ClinicDatabaseState> | null = null;
  private pendingWrites: Promise<unknown>[] = [];

  /**
   * Queue an asynchronous write operation to MongoDB Atlas.
   */
  queueMongoWrite(writeOp: (db: Db) => Promise<unknown>): Promise<unknown> {
    const p = getMongoDb()
      .then(writeOp)
      .catch(err => {
        console.error("MongoDB Atlas persistence error:", err);
      });

    this.pendingWrites.push(p);
    p.finally(() => {
      const idx = this.pendingWrites.indexOf(p);
      if (idx !== -1) this.pendingWrites.splice(idx, 1);
    });
    return p;
  }

  /**
   * Waits for all pending asynchronous writes to MongoDB Atlas to complete.
   */
  async flushPendingWrites(): Promise<void> {
    if (this.pendingWrites.length > 0) {
      await Promise.allSettled([...this.pendingWrites]);
    }
  }

  /**
   * Asynchronously loads the latest database state from MongoDB Atlas.
   * If MongoDB is empty, automatically seeds it from the clinic seed dataset.
   * Caches in memory for fast synchronous queries within requests.
   */
  async ensureLoaded(force = false): Promise<ClinicDatabaseState> {
    if (!force && this.state && (Date.now() - this.lastLoadedAt < 10000)) {
      return this.state;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = (async () => {
      try {
        const db = await getMongoDb();
        const [users, patients, appointments, queue, consultations, prescriptions, documents, invoices, auditLogs, settings] = await Promise.all([
          db.collection<User>("users").find({}, { projection: { _id: 0 } }).toArray(),
          db.collection<Patient>("patients").find({}, { projection: { _id: 0 } }).toArray(),
          db.collection<Appointment>("appointments").find({}, { projection: { _id: 0 } }).toArray(),
          db.collection<QueueEntry>("queue").find({}, { projection: { _id: 0 } }).toArray(),
          db.collection<Consultation>("consultations").find({}, { projection: { _id: 0 } }).toArray(),
          db.collection<Prescription>("prescriptions").find({}, { projection: { _id: 0 } }).toArray(),
          db.collection<PatientDocument>("documents").find({}, { projection: { _id: 0 } }).toArray(),
          db.collection<Invoice>("invoices").find({}, { projection: { _id: 0 } }).toArray(),
          db.collection<AuditLog>("audit_logs").find({}, { projection: { _id: 0 } }).sort({ timestamp: -1 }).limit(500).toArray(),
          db.collection<ClinicSetting>("settings").findOne({}, { projection: { _id: 0 } })
        ]);

        if (users && users.length > 0) {
          this.state = {
            users,
            patients,
            appointments,
            queue,
            consultations,
            prescriptions,
            documents,
            invoices,
            auditLogs,
            settings: (settings as ClinicSetting) || getInitialSeedData().settings
          };
          this.lastLoadedAt = Date.now();
          return this.state;
        }

        // If MongoDB Atlas is empty, automatically seed it
        const initial = this.loadLocalDatabase();
        await Promise.all([
          initial.users.length ? db.collection("users").insertMany(initial.users) : Promise.resolve(),
          initial.patients.length ? db.collection("patients").insertMany(initial.patients) : Promise.resolve(),
          initial.appointments.length ? db.collection("appointments").insertMany(initial.appointments) : Promise.resolve(),
          initial.queue.length ? db.collection("queue").insertMany(initial.queue) : Promise.resolve(),
          initial.consultations.length ? db.collection("consultations").insertMany(initial.consultations) : Promise.resolve(),
          initial.prescriptions.length ? db.collection("prescriptions").insertMany(initial.prescriptions) : Promise.resolve(),
          initial.documents.length ? db.collection("documents").insertMany(initial.documents) : Promise.resolve(),
          initial.invoices.length ? db.collection("invoices").insertMany(initial.invoices) : Promise.resolve(),
          initial.auditLogs.length ? db.collection("audit_logs").insertMany(initial.auditLogs) : Promise.resolve(),
          db.collection("settings").replaceOne({ id: initial.settings.id }, initial.settings, { upsert: true })
        ]);

        this.state = initial;
        this.lastLoadedAt = Date.now();
        return this.state;
      } catch (err) {
        console.warn("MongoDB Atlas load failed, falling back to local storage:", err);
        this.state = this.loadLocalDatabase();
        this.lastLoadedAt = Date.now();
        return this.state;
      } finally {
        this.loadPromise = null;
      }
    })();

    return this.loadPromise;
  }

  private loadLocalDatabase(): ClinicDatabaseState {
    const writableFile = getWritableDbFile();

    if (fs.existsSync(writableFile)) {
      try {
        const raw = fs.readFileSync(writableFile, "utf-8");
        return JSON.parse(raw);
      } catch (err) {
        console.warn("Could not read writable DB file, falling back:", err);
      }
    }

    if (fs.existsSync(BUNDLED_DB_FILE)) {
      try {
        const raw = fs.readFileSync(BUNDLED_DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        try {
          const dir = path.dirname(writableFile);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(writableFile, JSON.stringify(parsed, null, 2), "utf-8");
        } catch (writeErr) {
          console.warn("Could not mirror bundled database to writable storage:", writeErr);
        }
        return parsed;
      } catch (err) {
        console.warn("Could not read bundled DB file, falling back to seed data:", err);
      }
    }

    const initial = getInitialSeedData();
    try {
      const dir = path.dirname(writableFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(writableFile, JSON.stringify(initial, null, 2), "utf-8");
    } catch (writeErr) {
      console.warn("Could not write initial seed data to disk:", writeErr);
    }
    return initial;
  }

  private loadDatabase(): ClinicDatabaseState {
    if (this.state) return this.state;
    this.state = this.loadLocalDatabase();
    return this.state;
  }

  private saveDatabase() {
    if (!this.state) return;
    try {
      const writableFile = getWritableDbFile();
      const dir = path.dirname(writableFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(writableFile, JSON.stringify(this.state, null, 2), "utf-8");
    } catch (err) {
      console.error("Warning: Could not save database to disk (read-only environment):", err);
    }
  }

  // Users
  getUserByUsername(username: string): User | null {
    const db = this.loadDatabase();
    return db.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.isActive) || null;
  }

  getUserById(id: string): User | null {
    const db = this.loadDatabase();
    return db.users.find(u => u.id === id) || null;
  }

  listUsers(): User[] {
    const db = this.loadDatabase();
    return db.users.map(({ passwordHash, salt, ...rest }) => rest as User);
  }

  createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): User {
    const db = this.loadDatabase();
    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(newUser);
    this.saveDatabase();
    this.queueMongoWrite(mdb => mdb.collection("users").insertOne({ ...newUser }));
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const db = this.loadDatabase();
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    db.users[index] = {
      ...db.users[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveDatabase();
    this.queueMongoWrite(mdb => mdb.collection("users").updateOne({ id }, { $set: updates }));
    return db.users[index];
  }

  // Patients
  listPatients(searchTerm?: string, limit = 50): Patient[] {
    const db = this.loadDatabase();
    let results = [...db.patients];

    if (searchTerm && searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      results = results.filter(p => 
        p.fullName.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        p.contactNumber.includes(q) ||
        p.parentGuardianName.toLowerCase().includes(q)
      );
    }

    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
  }

  getPatientById(id: string): Patient | null {
    const db = this.loadDatabase();
    return db.patients.find(p => p.id === id || p.patientId === id) || null;
  }

  checkDuplicatePatient(fullName: string, contactNumber: string, dateOfBirth: string): Patient | null {
    const db = this.loadDatabase();
    const cleanPhone = contactNumber.replace(/\D/g, "");
    return db.patients.find(p => {
      const matchName = p.fullName.toLowerCase().trim() === fullName.toLowerCase().trim();
      const matchPhone = p.contactNumber.replace(/\D/g, "") === cleanPhone;
      const matchDob = p.dateOfBirth === dateOfBirth;
      return (matchName && matchPhone) || (matchName && matchDob);
    }) || null;
  }

  createPatient(data: Omit<Patient, "id" | "patientId" | "createdAt" | "updatedAt">): Patient {
    const db = this.loadDatabase();
    const count = db.patients.length + 1;
    const year = new Date().getFullYear();
    const patientId = `NLC-${year}-${String(count).padStart(4, "0")}`;

    const newPatient: Patient = {
      ...data,
      id: `pat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      patientId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.patients.push(newPatient);
    this.saveDatabase();
    this.queueMongoWrite(mdb => mdb.collection("patients").insertOne({ ...newPatient }));
    return newPatient;
  }

  updatePatient(id: string, updates: Partial<Patient>): Patient | null {
    const db = this.loadDatabase();
    const index = db.patients.findIndex(p => p.id === id || p.patientId === id);
    if (index === -1) return null;

    db.patients[index] = {
      ...db.patients[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveDatabase();
    this.queueMongoWrite(mdb => mdb.collection("patients").updateOne({ $or: [{ id }, { patientId: id }] }, { $set: updates }));
    return db.patients[index];
  }

  // Appointments
  listAppointments(date?: string, doctorId?: string, status?: AppointmentStatus | "ALL"): Appointment[] {
    const db = this.loadDatabase();
    let results = [...db.appointments];

    if (date && date !== "ALL") {
      results = results.filter(a => a.appointmentDate === date);
    }
    if (doctorId && doctorId !== "ALL") {
      results = results.filter(a => a.doctorId === doctorId);
    }
    if (status && status !== "ALL") {
      results = results.filter(a => a.status === status);
    }

    return results.sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
  }

  getAppointmentById(id: string): Appointment | null {
    const db = this.loadDatabase();
    return db.appointments.find(a => a.id === id || a.appointmentNumber === id) || null;
  }

  checkSlotConflict(doctorId: string, date: string, time: string): boolean {
    const db = this.loadDatabase();
    return db.appointments.some(a => 
      a.doctorId === doctorId && 
      a.appointmentDate === date && 
      a.appointmentTime === time && 
      a.status !== "CANCELLED"
    );
  }

  createAppointment(data: Omit<Appointment, "id" | "appointmentNumber" | "createdAt" | "updatedAt">): Appointment {
    const db = this.loadDatabase();
    const count = db.appointments.length + 1;
    const year = new Date().getFullYear();
    const appointmentNumber = `APT-${year}-${String(count).padStart(4, "0")}`;

    const newAppointment: Appointment = {
      ...data,
      id: `apt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      appointmentNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.appointments.push(newAppointment);
    this.saveDatabase();
    this.queueMongoWrite(mdb => mdb.collection("appointments").insertOne({ ...newAppointment }));
    return newAppointment;
  }

  updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
    const db = this.loadDatabase();
    const index = db.appointments.findIndex(a => a.id === id);
    if (index === -1) return null;

    db.appointments[index] = {
      ...db.appointments[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveDatabase();
    this.queueMongoWrite(mdb => mdb.collection("appointments").updateOne({ $or: [{ id }, { appointmentNumber: id }] }, { $set: updates }));
    return db.appointments[index];
  }

  // Queue Management
  getTodayQueue(doctorId?: string, dateStr?: string): (QueueEntry & { patient?: Patient; appointment?: Appointment })[] {
    const db = this.loadDatabase();
    let entries = [...db.queue];

    if (dateStr && dateStr !== "ALL") {
      entries = entries.filter(q => q.queueDate === dateStr);
    } else if (!dateStr) {
      const todayStr = new Date().toISOString().split("T")[0];
      entries = entries.filter(q => q.queueDate === todayStr);
    }

    if (doctorId && doctorId !== "ALL") {
      entries = entries.filter(q => q.doctorId === doctorId);
    }

    return entries
      .map(entry => ({
        ...entry,
        patient: db.patients.find(p => p.id === entry.patientId),
        appointment: db.appointments.find(a => a.id === entry.appointmentId)
      }))
      .sort((a, b) => a.tokenNumber - b.tokenNumber);
  }

  createQueueToken(
    patientId: string, 
    appointmentId?: string, 
    doctorId = "usr_doctor_01", 
    priority: "NORMAL" | "URGENT" | "INFANT_PRIORITY" = "NORMAL",
    customDate?: string
  ): QueueEntry {
    const db = this.loadDatabase();

    // Dynamically derive queue date from customDate, appointment date, or current date
    let queueDate = customDate;
    if (!queueDate && appointmentId) {
      const apt = db.appointments.find(a => a.id === appointmentId);
      if (apt?.appointmentDate) {
        queueDate = apt.appointmentDate;
      }
    }
    if (!queueDate) {
      queueDate = new Date().toISOString().split("T")[0];
    }

    const dateTokens = db.queue.filter(q => q.queueDate === queueDate);
    const nextNum = dateTokens.length + 1;
    const tokenCode = `T-${String(nextNum).padStart(2, "0")}`;

    const newEntry: QueueEntry = {
      id: `que_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tokenCode,
      tokenNumber: nextNum,
      patientId,
      appointmentId,
      doctorId,
      queueStatus: "WAITING",
      queueDate,
      checkInTime: new Date().toISOString(),
      priorityLevel: priority,
      clinicId: "NLC-BHUBANESWAR",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.queue.push(newEntry);

    // If appointment exists, update status to WAITING and assign token info
    if (appointmentId) {
      const aptIndex = db.appointments.findIndex(a => a.id === appointmentId);
      if (aptIndex !== -1) {
        db.appointments[aptIndex].status = "WAITING";
        db.appointments[aptIndex].tokenNumber = nextNum;
        db.appointments[aptIndex].tokenCode = tokenCode;
        db.appointments[aptIndex].updatedAt = new Date().toISOString();
      }
    }

    this.saveDatabase();
    this.queueMongoWrite(async mdb => {
      await mdb.collection("queue").insertOne({ ...newEntry });
      if (appointmentId) {
        await mdb.collection("appointments").updateOne(
          { id: appointmentId },
          { $set: { status: "WAITING", tokenNumber: nextNum, tokenCode, updatedAt: new Date().toISOString() } }
        );
      }
    });
    return newEntry;
  }

  updateQueueStatus(id: string, status: QueueStatus): QueueEntry | null {
    const db = this.loadDatabase();
    const index = db.queue.findIndex(q => q.id === id);
    if (index === -1) return null;

    const entry = db.queue[index];
    entry.queueStatus = status;
    entry.updatedAt = new Date().toISOString();

    if (status === "IN_CONSULTATION") {
      entry.consultationStartTime = new Date().toISOString();
      if (entry.appointmentId) {
        const apt = db.appointments.find(a => a.id === entry.appointmentId);
        if (apt) apt.status = "IN_CONSULTATION";
      }
    } else if (status === "COMPLETED") {
      entry.consultationEndTime = new Date().toISOString();
      if (entry.appointmentId) {
        const apt = db.appointments.find(a => a.id === entry.appointmentId);
        if (apt) apt.status = "COMPLETED";
      }
    }

    this.saveDatabase();
    this.queueMongoWrite(async mdb => {
      await mdb.collection("queue").updateOne(
        { id },
        { 
          $set: { 
            queueStatus: status, 
            updatedAt: entry.updatedAt,
            ...(entry.consultationStartTime ? { consultationStartTime: entry.consultationStartTime } : {}),
            ...(entry.consultationEndTime ? { consultationEndTime: entry.consultationEndTime } : {})
          } 
        }
      );
      if (entry.appointmentId) {
        await mdb.collection("appointments").updateOne(
          { id: entry.appointmentId },
          { $set: { status: status === "IN_CONSULTATION" ? "IN_CONSULTATION" : status === "COMPLETED" ? "COMPLETED" : undefined } }
        );
      }
    });
    return entry;
  }

  // Consultations & EMR
  listConsultations(patientId?: string, doctorId?: string): Consultation[] {
    const db = this.loadDatabase();
    let results = [...db.consultations];
    if (patientId) {
      results = results.filter(c => c.patientId === patientId);
    }
    if (doctorId) {
      results = results.filter(c => c.doctorId === doctorId);
    }
    return results.sort((a, b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime());
  }

  getConsultationById(id: string): Consultation | null {
    const db = this.loadDatabase();
    return db.consultations.find(c => c.id === id || c.consultationNumber === id) || null;
  }

  createConsultation(data: Omit<Consultation, "id" | "consultationNumber" | "createdAt" | "updatedAt">): Consultation {
    const db = this.loadDatabase();
    const count = db.consultations.length + 1;
    const year = new Date().getFullYear();
    const consultationNumber = `CNS-${year}-${String(count).padStart(4, "0")}`;

    const newConsultation: Consultation = {
      ...data,
      id: `cns_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      consultationNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.consultations.push(newConsultation);

    // If linked appointment, mark appointment completed
    if (data.appointmentId) {
      const apt = db.appointments.find(a => a.id === data.appointmentId);
      if (apt) apt.status = "COMPLETED";
    }

    this.saveDatabase();
    this.queueMongoWrite(async mdb => {
      await mdb.collection("consultations").insertOne({ ...newConsultation });
      if (data.appointmentId) {
        await mdb.collection("appointments").updateOne(
          { id: data.appointmentId },
          { $set: { status: "COMPLETED" } }
        );
      }
    });
    return newConsultation;
  }

  updateConsultation(id: string, updates: Partial<Consultation>): Consultation | null {
    const db = this.loadDatabase();
    const index = db.consultations.findIndex(c => c.id === id);
    if (index === -1) return null;

    db.consultations[index] = {
      ...db.consultations[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveDatabase();
    this.queueMongoWrite(mdb => mdb.collection("consultations").updateOne({ id }, { $set: updates }));
    return db.consultations[index];
  }

  // Prescriptions
  listPrescriptions(patientId?: string, doctorId?: string): Prescription[] {
    const db = this.loadDatabase();
    let results = [...db.prescriptions];
    if (patientId) {
      results = results.filter(p => p.patientId === patientId);
    }
    if (doctorId) {
      results = results.filter(p => p.doctorId === doctorId);
    }
    return results.sort((a, b) => new Date(b.prescriptionDate).getTime() - new Date(a.prescriptionDate).getTime());
  }

  getPrescriptionById(id: string): Prescription | null {
    const db = this.loadDatabase();
    return db.prescriptions.find(p => p.id === id || p.prescriptionNumber === id) || null;
  }

  createPrescription(data: Omit<Prescription, "id" | "prescriptionNumber" | "createdAt" | "updatedAt">): Prescription {
    const db = this.loadDatabase();
    const count = db.prescriptions.length + 1;
    const year = new Date().getFullYear();
    const prescriptionNumber = `RX-${year}-${String(count).padStart(4, "0")}`;

    const newPrescription: Prescription = {
      ...data,
      id: `rx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      prescriptionNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.prescriptions.push(newPrescription);
    this.saveDatabase();
    this.queueMongoWrite(mdb => mdb.collection("prescriptions").insertOne({ ...newPrescription }));
    return newPrescription;
  }

  // Documents
  listPatientDocuments(patientId: string): PatientDocument[] {
    const db = this.loadDatabase();
    return db.documents
      .filter(d => d.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createPatientDocument(data: Omit<PatientDocument, "id" | "createdAt">): PatientDocument {
    const db = this.loadDatabase();
    const newDoc: PatientDocument = {
      ...data,
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    db.documents.push(newDoc);
    this.saveDatabase();
    this.queueMongoWrite(mdb => mdb.collection("documents").insertOne({ ...newDoc }));
    return newDoc;
  }

  // Invoices & Billing
  listInvoices(patientId?: string, status?: PaymentStatus): Invoice[] {
    const db = this.loadDatabase();
    let results = [...db.invoices];
    if (patientId) {
      results = results.filter(i => i.patientId === patientId);
    }
    if (status) {
      results = results.filter(i => i.paymentStatus === status);
    }
    return results.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
  }

  getInvoiceById(id: string): Invoice | null {
    const db = this.loadDatabase();
    return db.invoices.find(i => i.id === id || i.invoiceNumber === id) || null;
  }

  createInvoice(data: Omit<Invoice, "id" | "invoiceNumber" | "createdAt" | "updatedAt">): Invoice {
    const db = this.loadDatabase();
    const count = db.invoices.length + 1;
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${String(count).padStart(4, "0")}`;

    const newInvoice: Invoice = {
      ...data,
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      invoiceNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.invoices.push(newInvoice);
    this.saveDatabase();
    this.queueMongoWrite(mdb => mdb.collection("invoices").insertOne({ ...newInvoice }));
    return newInvoice;
  }

  recordPayment(invoiceId: string, paymentAmount: number, method: PaymentMethod, reference?: string): Invoice | null {
    const db = this.loadDatabase();
    const index = db.invoices.findIndex(i => i.id === invoiceId);
    if (index === -1) return null;

    const inv = db.invoices[index];
    inv.paidAmount += paymentAmount;
    inv.balanceAmount = Math.max(0, inv.totalAmount - inv.paidAmount);
    inv.paymentMethod = method;
    if (reference) inv.transactionReference = reference;

    if (inv.balanceAmount === 0) {
      inv.paymentStatus = "PAID";
    } else if (inv.paidAmount > 0) {
      inv.paymentStatus = "PARTIALLY_PAID";
    }

    inv.updatedAt = new Date().toISOString();
    this.saveDatabase();
    this.queueMongoWrite(mdb => mdb.collection("invoices").updateOne(
      { id: invoiceId },
      { 
        $set: { 
          paidAmount: inv.paidAmount, 
          balanceAmount: inv.balanceAmount, 
          paymentStatus: inv.paymentStatus, 
          paymentMethod: inv.paymentMethod, 
          ...(inv.transactionReference ? { transactionReference: inv.transactionReference } : {}), 
          updatedAt: inv.updatedAt 
        } 
      }
    ));
    return inv;
  }

  getFinancialReports() {
    const db = this.loadDatabase();
    const todayStr = new Date().toISOString().split("T")[0];
    const thisMonthPrefix = todayStr.substring(0, 7); // YYYY-MM

    const todayInvoices = db.invoices.filter(i => i.invoiceDate === todayStr);
    const todayCollections = todayInvoices.reduce((sum, i) => sum + i.paidAmount, 0);

    const monthInvoices = db.invoices.filter(i => i.invoiceDate.startsWith(thisMonthPrefix));
    const monthCollections = monthInvoices.reduce((sum, i) => sum + i.paidAmount, 0);

    const totalOutstanding = db.invoices.reduce((sum, i) => sum + i.balanceAmount, 0);

    // Method breakdown
    const methodCounts: Record<string, number> = {};
    db.invoices.forEach(i => {
      const m = i.paymentMethod || "UNPAID";
      methodCounts[m] = (methodCounts[m] || 0) + i.paidAmount;
    });

    // Service breakdown
    const serviceCounts: Record<string, { count: number; revenue: number }> = {};
    db.invoices.forEach(i => {
      i.items.forEach(item => {
        if (!serviceCounts[item.serviceName]) {
          serviceCounts[item.serviceName] = { count: 0, revenue: 0 };
        }
        serviceCounts[item.serviceName].count += item.quantity;
        serviceCounts[item.serviceName].revenue += item.totalPrice;
      });
    });

    return {
      todayCollections,
      monthCollections,
      totalOutstanding,
      totalInvoicesCount: db.invoices.length,
      methodCounts,
      serviceCounts
    };
  }

  // Audit Logs
  logAudit(
    action: AuditLog["action"],
    entityType: AuditLog["entityType"],
    details: string,
    userId?: string,
    userRole?: string,
    userName?: string,
    entityId?: string,
    ipAddress?: string
  ): AuditLog {
    const db = this.loadDatabase();
    const log: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action,
      entityType,
      details,
      userId,
      userRole,
      userName,
      entityId,
      ipAddress: ipAddress || "127.0.0.1",
      clinicId: "NLC-BHUBANESWAR",
      timestamp: new Date().toISOString()
    };
    db.auditLogs.unshift(log);
    if (db.auditLogs.length > 200) {
      db.auditLogs.length = 200; // retain latest 200 logs
    }
    this.saveDatabase();
    this.queueMongoWrite(mdb => mdb.collection("audit_logs").insertOne({ ...log }));
    return log;
  }

  listAuditLogs(limit = 100): AuditLog[] {
    const db = this.loadDatabase();
    return db.auditLogs.slice(0, limit);
  }

  // Settings
  getClinicSettings(): ClinicSetting {
    const db = this.loadDatabase();
    return db.settings;
  }

  updateClinicSettings(updates: Partial<ClinicSetting>): ClinicSetting {
    const db = this.loadDatabase();
    db.settings = {
      ...db.settings,
      ...updates
    };
    this.saveDatabase();
    this.queueMongoWrite(mdb => mdb.collection("settings").replaceOne(
      { id: db.settings.id },
      db.settings,
      { upsert: true }
    ));
    return db.settings;
  }
}

export const clinicDb = new ClinicDatabase();
