import { NextRequest, NextResponse } from "next/server";
import { clinicDb } from "@/lib/db/database";
import { verifyPassword } from "@/lib/auth/crypto";
import { createSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    await clinicDb.ensureLoaded(true);
    const user = clinicDb.getUserByUsername(username);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    await createSession(user);

    clinicDb.logAudit(
      "LOGIN",
      "User",
      `User ${user.fullName} (${user.role}) logged in successfully.`,
      user.id,
      user.role,
      user.fullName,
      user.id
    );
    await clinicDb.flushPendingWrites();

    const { passwordHash, salt, ...safeUser } = user;
    return NextResponse.json({
      success: true,
      user: safeUser,
      message: `Welcome, ${user.fullName}`
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || "Authentication failed." },
      { status: 500 }
    );
  }
}
