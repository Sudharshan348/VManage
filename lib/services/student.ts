import { StudentRepository } from "@/lib/repositories/student";
import { StudentSignupPayload } from "@/lib/validation/student";
import { User } from "@/lib/models/user.model"; 
import { ApiError } from "@/lib/util/apierror";

export class StudentService {
  static async createStudentProfile(data: StudentSignupPayload) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new ApiError(409, "A user with this email already exists");
    }
    const existingRollNo = await StudentRepository.findByRollNo(data.rollNo);
    if (existingRollNo) {
      throw new ApiError(409, "A student with this roll number already exists");
    }
    const newUser = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: "student",
    });
    const newProfile = await StudentRepository.createProfile({
      userId: newUser._id as any,
      rollNo: data.rollNo,
      phone: data.phone,
      course: data.course,
      year: data.year,
      parentPhone: data.parentPhone,
      address: data.address,
    });
    newUser.studentId = newProfile._id as any;
    await newUser.save();

    return newProfile;
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
}