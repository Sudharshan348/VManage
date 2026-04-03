import { StudentRepository } from "@/lib/repositories/student";
import { CreateStudentInput } from "@/lib/validation/student";
import { ApiError } from "@/lib/util/apierror";

export class StudentService {
  static async createStudentProfile(data: CreateStudentInput) {
    const existingRollNo = await StudentRepository.findByRollNo(data.rollNo);
    if (existingRollNo) {
      throw new ApiError(409, "A student with this roll number already exists");
    }

    const existingEmail = await StudentRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new ApiError(409, "A student with this email already exists");
    }

    const newProfile = await StudentRepository.createProfile(data);

    await StudentRepository.linkToUserAccount(data.email, newProfile._id);

    return newProfile;
  }

  static async getAllStudents() {
    return StudentRepository.findAll();
  }

  static async getStudentProfile(identifier: string) {
    const profile = identifier.includes("@") 
      ? await StudentRepository.findByEmail(identifier)
      : await StudentRepository.findByRollNo(identifier);

    if (!profile) {
      throw new ApiError(404, "Student profile not found");
    }
    
    return profile;
  }
}