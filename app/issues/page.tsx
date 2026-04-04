import { redirect } from "next/navigation";

import { DashboardShell, Panel } from "@/components/dashboard-shell";
import { IssueForm } from "@/components/issue-form";
import { getCurrentStudentProfile } from "@/lib/auth";
import connectDb from "@/lib/db/mongoose";
import { MaintenanceTicket } from "@/lib/models/issue.model";
import { Room } from "@/lib/models/room.model";

type IssuesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function IssuesPage({ searchParams }: IssuesPageProps) {
  const profile = await getCurrentStudentProfile();

  if (!profile?.user) {
    redirect("/login");
  }

  if (profile.user.role !== "student" || !profile.student) {
    redirect("/admin");
  }

  let initialRoomNumber = "";
  let complaints: Array<{
    _id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    roomNumber: string;
    createdAt: string;
    resolvedNote?: string;
  }> = [];

  await connectDb();
  if (profile.student.roomId) {
    const room = await Room.findById(profile.student.roomId).select("roomNumber").lean();
    initialRoomNumber = room?.roomNumber ?? "";
  }

  complaints = await MaintenanceTicket.find({ studentId: profile.student._id })
    .sort({ createdAt: -1 })
    .lean()
    .then((tickets) =>
      tickets.map((ticket) => ({
        _id: String(ticket._id),
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        roomNumber: ticket.roomNumber,
        createdAt: ticket.createdAt instanceof Date
          ? ticket.createdAt.toISOString()
          : String(ticket.createdAt),
        resolvedNote: ticket.resolvedNote,
      }))
    );

  const query = searchParams ? await searchParams : {};
  const initialTitle = getParamValue(query.title);
  const initialDescription = getParamValue(query.description);
  const initialCategory = getParamValue(query.category) || "electrical";
  const initialPriority = getParamValue(query.priority) || "medium";

  return (
    <DashboardShell title="Your issues" role="student" userName={profile.user.name}>
      <Panel title="Raise a complaint">
        <IssueForm
          studentName={profile.user.name}
          rollNo={profile.student.rollNo}
          phone={profile.student.phone}
          initialRoomNumber={initialRoomNumber}
          initialTitle={initialTitle}
          initialDescription={initialDescription}
          initialCategory={initialCategory}
          initialPriority={initialPriority}
        />
      </Panel>

      <Panel title="Complaint status">
        {complaints.length === 0 ? (
          <p className="text-sm text-muted-foreground">You have not raised any complaints yet.</p>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => {
              const allowRaiseAgain =
                complaint.status === "resolved" || complaint.status === "closed";
              const raiseAgainQuery = new URLSearchParams({
                title: complaint.title,
                description: complaint.description,
                category: complaint.category,
                priority: complaint.priority,
              }).toString();

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
                      <a href={`/issues?${raiseAgainQuery}`} className="btn-secondary whitespace-nowrap">
                        Raise same issue again
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Panel>
    </DashboardShell>
  );
}
