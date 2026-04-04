"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AccentButton, Field, Input, Select, Textarea } from "@/components/v1-portal";

type ComplaintItem = {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  roomNumber: string;
  studentName: string;
  studentRollNo: string;
  createdAt: string;
  resolvedNote?: string;
};

export function AdminComplaintsClient({ complaints }: { complaints: ComplaintItem[] }) {
  const router = useRouter();
  const [savingId, setSavingId] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkStatus, setBulkStatus] = useState("in_progress");
  const [bulkNote, setBulkNote] = useState("");
  const [statusById, setStatusById] = useState<Record<string, string>>(
    Object.fromEntries(complaints.map((complaint) => [complaint._id, complaint.status]))
  );
  const [noteById, setNoteById] = useState<Record<string, string>>(
    Object.fromEntries(complaints.map((complaint) => [complaint._id, complaint.resolvedNote || ""]))
  );
  const filteredComplaints = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return complaints.filter((complaint) => {
      const matchesStatus = statusFilter === "all" || statusById[complaint._id] === statusFilter;
      const matchesPriority = priorityFilter === "all" || complaint.priority === priorityFilter;
      const matchesCategory = categoryFilter === "all" || complaint.category === categoryFilter;
      const matchesSearch =
        !query ||
        complaint.title.toLowerCase().includes(query) ||
        complaint.description.toLowerCase().includes(query) ||
        complaint.studentName.toLowerCase().includes(query) ||
        complaint.studentRollNo.toLowerCase().includes(query) ||
        complaint.roomNumber.toLowerCase().includes(query);

      return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
    });
  }, [
    categoryFilter,
    complaints,
    priorityFilter,
    searchTerm,
    statusById,
    statusFilter,
  ]);

  const allVisibleSelected =
    filteredComplaints.length > 0 &&
    filteredComplaints.every((complaint) => selectedIds.includes(complaint._id));

  function toggleSelection(ticketId: string) {
    setSelectedIds((current) =>
      current.includes(ticketId)
        ? current.filter((id) => id !== ticketId)
        : [...current, ticketId]
    );
  }

  function toggleSelectAllVisible() {
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter(
          (id) => !filteredComplaints.some((complaint) => complaint._id === id)
        );
      }

      return Array.from(new Set([...current, ...filteredComplaints.map((complaint) => complaint._id)]));
    });
  }

  async function updateComplaint(ticketId: string) {
    setSavingId(ticketId);
    setError("");

    try {
      const response = await fetch(`/api/v1/issues/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusById[ticketId],
          resolvedNote: noteById[ticketId],
        }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(payload.message || "Unable to update complaint");
        return;
      }

      router.refresh();
    } catch {
      setError("Unable to update complaint");
    } finally {
      setSavingId("");
    }
  }

  async function applyBulkUpdate() {
    if (selectedIds.length === 0) {
      setError("Select at least one complaint for bulk update");
      return;
    }

    setBulkSaving(true);
    setError("");

    try {
      const responses = await Promise.all(
        selectedIds.map((ticketId) =>
          fetch(`/api/v1/issues/${ticketId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: bulkStatus,
              resolvedNote: bulkNote,
            }),
          })
        )
      );

      const failed = responses.find((response) => !response.ok);
      if (failed) {
        setError("Bulk update failed for one or more complaints");
        return;
      }

      setSelectedIds([]);
      setBulkNote("");
      router.refresh();
    } catch {
      setError("Bulk update failed");
    } finally {
      setBulkSaving(false);
    }
  }

  if (complaints.length === 0) {
    return <p className="text-sm text-muted-foreground">No complaints raised yet.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
        <div className="grid gap-4 lg:grid-cols-4">
          <Field label="Search">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Title, room, student, roll no"
            />
          </Field>
          <Field label="Status filter">
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </Select>
          </Field>
          <Field label="Priority filter">
            <Select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </Field>
          <Field label="Category filter">
            <Select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">All</option>
              <option value="electrical">Electrical</option>
              <option value="plumbing">Plumbing</option>
              <option value="furniture">Furniture</option>
              <option value="cleaning">Cleaning</option>
              <option value="internet">Internet</option>
              <option value="other">Other</option>
            </Select>
          </Field>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[auto_1fr_auto] xl:items-end">
          <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAllVisible}
              className="size-4 rounded border border-slate-300"
            />
            Select all visible complaints
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Bulk status">
              <Select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)}>
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </Select>
            </Field>
            <Field label="Bulk note" hint="Optional">
              <Textarea
                value={bulkNote}
                onChange={(event) => setBulkNote(event.target.value)}
                placeholder="Add one note for all selected complaints"
                className="min-h-24"
              />
            </Field>
          </div>

          <div className="flex flex-col items-start gap-2 xl:items-end">
            <p className="text-xs text-muted-foreground">
              {selectedIds.length} selected • {filteredComplaints.length} visible
            </p>
            <AccentButton
              accent="red"
              type="button"
              disabled={bulkSaving || selectedIds.length === 0}
              onClick={() => void applyBulkUpdate()}
            >
              {bulkSaving ? "Applying..." : "Apply bulk update"}
            </AccentButton>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {filteredComplaints.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
          No complaints match the current filters.
        </div>
      ) : null}

      {filteredComplaints.map((complaint) => {
        const isResolvedLike =
          statusById[complaint._id] === "resolved" || statusById[complaint._id] === "closed";

        return (
          <article key={complaint._id} className="rounded-[24px] border border-border bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(complaint._id)}
                    onChange={() => toggleSelection(complaint._id)}
                    className="size-4 rounded border border-slate-300"
                  />
                  Select complaint
                </label>
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                      {complaint.category}
                    </span>
                    <span className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                      {complaint.priority}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {statusById[complaint._id]}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-foreground">{complaint.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{complaint.description}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {complaint.studentName} • {complaint.studentRollNo} • Room {complaint.roomNumber} •{" "}
                  {new Date(complaint.createdAt).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Field label="Complaint status">
                  <Select
                    value={statusById[complaint._id]}
                    onChange={(event) =>
                      setStatusById((current) => ({
                        ...current,
                        [complaint._id]: event.target.value,
                      }))
                    }
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </Select>
                </Field>

                <Field
                  label={isResolvedLike ? "Resolution note" : "Admin note"}
                  hint={isResolvedLike ? "Shown when the complaint is marked resolved or closed" : "Optional"}
                >
                  <Textarea
                    value={noteById[complaint._id]}
                    onChange={(event) =>
                      setNoteById((current) => ({
                        ...current,
                        [complaint._id]: event.target.value,
                      }))
                    }
                    placeholder="Add work done, vendor details, or why the issue was closed"
                  />
                </Field>

                <div className="flex justify-end">
                  <AccentButton
                    accent="red"
                    disabled={savingId === complaint._id}
                    onClick={() => void updateComplaint(complaint._id)}
                    type="button"
                  >
                    {savingId === complaint._id ? "Saving..." : "Update status"}
                  </AccentButton>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
