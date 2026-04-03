import { redirect } from "next/navigation";

import { AdminNoticeForm } from "@/components/admin-notice-form";
import { DashboardCard, DashboardShell, Panel } from "@/components/dashboard-shell";
import { getCurrentUser } from "@/lib/auth";
import connectDb from "@/lib/db/mongoose";
import { MaintenanceTicket } from "@/lib/models/maintenance.model";
import { Notice } from "@/lib/models/notice.model";
import { Student } from "@/lib/models/student.model";
import { User } from "@/lib/models/user.model";

type TicketRow = {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  studentName: string;
  studentRollNo: string;
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
          key={ticket._id}
          className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-base font-semibold text-slate-950">{ticket.title}</h4>
              <p className="text-sm text-slate-500">
                {ticket.studentName} • {ticket.studentRollNo}
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

  const [openComplaintDocs, activeNotices, urgentMaintenanceDocs] = await Promise.all([
    MaintenanceTicket.find({ status: { $in: ["open", "in_progress"] } })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),
    Notice.find({ isActive: true }).sort({ createdAt: -1 }).limit(6).lean(),
    MaintenanceTicket.find({
      priority: { $in: ["high", "urgent"] },
      status: { $in: ["open", "in_progress"] },
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);

  const studentIds = Array.from(
    new Set(
      [...openComplaintDocs, ...urgentMaintenanceDocs].map((ticket) =>
        String(ticket.studentId)
      )
    )
  );

  const studentDocs = await Student.find({ _id: { $in: studentIds } })
    .select("userId rollNo")
    .lean();
  const userIds = studentDocs.map((student) => student.userId).filter(Boolean);
  const userDocs = await User.find({ _id: { $in: userIds } }).select("name").lean();

  const userNameById = new Map(userDocs.map((item) => [String(item._id), item.name]));
  const studentMetaById = new Map(
    studentDocs.map((student) => [
      String(student._id),
      {
        rollNo: student.rollNo,
        name: userNameById.get(String(student.userId)) || "Student",
      },
    ])
  );

  const toTicketRows = (
    tickets: typeof openComplaintDocs
  ): TicketRow[] =>
    tickets.map((ticket) => {
      const meta = studentMetaById.get(String(ticket.studentId));
      return {
        _id: String(ticket._id),
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        studentName: meta?.name || "Student",
        studentRollNo: meta?.rollNo || "N/A",
      };
    });

  const openComplaints = toTicketRows(openComplaintDocs);
  const urgentMaintenance = toTicketRows(urgentMaintenanceDocs);

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
          tickets={openComplaints}
          emptyMessage="No current complaints"
        />
      </Panel>

      <Panel title="Maintenance issues">
        <TicketList
          tickets={urgentMaintenance}
          emptyMessage="No urgent maintenance issues"
        />
      </Panel>
    </DashboardShell>
  );
}
