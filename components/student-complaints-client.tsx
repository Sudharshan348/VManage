"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ComplaintItem = {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  roomNumber: string;
  createdAt: string;
  resolvedNote?: string;
};

export function StudentComplaintsClient({ complaints }: { complaints: ComplaintItem[] }) {
  const router = useRouter();
  const [reopeningId, setReopeningId] = useState("");
  const [error, setError] = useState("");

  async function handleReopen(ticketId: string) {
    setReopeningId(ticketId);
    setError("");

    try {
      const response = await fetch(`/api/v1/issues/${ticketId}`, {
        method: "POST",
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(payload.message || "Unable to reopen issue");
        return;
      }

      router.refresh();
    } catch {
      setError("Unable to reopen issue");
    } finally {
      setReopeningId("");
    }
  }

  if (complaints.length === 0) {
    return <p className="text-sm text-muted-foreground">You have not raised any complaints yet.</p>;
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {complaints.map((complaint) => {
        const allowRaiseAgain =
          complaint.status === "resolved" || complaint.status === "closed";

        return (
          <article key={complaint._id} className="rounded-[24px] border border-border bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                    {complaint.category}
                  </span>
                  <span className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                    {complaint.priority}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                    {complaint.status}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-foreground">{complaint.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{complaint.description}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Room {complaint.roomNumber} • {new Date(complaint.createdAt).toLocaleString("en-IN")}
                </p>
                {complaint.resolvedNote ? (
                  <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Admin note: {complaint.resolvedNote}
                  </div>
                ) : null}
              </div>

              {allowRaiseAgain ? (
                <button
                  type="button"
                  onClick={() => void handleReopen(complaint._id)}
                  disabled={reopeningId === complaint._id}
                  className="btn-secondary whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {reopeningId === complaint._id ? "Reopening..." : "Raise same issue again"}
                </button>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
