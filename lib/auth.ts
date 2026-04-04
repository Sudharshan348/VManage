import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

import connectDb from "@/lib/db/mongoose";
import { Student } from "@/lib/models/student.model";
import { User, type IUser } from "@/lib/models/user.model";

type SessionPayload = {
  _id: string;
  role: "admin" | "warden" | "student";
};

export const AUTH_COOKIE_NAME = "auth-token";
export const STUDENT_AUTH_COOKIE_NAME = "student-auth-token";
export const ADMIN_AUTH_COOKIE_NAME = "admin-auth-token";

function verifySessionToken(token?: string): SessionPayload | null {
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET || "hackathon_secret_key"
    ) as SessionPayload;
  } catch {
    return null;
  }
}

function getCookieNamesForPortal(portal?: "student" | "admin") {
  if (portal === "student") {
    return [STUDENT_AUTH_COOKIE_NAME, AUTH_COOKIE_NAME];
  }

  if (portal === "admin") {
    return [ADMIN_AUTH_COOKIE_NAME, AUTH_COOKIE_NAME];
  }

  return [AUTH_COOKIE_NAME, ADMIN_AUTH_COOKIE_NAME, STUDENT_AUTH_COOKIE_NAME];
}

export function getAuthCookieNameForRole(role: SessionPayload["role"]) {
  return role === "student" ? STUDENT_AUTH_COOKIE_NAME : ADMIN_AUTH_COOKIE_NAME;
}

export async function getSessionPayload(
  portal?: "student" | "admin"
): Promise<SessionPayload | null> {
  const cookieStore = await cookies();

  for (const cookieName of getCookieNamesForPortal(portal)) {
    const session = verifySessionToken(cookieStore.get(cookieName)?.value);
    if (session) {
      return session;
    }
  }

  return null;
}

export async function getCurrentUser(portal?: "student" | "admin") {
  const session = await getSessionPayload(portal);
  if (!session) {
    return null;
  }

  await connectDb();

  const user = (await User.findById(session._id)
    .select("-password")
    .lean()) as (Omit<IUser, "password"> & { _id: { toString(): string } }) | null;

  return user;
}

export async function getCurrentStudentProfile(portal: "student" = "student") {
  const user = await getCurrentUser(portal);
  if (!user) {
    return null;
  }

  let student = null;

  if (user.studentId) {
    student = await Student.findById(user.studentId).lean();
  }

  if (!student && user._id) {
    student = await Student.findOne({ userId: user._id }).lean();
  }

  return {
    user,
    student,
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
