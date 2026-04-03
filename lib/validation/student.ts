import { z } from "zod";

export const createStudentSchema = z.object({
  name: z.string().min(1),
  rollNo: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  course: z.string().min(1),
  year: z.number().min(1).max(5),
  parentPhone: z.string().optional(),
  address: z.string().optional(),
  profilePhoto: z.string().url().optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;