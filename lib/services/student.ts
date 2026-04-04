import { StudentRepository } from "@/lib/repositories/student";
import { StudentSignupPayload } from "@/lib/validation/student";
import { User } from "@/lib/models/user.model"; 
import { RoommateProfile } from "@/lib/models/rommateprofile.model";
import { ApiError } from "@/lib/util/apierror";
import mongoose from "mongoose";

export class StudentService {
  static async ensureRoommateProfile(
    studentId: mongoose.Types.ObjectId | string,
    preferences?: Pick<
      StudentSignupPayload,
      "sleepSchedule" | "cleanliness" | "socialBattery" | "studyEnv" | "bedPreference" | "acPreference"
    >
  ) {
    const existingProfile = await RoommateProfile.findOne({ studentId });
    if (existingProfile) {
      return existingProfile;
    }

    return RoommateProfile.create({
      studentId,
      sleepSchedule: preferences?.sleepSchedule ?? 3,
      cleanliness: preferences?.cleanliness ?? 3,
      socialBattery: preferences?.socialBattery ?? 3,
      studyEnv: preferences?.studyEnv ?? 3,
      bedPreference: preferences?.bedPreference ?? "four",
      acPreference: preferences?.acPreference ?? false,
    });
  }

  static async createStudentProfile(data: StudentSignupPayload) {
    const existingRollNo = await StudentRepository.findByRollNo(data.rollNo);
    if (existingRollNo) {
      throw new ApiError(409, "A student with this roll number already exists");
    }

    const existingStudentByEmail = await StudentRepository.findByEmail(data.email);
    if (existingStudentByEmail) {
      throw new ApiError(409, "A student with this email already exists");
    }

    let user = await User.findOne({ email: data.email });
    let createdUser = false;

    if (user?.studentId) {
      throw new ApiError(409, "A user with this email already exists");
    }

    if (!user) {
      user = await User.create({
        name: data.name,
        email: data.email,
        password: data.password,
        role: "student",
      });
      createdUser = true;
    } else {
      user.name = data.name;
      user.password = data.password;
      user.role = "student";
      await user.save();
    }

    try {
      const newProfile = await StudentRepository.createProfile({
      userId: user._id as mongoose.Types.ObjectId,
      rollNo: data.rollNo,
      email: data.email,
      phone: data.phone,
      course: data.course,
      year: data.year,
      parentPhone: data.parentPhone,
      address: data.address,
      });
      user.studentId = newProfile._id as mongoose.Types.ObjectId;
      await user.save();
      await StudentService.ensureRoommateProfile(newProfile._id, {
        sleepSchedule: data.sleepSchedule,
        cleanliness: data.cleanliness,
        socialBattery: data.socialBattery,
        studyEnv: data.studyEnv,
        bedPreference: data.bedPreference,
        acPreference: data.acPreference,
      });

      return newProfile;
    } catch (error) {
      if (createdUser && !user.studentId) {
        await User.findByIdAndDelete(user._id);
      }
      throw error;
    }
  }

  static async getAllStudents() {
    return StudentRepository.findAll();
  }

  static async getStudentProfile(identifier: string) {
    if (identifier.includes("@")) {
      const user = await User.findOne({ email: identifier });
      if (!user || !user.studentId) throw new ApiError(404, "Student profile not found");
      return StudentRepository.findById(user.studentId); 
    }
    const profile = await StudentRepository.findByRollNo(identifier);
    if (!profile) {
      throw new ApiError(404, "Student profile not found");
    }
    return profile;
  }

  static async getStudentProfileByUserId(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.studentId) {
      return StudentRepository.findById(user.studentId);
    }

    const profile = await StudentRepository.findByUserId(user._id);
    if (profile) {
      return profile;
    }

    throw new ApiError(404, "Student profile not found");
  }
}
