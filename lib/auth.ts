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

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

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

export async function getCurrentUser() {
  const session = await getSessionPayload();
  if (!session) {
    return null;
  }

  await connectDb();

  const user = (await User.findById(session._id)
    .select("-password")
    .lean()) as (Omit<IUser, "password"> & { _id: { toString(): string } }) | null;

  return user;
}

export async function getCurrentStudentProfile() {
  const user = await getCurrentUser();
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
