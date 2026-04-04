"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AccentButton, Field, Input, Select, Textarea } from "@/components/v1-portal";

export function AdminNoticeForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/notices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          category,
          expiresAt,
        }),
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(result.message || "Unable to post notice");
        return;
      }

      setTitle("");
      setContent("");
      setCategory("general");
      setExpiresAt("");
      router.refresh();
    } catch {
      setError("Unable to post notice");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Field label="Title">
        <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </Field>
      <Field label="Category">
        <Select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="general">General</option>
          <option value="maintenance">Maintenance</option>
          <option value="event">Event</option>
          <option value="rule">Rule</option>
          <option value="emergency">Emergency</option>
        </Select>
      </Field>
      <Field label="Expires at" hint="Optional">
        <Input
          type="datetime-local"
          value={expiresAt}
          onChange={(event) => setExpiresAt(event.target.value)}
        />
      </Field>
      <Field label="Content">
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write the notice content"
          required
        />
      </Field>

      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex justify-end border-t border-border/50 pt-4">
        <AccentButton accent="red" disabled={loading}>
          {loading ? "Posting..." : "Post notice"}
        </AccentButton>
      </div>
    </form>
  );
}
