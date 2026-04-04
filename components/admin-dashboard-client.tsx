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
    assetIdentifier: string;
    assetType: string;
    riskScore: number;
    status: string;
    floorLevel: number;
    createdAt: string;
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
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <article key={ticket._id} className="border-l-4 border-l-primary bg-gray-50 p-3 rounded">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground">{ticket.title}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {ticket.studentName} • {ticket.studentRollNo}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap mb-2">
            <span className="bg-primary/10 text-primary px-2 py-1 text-xs font-semibold rounded">{ticket.category}</span>
            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 text-xs font-semibold rounded">{ticket.priority}</span>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 text-xs font-semibold rounded">{ticket.status}</span>
          </div>
          <p className="text-sm text-muted-foreground">{ticket.description}</p>
        </article>
      ))}
    </div>
  );
}

function MaintenanceIssueList({
  issues,
}: {
  issues: AdminDashboardClientProps["maintenanceIssues"];
}) {
  if (issues.length === 0) {
    return <p className="text-sm text-muted-foreground">No fatal maintenance issues</p>;
  }

  return (
    <div className="space-y-3">
      {issues.map((issue) => (
        <article key={issue._id} className="rounded border border-red-100 bg-red-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                {issue.assetIdentifier} • {issue.assetType}
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Floor {issue.floorLevel} • {new Date(issue.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
            <span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
              {issue.riskScore.toFixed(2)}%
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            ML-flagged preventive maintenance issue. Current status: {issue.status}.
          </p>
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
          <p className="text-sm text-muted-foreground">Loading notices...</p>
        ) : notices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notices posted yet</p>
        ) : (
          <div className="space-y-3">
            {notices.map((notice) => (
              <article key={notice._id} className="border-l-4 border-l-primary bg-gray-50 p-3 rounded">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h4 className="font-semibold text-foreground text-sm">{notice.title}</h4>
                  <span className="bg-primary/10 text-primary px-2 py-1 text-xs font-semibold rounded whitespace-nowrap">
                    {notice.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{notice.content}</p>
              </article>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Registered students">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading students...</p>
        ) : students.length === 0 ? (
          <p className="text-sm text-muted-foreground">No students found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold text-foreground">Roll No</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Course</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Year</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Phone</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 10).map((student) => (
                  <tr key={student._id} className="border-t border-border hover:bg-gray-50">
                    <td className="px-4 py-3 text-foreground font-medium">{student.rollNo}</td>
                    <td className="px-4 py-3 text-muted-foreground">{student.course}</td>
                    <td className="px-4 py-3 text-muted-foreground">{student.year}</td>
                    <td className="px-4 py-3 text-muted-foreground">{student.phone}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded bg-primary/10 text-primary px-2 py-1 text-xs font-semibold">
                        {student.status}
                      </span>
                    </td>
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
        <MaintenanceIssueList issues={maintenanceIssues} />
      </Panel>
    </div>
  );
}
