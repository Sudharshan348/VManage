import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

export type UserRole = "admin" | "warden" | "student";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  studentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["admin", "warden", "student"],
      default: "student",
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function () {
  if (!this.isModified("password")) {
    return;
  }

  if (typeof this.password === "string" && this.password.includes(":")) {
    return;
  }

  const salt = randomBytes(16).toString("hex");
  const hashedPassword = scryptSync(this.password, salt, 64).toString("hex");
  this.password = `${salt}:${hashedPassword}`;
});

userSchema.methods.comparePassword = async function (candidate: string) {
  if (!this.password || typeof this.password !== "string") {
    return false;
  }

  if (this.password.includes(":")) {
    const [salt, storedHash] = this.password.split(":");

    if (!salt || !storedHash) {
      return false;
    }

    const candidateHash = scryptSync(candidate, salt, 64).toString("hex");
    const storedBuffer = Buffer.from(storedHash, "hex");
    const candidateBuffer = Buffer.from(candidateHash, "hex");

    if (storedBuffer.length !== candidateBuffer.length) {
      return false;
    }

    return timingSafeEqual(storedBuffer, candidateBuffer);
  }

  if (this.password.startsWith("$2")) {
    return bcrypt.compare(candidate, this.password);
  }

  return false;
};

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", userSchema);
