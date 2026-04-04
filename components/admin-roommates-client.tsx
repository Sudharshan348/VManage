"use client";

import { useEffect, useState } from "react";

import { AccentButton, Field, Select } from "@/components/v1-portal";

type StudentOption = {
  _id: string;
  rollNo: string;
  course: string;
  year: number;
  phone: string;
  status: string;
};

type MatchStudentSummary = {
  studentId: string;
  name: string;
  rollNo: string;
  course: string;
  year: number;
};

type RoommateMatch = {
  student_id: string;
  compatibilityScore: number | null;
  details: Record<string, unknown>;
  student: MatchStudentSummary;
};

type RoommateMatcherResponse = {
  status: string;
  targetStudent: MatchStudentSummary;
  matches: RoommateMatch[];
};

type ApiEnvelope<T> = {
  data?: T;
  message?: string;
};

export function AdminRoommatesClient() {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [studentId, setStudentId] = useState("");
  const [targetStudent, setTargetStudent] = useState<MatchStudentSummary | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [matches, setMatches] = useState<RoommateMatch[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadStudents() {
      try {
        const response = await fetch("/api/v1/students", { cache: "no-store" });
        const result = (await response.json()) as ApiEnvelope<StudentOption[]>;

        if (!active) return;

        if (!response.ok || !Array.isArray(result.data)) {
          setError(result.message || "Unable to load students");
          return;
        }

        setStudents(result.data);
        setStudentId(result.data[0]?._id || "");
      } catch {
        if (active) {
          setError("Unable to load students");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadStudents();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setStatusMessage("");
    setTargetStudent(null);
    setMatches([]);

    try {
      const response = await fetch("/api/v1/roommates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentId }),
      });

      const result = (await response.json()) as ApiEnvelope<RoommateMatcherResponse>;

      if (!response.ok) {
        setError(result.message || "Unable to calculate roommate matches");
        return;
      }

      setStatusMessage(result.data?.status || result.message || "");
      setTargetStudent(result.data?.targetStudent || null);
      setMatches(Array.isArray(result.data?.matches) ? result.data.matches : []);
    } catch {
      setError("Unable to calculate roommate matches");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedStudent = students.find((student) => student._id === studentId);

  return (
    <div className="space-y-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Student">
          <Select value={studentId} onChange={(event) => setStudentId(event.target.value)} required>
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.rollNo} • {student.course} • Year {student.year}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex justify-end">
          <AccentButton accent="red" disabled={submitting || !studentId}>
            {submitting ? "Matching..." : "Find roommates"}
          </AccentButton>
        </div>
      </form>

      {selectedStudent ? (
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
          Running compatibility for <span className="font-semibold text-slate-900">{selectedStudent.rollNo}</span>
          {" "}
          in {selectedStudent.course}, Year {selectedStudent.year}.
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500">
          Loading students...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {statusMessage && !error ? (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          {statusMessage}
        </div>
      ) : null}

      {!loading && matches.length === 0 && !error && !statusMessage ? (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
          Select a student and run the matcher to view compatible roommates.
        </div>
      ) : null}

      {!loading && targetStudent && matches.length === 0 && !error ? (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
          No compatible roommates were returned for {targetStudent.rollNo}.
        </div>
      ) : null}

      {matches.length > 0 ? (
        <div className="space-y-4">
          {targetStudent ? (
            <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
                Selected student
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {targetStudent.name} ({targetStudent.rollNo})
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {targetStudent.course} • Year {targetStudent.year}
              </p>
            </div>
          ) : null}

          {matches.map((match, index) => (
            <article
              key={`${match.student_id}-${index}`}
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Match {index + 1}: {match.student.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {match.student.rollNo} • {match.student.course} • Year {match.student.year}
                  </p>
                </div>
                <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  Score: {match.compatibilityScore !== null ? match.compatibilityScore : "N/A"}
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {Object.entries(match.details).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
                      {key.replace(/_/g, " ")}
                    </p>
                    <p className="mt-1 text-sm text-slate-900">
                      {typeof value === "object" ? JSON.stringify(value) : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
