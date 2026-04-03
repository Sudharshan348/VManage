import { redirect } from "next/navigation";

import { AdminNoticeForm } from "@/components/admin-notice-form";
import { DashboardCard, DashboardShell, Panel } from "@/components/dashboard-shell";
import { getCurrentUser } from "@/lib/auth";
import connectDb from "@/lib/db/mongoose";
import { MaintenanceTicket } from "@/lib/models/maintenance.model";
import { Notice } from "@/lib/models/notice.model";

type TicketRow = {
  _id: { toString(): string };
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  studentId?: { name?: string; rollNo?: string };
};

function TicketList({
  tickets,
  emptyMessage,
}: {
  tickets: TicketRow[];
  emptyMessage: string;
}) {
  if (tickets.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <article
          key={ticket._id.toString()}
          className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-base font-semibold text-slate-950">{ticket.title}</h4>
              <p className="text-sm text-slate-500">
                {ticket.studentId?.name || "Student"} • {ticket.studentId?.rollNo || "N/A"}
              </p>
            </div>
            <div className="flex gap-2 text-xs font-medium uppercase tracking-wide text-slate-600">
              <span className="rounded-full bg-white px-3 py-1">{ticket.category}</span>
              <span className="rounded-full bg-white px-3 py-1">{ticket.priority}</span>
              <span className="rounded-full bg-white px-3 py-1">{ticket.status}</span>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-700">{ticket.description}</p>
        </article>
      ))}
    </div>
  );
}

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin" && user.role !== "warden") {
    redirect("/student");
  }

  await connectDb();

  const [openComplaints, activeNotices, urgentMaintenance] = await Promise.all([
    MaintenanceTicket.find({ status: { $in: ["open", "in_progress"] } })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("studentId", "name rollNo")
      .lean(),
    Notice.find({ isActive: true }).sort({ createdAt: -1 }).limit(6).lean(),
    MaintenanceTicket.find({
      priority: { $in: ["high", "urgent"] },
      status: { $in: ["open", "in_progress"] },
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("studentId", "name rollNo")
      .lean(),
  ]);

  return (
    <DashboardShell title="Faculty workspace" role="admin" userName={user.name}>
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard title="Active notices" value={String(activeNotices.length)} />
        <DashboardCard title="Current complaints" value={String(openComplaints.length)} />
        <DashboardCard title="Urgent maintenance" value={String(urgentMaintenance.length)} />
      </div>

      <Panel title="Post a notice">
        <AdminNoticeForm />
      </Panel>

      <Panel title="Recent notices">
        {activeNotices.length === 0 ? (
          <p className="text-sm text-slate-500">No notices posted yet</p>
        ) : (
          <div className="space-y-4">
            {activeNotices.map((notice) => (
              <article
                key={String(notice._id)}
                className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-base font-semibold text-slate-950">{notice.title}</h4>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                    {notice.category}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-700">{notice.content}</p>
              </article>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Current complaints">
        <TicketList
          tickets={openComplaints as TicketRow[]}
          emptyMessage="No current complaints"
        />
      </Panel>

      <Panel title="Maintenance issues">
        <TicketList
          tickets={urgentMaintenance as TicketRow[]}
          emptyMessage="No urgent maintenance issues"
        />
      </Panel>
    </DashboardShell>
  );
}
