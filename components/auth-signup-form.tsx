"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  AccentButton,
  Field,
  FormGrid,
  Input,
  Textarea,
} from "@/components/v1-portal";
import type { StudentSignupInput } from "@/lib/validation/student";

type SignupResponse = {
  message?: string;
  errors?: Record<string, string> | Array<Record<string, string>>;
};

const initialForm: StudentSignupInput = {
  name: "",
  rollNo: "",
  email: "",
  phone: "",
  course: "",
  year: 1,
  sleepSchedule: 3,
  cleanliness: 3,
  socialBattery: 3,
  studyEnv: 3,
  bedPreference: "four",
  acPreference: false,
  parentPhone: "",
  address: "",
  password: "",
  confirmPassword: "",
};

export function AuthSignupForm() {
  const router = useRouter();
  const [form, setForm] = useState<StudentSignupInput>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof StudentSignupInput>(
    key: K,
    value: StudentSignupInput[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage("");

    try {
      const response = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = (await response.json()) as SignupResponse;

      if (!response.ok) {
        const fieldErrors = Array.isArray(result.errors)
          ? (result.errors[0] ?? {})
          : (result.errors ?? {});
        setErrors(fieldErrors);
        setMessage(result.message || "Unable to create account");
        return;
      }

      router.push("/login");
      router.refresh();
    } catch {
      setMessage("Unable to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <FormGrid>
        <Field label="Full name">
          <div className="space-y-2">
            <Input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Full name"
              required
            />
            {errors.name ? <p className="text-xs text-red-600">{errors.name}</p> : null}
          </div>
        </Field>
        <Field label="Roll number">
          <div className="space-y-2">
            <Input
              value={form.rollNo}
              onChange={(event) => updateField("rollNo", event.target.value)}
              placeholder="23CSE104"
              required
            />
            {errors.rollNo ? <p className="text-xs text-red-600">{errors.rollNo}</p> : null}
          </div>
        </Field>
        <Field label="Email">
          <div className="space-y-2">
            <Input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="student@college.edu"
              required
            />
            {errors.email ? <p className="text-xs text-red-600">{errors.email}</p> : null}
          </div>
        </Field>
        <Field label="Phone">
          <div className="space-y-2">
            <Input
              type="tel"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+91 98765 43210"
              required
            />
            {errors.phone ? <p className="text-xs text-red-600">{errors.phone}</p> : null}
          </div>
        </Field>
        <Field label="Course">
          <div className="space-y-2">
            <Input
              value={form.course}
              onChange={(event) => updateField("course", event.target.value)}
              placeholder="Computer Science"
              required
            />
            {errors.course ? <p className="text-xs text-red-600">{errors.course}</p> : null}
          </div>
        </Field>
        <Field label="Year">
          <div className="space-y-2">
            <Input
              type="number"
              min={1}
              max={5}
              value={form.year}
              onChange={(event) => updateField("year", Number(event.target.value) || 1)}
              required
            />
            {errors.year ? <p className="text-xs text-red-600">{errors.year}</p> : null}
          </div>
        </Field>
        <Field label="Sleep schedule" hint="1 early, 5 late">
          <div className="space-y-2">
            <Input
              type="number"
              min={1}
              max={5}
              value={form.sleepSchedule}
              onChange={(event) => updateField("sleepSchedule", Number(event.target.value) || 1)}
              required
            />
            {errors.sleepSchedule ? (
              <p className="text-xs text-red-600">{errors.sleepSchedule}</p>
            ) : null}
          </div>
        </Field>
        <Field label="Cleanliness" hint="1 flexible, 5 very neat">
          <div className="space-y-2">
            <Input
              type="number"
              min={1}
              max={5}
              value={form.cleanliness}
              onChange={(event) => updateField("cleanliness", Number(event.target.value) || 1)}
              required
            />
            {errors.cleanliness ? (
              <p className="text-xs text-red-600">{errors.cleanliness}</p>
            ) : null}
          </div>
        </Field>
        <Field label="Social battery" hint="1 quiet, 5 social">
          <div className="space-y-2">
            <Input
              type="number"
              min={1}
              max={5}
              value={form.socialBattery}
              onChange={(event) => updateField("socialBattery", Number(event.target.value) || 1)}
              required
            />
            {errors.socialBattery ? (
              <p className="text-xs text-red-600">{errors.socialBattery}</p>
            ) : null}
          </div>
        </Field>
        <Field label="Study environment" hint="1 silent, 5 active">
          <div className="space-y-2">
            <Input
              type="number"
              min={1}
              max={5}
              value={form.studyEnv}
              onChange={(event) => updateField("studyEnv", Number(event.target.value) || 1)}
              required
            />
            {errors.studyEnv ? (
              <p className="text-xs text-red-600">{errors.studyEnv}</p>
            ) : null}
          </div>
        </Field>
        <Field label="Room size preference">
          <div className="space-y-2">
            <select
              value={form.bedPreference}
              onChange={(event) =>
                updateField("bedPreference", event.target.value as StudentSignupInput["bedPreference"])
              }
              className="input-base"
              required
            >
              <option value="two">2 sharing</option>
              <option value="three">3 sharing</option>
              <option value="four">4 sharing</option>
              <option value="six">6 sharing</option>
            </select>
            {errors.bedPreference ? (
              <p className="text-xs text-red-600">{errors.bedPreference}</p>
            ) : null}
          </div>
        </Field>
        <Field label="AC preference">
          <div className="space-y-2">
            <select
              value={String(form.acPreference)}
              onChange={(event) => updateField("acPreference", event.target.value === "true")}
              className="input-base"
              required
            >
              <option value="false">Non-AC</option>
              <option value="true">AC</option>
            </select>
          </div>
        </Field>
        <Field label="Parent phone" hint="Optional">
          <div className="space-y-2">
            <Input
              type="tel"
              value={form.parentPhone}
              onChange={(event) => updateField("parentPhone", event.target.value)}
              placeholder="+91 91234 56789"
            />
            {errors.parentPhone ? (
              <p className="text-xs text-red-600">{errors.parentPhone}</p>
            ) : null}
          </div>
        </Field>
        <Field label="Password" hint="6+ chars">
          <div className="space-y-2">
            <Input
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="Password"
              autoComplete="new-password"
              required
            />
            {errors.password ? <p className="text-xs text-red-600">{errors.password}</p> : null}
          </div>
        </Field>
        <Field label="Address" fullWidth>
          <Textarea
            value={form.address}
            onChange={(event) => updateField("address", event.target.value)}
            placeholder="Home address"
          />
        </Field>
        <Field label="Confirm password" fullWidth>
          <div className="space-y-2">
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(event) => updateField("confirmPassword", event.target.value)}
              placeholder="Confirm password"
              autoComplete="new-password"
              required
            />
            {errors.confirmPassword ? (
              <p className="text-xs text-red-600">{errors.confirmPassword}</p>
            ) : null}
          </div>
        </Field>
      </FormGrid>

      {message ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {message}
        </div>
      ) : null}

      <div className="flex justify-end border-t border-border/50 pt-5">
        <AccentButton accent="green" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </AccentButton>
      </div>
    </form>
  );
}
