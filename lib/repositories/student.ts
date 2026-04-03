import { Student, IStudent } from "@/lib/models/student.model";
import { User } from "@/lib/models/user.model";
import { CreateStudentInput } from "@/lib/validation/student";
import mongoose from "mongoose";

export class StudentRepository {
  static async findByRollNo(rollNo: string): Promise<IStudent | null> {
    return Student.findOne({ rollNo }).populate("roomId");
  }

  static async findByEmail(email: string): Promise<IStudent | null> {
    return Student.findOne({ email }).populate("roomId");
  }

  static async createProfile(data: CreateStudentInput): Promise<IStudent> {
    return Student.create(data);
  }

  static async linkToUserAccount(email: string, studentId: mongoose.Types.ObjectId) {
    return User.findOneAndUpdate({ email }, { studentId });
  }

  static async findAll(): Promise<IStudent[]> {
    return Student.find().sort({ createdAt: -1 });
  }
}