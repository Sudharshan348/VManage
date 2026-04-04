import { asyncHandler } from "@/lib/util/apihandler";
import { ApiResponse } from "@/lib/util/apiresponse";
import { ApiError } from "@/lib/util/apierror";
import connectDb from "@/lib/db/mongoose";
import { RoommateProfile } from "@/lib/models/rommateprofile.model";
import { Student } from "@/lib/models/student.model";
import { StudentService } from "@/lib/services/student";
import { getSessionPayload } from "@/lib/auth";

type MatchStudentSummary = {
  studentId: string;
  name: string;
  rollNo: string;
  course: string;
  year: number;
};

type MatchResult = {
  student_id: string;
  compatibilityScore: number | null;
  details: Record<string, unknown>;
  student: MatchStudentSummary;
};

type PopulatedStudentDoc = {
  _id: { toString(): string };
  rollNo: string;
  course: string;
  year: number;
  userId?: {
    name?: string | null;
  } | null;
};

type MatchPayload = {
  status?: unknown;
  matches?: unknown;
  compatibility?: unknown;
  compatibility_scores?: unknown;
  compatibilityScores?: unknown;
  scores?: unknown;
};

type MatchRecord = {
  student_id?: unknown;
  studentId?: unknown;
  id?: unknown;
  compatibilityScore?: unknown;
  compatibility_score?: unknown;
  score?: unknown;
} & Record<string, unknown>;

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getStudentSummary(studentDoc: PopulatedStudentDoc): MatchStudentSummary {
  return {
    studentId: studentDoc._id.toString(),
    name: studentDoc.userId?.name || studentDoc.rollNo,
    rollNo: studentDoc.rollNo,
    course: studentDoc.course,
    year: studentDoc.year,
  };
}

function getStudentNames(studentDoc: PopulatedStudentDoc) {
  const fullName = String(studentDoc.userId?.name || "").trim();

  if (!fullName) {
    return {
      firstName: "Student",
      lastName: studentDoc.rollNo,
    };
  }

  const [firstName, ...rest] = fullName.split(/\s+/);

  return {
    firstName,
    lastName: rest.join(" ") || studentDoc.rollNo,
  };
}

function normalizeMatches(
  matchData: MatchPayload,
  studentLookup: Map<string, MatchStudentSummary>
): MatchResult[] {
  const rawMatches = Array.isArray(matchData.matches) ? matchData.matches : [];

  if (rawMatches.length > 0) {
    return rawMatches
      .map((entry) => {
        const match =
          entry && typeof entry === "object" && !Array.isArray(entry)
            ? (entry as MatchRecord)
            : null;

        if (!match) {
          return null;
        }

        const studentId = String(
          match?.student_id ?? match?.studentId ?? match?.id ?? ""
        );

        if (!studentId || !studentLookup.has(studentId)) {
          return null;
        }

        const details =
          match && typeof match === "object" && !Array.isArray(match) ? match : {};

        return {
          student_id: studentId,
          compatibilityScore:
            toNumber(match?.compatibilityScore) ??
            toNumber(match?.compatibility_score) ??
            toNumber(match?.score),
          details,
          student: studentLookup.get(studentId)!,
        };
      })
      .filter((match): match is MatchResult => Boolean(match));
  }

  const rawCompatibility =
    matchData?.compatibility ??
    matchData?.compatibility_scores ??
    matchData?.compatibilityScores ??
    matchData?.scores;

  if (!rawCompatibility || typeof rawCompatibility !== "object" || Array.isArray(rawCompatibility)) {
    return [];
  }

  return Object.entries(rawCompatibility)
    .map(([studentId, value]) => {
      const student = studentLookup.get(studentId);

      if (!student) {
        return null;
      }

      const valueRecord =
        value && typeof value === "object" && !Array.isArray(value)
          ? (value as MatchRecord)
          : null;

      const isObject = value && typeof value === "object" && !Array.isArray(value);
      const details = isObject ? (value as Record<string, unknown>) : { value };

      return {
        student_id: studentId,
        compatibilityScore:
          toNumber(value) ??
          toNumber(valueRecord?.compatibilityScore) ??
          toNumber(valueRecord?.compatibility_score) ??
          toNumber(valueRecord?.score),
        details,
        student,
      };
    })
    .filter((match): match is MatchResult => Boolean(match))
    .sort((a, b) => (b.compatibilityScore ?? -Infinity) - (a.compatibilityScore ?? -Infinity));
}

