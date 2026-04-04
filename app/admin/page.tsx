import { redirect } from "next/navigation";

import { AdminNoticeForm } from "@/components/admin-notice-form";
import { DashboardShell, Panel } from "@/components/dashboard-shell";
import { getCurrentUser } from "@/lib/auth";
import connectDb from "@/lib/db/mongoose";
import { Notice } from "@/lib/models/notice.model";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin" && user.role !== "warden") {
    redirect("/student");
  }

  await connectDb();

  const notices = await Notice.find()
    .sort({ createdAt: -1 })
    .limit(12)
    .lean();

  return (
    <DashboardShell title="Post notice" role="admin" userName={user.name}>
      <Panel title="Create a notice">
        <AdminNoticeForm />
      </Panel>

      <Panel title="Recent notices">
        {notices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notices posted yet.</p>
        ) : (
          <div className="space-y-3">
            {notices.map((notice) => (
              <article key={String(notice._id)} className="rounded border border-border bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{notice.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(notice.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <span className="rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                    {notice.category}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{notice.content}</p>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </DashboardShell>
  );
}
