"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AccentButton, Field, Input } from "@/components/v1-portal";

type LoginResponse = {
  data?: {
    user?: {
      role?: "student" | "admin" | "warden";
    };
  };
  message?: string;
  errors?: Record<string, string> | Array<Record<string, string>>;
};

export function AuthLoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          password,
          rememberMe,
        }),
      });

      const result = (await response.json()) as LoginResponse;

      if (!response.ok) {
        const nextFieldErrors = Array.isArray(result.errors)
          ? (result.errors[0] ?? {})
          : (result.errors ?? {});
        setFieldErrors(nextFieldErrors);
        setError(result.message || "Unable to sign in");
        return;
      }

      const role = result.data?.user?.role;
      const destination =
        role === "admin" || role === "warden" ? "/admin" : "/student";

      router.push(destination);
      router.refresh();
    } catch {
      setError("Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Field label="ID">
        <Input
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder="Email or roll number"
          autoComplete="username"
          required
        />
        {fieldErrors.identifier ? (
          <p className="text-xs text-red-600">{fieldErrors.identifier}</p>
        ) : null}
      </Field>

      <Field label="Password">
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          required
        />
        {fieldErrors.password ? (
          <p className="text-xs text-red-600">{fieldErrors.password}</p>
        ) : null}
      </Field>

      <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 bg-muted/30 px-4 py-3 transition-smooth">
        <label className="flex items-center gap-3 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="size-4 rounded border-border/50 bg-input cursor-pointer"
          />
          Remember me
        </label>
        <a href="#" className="text-sm font-medium text-accent hover:text-accent/80 transition-colors">
          Forgot password?
        </a>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex justify-end border-t border-border/50 pt-5">
        <AccentButton accent="red" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </AccentButton>
      </div>
    </form>
  );
}
