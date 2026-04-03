"use client";

import { useEffect, useState } from "react";

import { AdminNoticeForm } from "@/components/admin-notice-form";
import { DashboardCard, Panel } from "@/components/dashboard-shell";

type NoticeItem = {
  _id: string;
  title: string;
  content: string;
  category: string;
  createdAt?: string;
  expiresAt?: string;
};

type StudentItem = {
  _id: string;
  rollNo: string;
  email?: string;
  phone: string;
  course: string;
  year: number;
  status: string;
};

type ApiEnvelope<T> = {
  data?: T;
  message?: string;
};

type AdminDashboardClientProps = {
  currentComplaints: Array<{
    _id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    studentName: string;
    studentRollNo: string;
  }>;
  maintenanceIssues: Array<{
    _id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    studentName: string;
    studentRollNo: string;
  }>;
};

function TicketList({
  tickets,
  emptyMessage,
}: {
  tickets: AdminDashboardClientProps["currentComplaints"];
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

export function AdminDashboardClient({
  currentComplaints,
  maintenanceIssues,
}: AdminDashboardClientProps) {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [noticeResponse, studentResponse] = await Promise.all([
          fetch("/api/v1/notices", { cache: "no-store" }),
          fetch("/api/v1/students", { cache: "no-store" }),
        ]);

        const noticesResult = (await noticeResponse.json()) as ApiEnvelope<NoticeItem[]>;
        const studentsResult = (await studentResponse.json()) as ApiEnvelope<StudentItem[]>;

        if (!active) return;

        if (noticeResponse.ok) {
          setNotices(noticesResult.data || []);
        }

        if (studentResponse.ok && Array.isArray(studentsResult.data)) {
          setStudents(studentsResult.data);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <DashboardCard title="Active notices" value={String(notices.length)} />
        <DashboardCard title="Current complaints" value={String(currentComplaints.length)} />
        <DashboardCard title="Urgent maintenance" value={String(maintenanceIssues.length)} />
        <DashboardCard title="Registered students" value={String(students.length)} />
      </div>

      <Panel title="Post a notice">
        <AdminNoticeForm />
      </Panel>

      <Panel title="Recent notices">
        {loading ? (
          <p className="text-sm text-slate-500">Loading notices...</p>
        ) : notices.length === 0 ? (
          <p className="text-sm text-slate-500">No notices posted yet</p>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => (
              <article
                key={notice._id}
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

      <Panel title="Registered students">
        {loading ? (
          <p className="text-sm text-slate-500">Loading students...</p>
        ) : students.length === 0 ? (
          <p className="text-sm text-slate-500">No students found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Roll No</th>
                  <th className="px-3 py-2 font-medium">Course</th>
                  <th className="px-3 py-2 font-medium">Year</th>
                  <th className="px-3 py-2 font-medium">Phone</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 10).map((student) => (
                  <tr key={student._id} className="border-t border-slate-200">
                    <td className="px-3 py-3 font-medium text-slate-900">{student.rollNo}</td>
                    <td className="px-3 py-3 text-slate-700">{student.course}</td>
                    <td className="px-3 py-3 text-slate-700">{student.year}</td>
                    <td className="px-3 py-3 text-slate-700">{student.phone}</td>
                    <td className="px-3 py-3 text-slate-700">{student.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title="Current complaints">
        <TicketList tickets={currentComplaints} emptyMessage="No current complaints" />
      </Panel>

      <Panel title="Maintenance issues">
        <TicketList tickets={maintenanceIssues} emptyMessage="No urgent maintenance issues" />
      </Panel>
    </div>
  );
}