function getMlApiUrl() {
  const value = process.env.PYTHON_ML_API1_URL?.trim();

  if (!value) {
    throw new ApiError(500, "Roommate ML API URL is not configured");
  }

  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    throw new ApiError(500, "Roommate ML API URL is invalid");
  }
}

export const POST = asyncHandler(async (req: Request) => {
  const session = await getSessionPayload("admin");
  if (!session) {
    throw new ApiError(401, "Unauthorized request");
  }
  if (session.role !== "admin") {
    throw new ApiError(403, "Forbidden: Admin access required");
  }

  await connectDb();
  const body = await req.json();
  const { studentId } = body;

  if (!studentId) {
    throw new ApiError(400, "Student ID is required");
  }

  const ensuredTargetProfile = await StudentService.ensureRoommateProfile(studentId);

  const otherStudents = await Student.find({ _id: { $ne: studentId } }).select("_id");
  await Promise.all(
    otherStudents.map((student) => StudentService.ensureRoommateProfile(student._id))
  );

  const targetProfile = await RoommateProfile.findById(ensuredTargetProfile._id).populate({
    path: "studentId",
    populate: { path: "userId" }
  });

  if (!targetProfile) {
    throw new ApiError(404, "Roommate profile not found for this student");
  }

  const targetStudentDoc = targetProfile.studentId as unknown as PopulatedStudentDoc;
  const targetNames = getStudentNames(targetStudentDoc);
  const rawPoolProfiles = await RoommateProfile.find({
    studentId: { $ne: targetProfile.studentId },
  }).populate({
    path: "studentId",
    populate: { path: "userId" }
  });

  const poolProfiles = rawPoolProfiles.filter((profile) => {
    return (
      profile.bedPreference === targetProfile.bedPreference &&
      profile.acPreference === targetProfile.acPreference
    );
  });

  const studentLookup = new Map<string, MatchStudentSummary>();
  for (const profile of poolProfiles) {
    const studentDoc = profile.studentId as unknown as PopulatedStudentDoc;
    studentLookup.set(studentDoc._id.toString(), getStudentSummary(studentDoc));
  }

  const targetStudentPayload = {
    student_id: targetStudentDoc._id.toString(),
    first_name: targetNames.firstName,
    last_name: targetNames.lastName,
    sleep_schedule: targetProfile.sleepSchedule,
    cleanliness: targetProfile.cleanliness,
    social_battery: targetProfile.socialBattery,
    study_env: targetProfile.studyEnv,
  };

  const studentPoolPayload = poolProfiles.map((profile) => {
    const studentDoc = profile.studentId as unknown as PopulatedStudentDoc;
    const names = getStudentNames(studentDoc);
    return {
      student_id: studentDoc._id.toString(),
      first_name: names.firstName,
      last_name: names.lastName,
      sleep_schedule: profile.sleepSchedule,
      cleanliness: profile.cleanliness,
      social_battery: profile.socialBattery,
      study_env: profile.studyEnv,
    };
  });

  const pythonApiUrl = getMlApiUrl();
  let response: Response;

  try {
    response = await fetch(`${pythonApiUrl}/calculate-roommates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_student: targetStudentPayload,
        student_pool: studentPoolPayload,
      }),
    });
  } catch {
    throw new ApiError(
      503,
      "Roommate ML service is unreachable. Update PYTHON_ML_API1_URL or restart the ML tunnel."
    );
  }

  if (!response.ok) {
    throw new ApiError(502, "Roommate ML service returned an invalid response");
  }

  const matchData = (await response.json()) as MatchPayload;
  const matches = normalizeMatches(matchData, studentLookup);
  const statusMessage =
    typeof matchData?.status === "string" && matchData.status.trim().length > 0
      ? matchData.status
      : "Roommates matched successfully";

  return Response.json(
    new ApiResponse(
      200,
      {
        status: statusMessage,
        targetStudent: getStudentSummary(targetStudentDoc),
        matches,
      },
      statusMessage
    ),
    { status: 200 }
  );
});
