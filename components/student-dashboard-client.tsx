"use client";

import { useEffect, useState } from "react";

import { DashboardCard, Panel } from "@/components/dashboard-shell";

type NoticeItem = {
  _id: string;
  title: string;
  content: string;
  category: string;
  createdAt?: string;
  expiresAt?: string;
};

type ApiEnvelope<T> = {
  data?: T;
};

type StudentDashboardClientProps = {
  profile: {
    name: string;
    email: string;
    rollNo?: string;
    course?: string;
    year?: number;
    phone?: string;
    status?: string;
    parentPhone?: string;
    address?: string;
    roomLabel: string;
  };
};

function formatValue(value?: string | number | null) {
  return value ? String(value) : "Not provided";
}

function InfoItem({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value?: string | number | null;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "md:col-span-2" : undefined}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
        {formatValue(value)}
      </p>
    </div>
  );
}

export function StudentDashboardClient({ profile }: StudentDashboardClientProps) {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadNotices() {
      try {
        const response = await fetch("/api/v1/notices", { cache: "no-store" });
        const result = (await response.json()) as ApiEnvelope<NoticeItem[]>;

        if (active && response.ok) {
          setNotices(result.data || []);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadNotices();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard title="Roll number" value={formatValue(profile.rollNo)} />
        <DashboardCard title="Course" value={formatValue(profile.course)} />
        <DashboardCard title="Year" value={formatValue(profile.year)} />
      </div>

      <Panel title="Your signup information">
        <div className="grid gap-4 md:grid-cols-2">
          <InfoItem label="Full name" value={profile.name} />
          <InfoItem label="Email" value={profile.email} />
          <InfoItem label="Phone" value={profile.phone} />
          <InfoItem label="Status" value={profile.status} />
          <InfoItem label="Parent phone" value={profile.parentPhone} />
          <InfoItem label="Room assignment" value={profile.roomLabel} />
          <InfoItem label="Address" value={profile.address} fullWidth />
        </div>
      </Panel>

      <Panel title="Latest notices">
        {loading ? (
          <p className="text-sm text-slate-500">Loading notices...</p>
        ) : notices.length === 0 ? (
          <p className="text-sm text-slate-500">No notices available</p>
        ) : (
          <div className="space-y-4">
            {notices.slice(0, 6).map((notice) => (
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
    </div>
  );
}
