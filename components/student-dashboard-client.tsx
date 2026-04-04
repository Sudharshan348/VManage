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
      <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
      <p className="rounded border border-border bg-gray-50 px-3 py-2 text-sm text-foreground">
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
          <p className="text-sm text-muted-foreground">Loading notices...</p>
        ) : notices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notices available</p>
        ) : (
          <div className="space-y-3">
            {notices.slice(0, 6).map((notice) => (
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
    </div>
  );
}
