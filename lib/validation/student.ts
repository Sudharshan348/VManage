export type StudentSignupInput = {
  name: string;
  rollNo: string;
  email: string;
  phone: string;
  course: string;
  year: number;
  parentPhone?: string;
  address?: string;
  password: string;
  confirmPassword: string;
};

export type StudentSignupPayload = Omit<StudentSignupInput, "confirmPassword">;

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; fieldErrors: Record<string, string> };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+\-\s()]{10,20}$/;
const rollPattern = /^[A-Za-z0-9/_-]{4,20}$/;

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateStudentSignup(
  input: unknown
): ValidationResult<StudentSignupPayload> {
  const body = (input ?? {}) as Record<string, unknown>;
  const fieldErrors: Record<string, string> = {};

  const name = normalizeText(body.name);
  const rollNo = normalizeText(body.rollNo).toUpperCase();
  const email = normalizeText(body.email).toLowerCase();
  const phone = normalizeText(body.phone);
  const course = normalizeText(body.course);
  const year = Number(body.year);
  const parentPhone = normalizeText(body.parentPhone);
  const address = normalizeText(body.address);
  const password = normalizeText(body.password);
  const confirmPassword = normalizeText(body.confirmPassword);

  if (name.length < 2) fieldErrors.name = "Name must be at least 2 characters";
  if (!rollPattern.test(rollNo)) fieldErrors.rollNo = "Enter a valid roll number";
  if (!emailPattern.test(email)) fieldErrors.email = "Enter a valid email address";
  if (!phonePattern.test(phone)) fieldErrors.phone = "Enter a valid phone number";
  if (course.length < 2) fieldErrors.course = "Course is required";
  if (!Number.isInteger(year) || year < 1 || year > 5) {
    fieldErrors.year = "Year must be between 1 and 5";
  }
  if (parentPhone && !phonePattern.test(parentPhone)) {
    fieldErrors.parentPhone = "Enter a valid parent phone number";
  }
  if (password.length < 6) {
    fieldErrors.password = "Password must be at least 6 characters";
  }
  if (password !== confirmPassword) {
    fieldErrors.confirmPassword = "Passwords do not match";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      message: "Please correct the highlighted fields",
      fieldErrors,
    };
  }

  return {
    success: true,
    data: {
      name,
      rollNo,
      email,
      phone,
      course,
      year,
      ...(parentPhone ? { parentPhone } : {}),
      ...(address ? { address } : {}),
      password,
    },
  };
}

export function validateLoginInput(input: unknown): ValidationResult<{
  identifier: string;
  password: string;
}> {
  const body = (input ?? {}) as Record<string, unknown>;
  const fieldErrors: Record<string, string> = {};

  const identifier = normalizeText(body.identifier || body.email).toLowerCase();
  const password = normalizeText(body.password);

  if (!identifier) fieldErrors.identifier = "Email or roll number is required";
  if (!password) fieldErrors.password = "Password is required";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      message: "Credentials are required",
      fieldErrors,
    };
  }

  return {
    success: true,
    data: { identifier, password },
  };
}