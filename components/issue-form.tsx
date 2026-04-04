"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AccentButton, Field, FormGrid, Input, Select, Textarea } from "@/components/v1-portal";

type IssueFormProps = {
  studentName: string;
  rollNo: string;
  phone: string;
  initialRoomNumber?: string;
};

export function IssueForm({
  studentName,
  rollNo,
  phone,
  initialRoomNumber = "",
}: IssueFormProps) {
  const router = useRouter();
  const [roomNumber, setRoomNumber] = useState(initialRoomNumber);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("electrical");
  const [priority, setPriority] = useState("medium");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/v1/issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomNumber,
          title,
          description,
          category,
          priority,
        }),
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(result.message || "Unable to submit issue");
        return;
      }

      setRoomNumber(initialRoomNumber);
      setTitle("");
      setDescription("");
      setCategory("electrical");
      setPriority("medium");
      setMessage(result.message || "Issue raised successfully");
      router.refresh();
    } catch {
      setError("Unable to submit issue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <FormGrid>
        <Field label="Name">
          <Input value={studentName} readOnly />
        </Field>
        <Field label="Roll number">
          <Input value={rollNo} readOnly />
        </Field>
        <Field label="Phone">
          <Input value={phone} readOnly />
        </Field>
        <Field label="Room number">
          <Input
            value={roomNumber}
            onChange={(event) => setRoomNumber(event.target.value.toUpperCase())}
            placeholder="C-118"
            required
          />
        </Field>
        <Field label="Priority">
          <Select value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </Field>
        <Field label="Category">
          <Select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="electrical">Electrical</option>
            <option value="plumbing">Plumbing</option>
            <option value="furniture">Furniture</option>
            <option value="cleaning">Cleaning</option>
            <option value="internet">Internet</option>
            <option value="other">Other</option>
          </Select>
        </Field>
        <Field label="Summary">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Issue summary"
            required
          />
        </Field>
        <Field label="Details" fullWidth>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the issue"
            required
          />
        </Field>
      </FormGrid>

      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {message}
        </div>
      ) : null}

      <div className="flex justify-end border-t border-border/50 pt-5">
        <AccentButton accent="green" disabled={loading}>
          {loading ? "Submitting..." : "Submit issue"}
        </AccentButton>
      </div>
    </form>
  );
}
