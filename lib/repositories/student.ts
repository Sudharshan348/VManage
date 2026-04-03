import { Student, IStudent } from "@/lib/models/student.model";
import mongoose from "mongoose";

export class StudentRepository {
  static async findByRollNo(rollNo: string): Promise<IStudent | null> {
    return Student.findOne({ rollNo }).populate("roomId");
  }

  static async findByEmail(email: string): Promise<IStudent | null> {
    return Student.findOne({ email }).populate("roomId");
  }

  static async createProfile(data: {
    userId: mongoose.Types.ObjectId;
    rollNo: string;
    email: string;
    phone: string;
    course: string;
    year: number;
    parentPhone?: string;
    address?: string;
  }): Promise<IStudent> {
    return Student.create(data);
  }

  static async findAll(): Promise<IStudent[]> {
    return Student.find().sort({ createdAt: -1 });
  }

  static async findById(id: mongoose.Types.ObjectId | string): Promise<IStudent | null> {
    return Student.findById(id).populate("roomId");
  }

  static async findByUserId(userId: mongoose.Types.ObjectId | string): Promise<IStudent | null> {
    return Student.findOne({ userId }).populate("roomId");
  }
}
