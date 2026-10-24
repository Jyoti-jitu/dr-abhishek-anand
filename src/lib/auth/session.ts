import { cookies } from "next/headers";
import { clinicDb } from "../db/database";
import { User, UserRole } from "../db/types";
import { signSessionToken, verifySessionToken, SessionPayload } from "./crypto";

const SESSION_COOKIE_NAME = "nlc_session";
const SESSION_DURATION_HOURS = 8;

export async function createSession(user: User): Promise<string> {
  const cookieStore = await cookies();
  const exp = Math.floor(Date.now() / 1000) + SESSION_DURATION_HOURS * 3600;

  const payload: SessionPayload = {
    userId: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    clinicId: user.clinicId,
    exp
  };

  const token = signSessionToken(payload);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_HOURS * 3600
  });

  return token;
}

export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifySessionToken(token);
    if (!payload) return null;

    const user = clinicDb.getUserById(payload.userId);
    if (!user || !user.isActive) return null;

    return user;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}

export async function requireUserWithRole(allowedRoles: UserRole[]): Promise<{ user: User } | { error: string; status: number }> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: "Unauthorized. Please log in to your clinic account.", status: 401 };
  }

  // Two-Role Consolidated RBAC Architecture:
  // Role 1: DOCTOR / ADMIN ("Doctor & Admin")
  // Full clinic authority: Clinical EMR, consultations, prescriptions, live queue, billing, clinic settings, audit logs.
  // Role 2: RECEPTIONIST / BILLING ("Reception & Billing")
  // Front-desk and financial operations: Patient registration, appointments, queue ticketing, invoices, receipts.
  const isDoctorAdmin = user.role === "DOCTOR" || user.role === "ADMIN";
  const isReceptionBilling = user.role === "RECEPTIONIST" || user.role === "BILLING";

  // Doctor & Admin has universal authority across all endpoints
  if (isDoctorAdmin) {
    return { user };
  }

  // Reception & Billing is authorized when the endpoint permits RECEPTIONIST or BILLING
  const allowsReceptionBilling = allowedRoles.some(r => r === "RECEPTIONIST" || r === "BILLING");
  if (isReceptionBilling && allowsReceptionBilling) {
    return { user };
  }

  const roleLabel = isReceptionBilling ? "Reception & Billing" : user.role;
  return { 
    error: `Access Denied. Your role (${roleLabel}) is not authorised for this action.`, 
    status: 403 
  };
}
