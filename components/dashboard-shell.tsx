"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ClipboardList,
  Home,
  LogOut,
  Hotel,
  TriangleAlert,
  UserRound,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navConfig = {
  student: [
    { href: "/student", label: "Profile", icon: UserRound },
    { href: "/issues", label: "Raise issue", icon: TriangleAlert },
  ],
  admin: [
    { href: "/admin", label: "Overview", icon: Home },
    { href: "/admin/room", label: "Rooms", icon: Hotel },
    { href: "/admin", label: "Post notice", icon: Bell },
    { href: "/admin", label: "Current complaints", icon: ClipboardList },
    { href: "/admin", label: "Maintenance issues", icon: Users },
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
  const accent =
    role === "admin"
      ? "from-red-700 via-red-600 to-red-500"
      : "from-emerald-700 via-emerald-600 to-emerald-500";

  async function handleLogout() {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className={cn("rounded-2xl bg-gradient-to-br px-3 py-2 text-sm font-semibold text-white", accent)}>
              VM
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-950">VManage</p>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{role}</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{userName}</p>
              <p className="text-xs text-slate-500">Authenticated</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className={cn("rounded-[28px] bg-gradient-to-br p-5 text-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.55)]", accent)}>
          <div className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">
              Workspace
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight">{title}</h2>
          </div>

          <nav className="space-y-3">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium transition",
                    active ? "bg-white text-slate-950" : "bg-white/10 hover:bg-white/15"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="space-y-6 rounded-[32px] border border-slate-200 bg-slate-50/70 p-4 shadow-[0_20px_70px_-50px_rgba(15,23,42,0.35)] sm:p-6 lg:p-8">
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
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
      {note ? <p className="mt-1 text-sm text-slate-500">{note}</p> : null}
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
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
      <div className="mt-5">{children}</div>
    </section>
  );
}
