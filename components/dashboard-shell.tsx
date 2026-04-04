"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Bot,
  ClipboardList,
  LogOut,
  Hotel,
  Cpu,
  ScanSearch,
  TriangleAlert,
  UserRound,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navConfig = {
  student: [
    { key: "student-profile", href: "/student", label: "Profile", icon: UserRound },
    { key: "student-issues", href: "/issues", label: "Your issues", icon: TriangleAlert },
    { key: "student-chat", href: "/chat", label: "AI chat", icon: Bot },
  ],
  admin: [
    { key: "admin-notices", href: "/admin", label: "Post notice", icon: Bell },
    { key: "admin-rooms", href: "/admin/room", label: "Rooms", icon: Hotel },
    { key: "admin-complaints", href: "/admin/complaints", label: "Complaints", icon: ClipboardList },
    { key: "admin-maintenance-ai", href: "/admin/maintenance", label: "Maintenance AI", icon: Cpu },
    { key: "admin-roommates", href: "/admin/roommates", label: "Roommate match", icon: ScanSearch },
    { key: "admin-chat", href: "/chat", label: "AI chat", icon: Bot },
    { key: "admin-maintenance", href: "/admin/maintenance", label: "Maintenance issues", icon: Users },
  ],
} as const;

type DashboardShellProps = {
  title: string;
  role: "student" | "admin";
  userName: string;
  children: React.ReactNode;
};

export function DashboardShell({
  title,
  role,
  userName,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const items = navConfig[role];

  async function handleLogout() {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-bold">
              VM
            </div>
            <p className="text-lg font-semibold text-foreground">VManage</p>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">{role}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-secondary gap-2 text-xs"
            >
              <LogOut className="size-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        </div>

        <nav className="mb-6 flex gap-2 flex-wrap border-b border-border pb-4">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardCard({
  title,
  value,
  note,
}: {
  title: string;
  value: string;
  note?: string;
}) {
  return (
    <section className="card-base p-4">
      <p className="text-xs font-semibold text-muted-foreground mb-1">{title}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {note ? <p className="text-xs text-muted-foreground mt-2">{note}</p> : null}
    </section>
  );
}

export function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-base p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div>{children}</div>
    </section>
  );
}
