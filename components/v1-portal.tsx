"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, ShieldCheck, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PortalShellProps = {
  title: string;
  eyebrow?: string;
  accent: "red" | "green";
  children: React.ReactNode;
};

const accentStyles = {
  red: {
    sidebar: "from-red-700 via-red-600 to-red-500",
    button: "bg-red-600 text-white hover:bg-red-700",
    highlight: "bg-red-50 text-red-700",
  },
  green: {
    sidebar: "from-emerald-700 via-emerald-600 to-emerald-500",
    button: "bg-emerald-600 text-white hover:bg-emerald-700",
    highlight: "bg-emerald-50 text-emerald-700",
  },
} as const;

const navItems = [
  { href: "/signup", label: "Student signup", icon: UserPlus },
  { href: "/login", label: "Sign in", icon: LogIn },
];

export function PortalShell({
  title,
  eyebrow,
  accent,
  children,
}: PortalShellProps) {
  const pathname = usePathname();
  const palette = accentStyles[accent];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div
              className={cn(
                "rounded-2xl bg-gradient-to-br p-2.5 text-white shadow-sm",
                palette.sidebar
              )}
            >
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                VManage
              </p>
            </div>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
                    active ? `${palette.highlight}` : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[300px_1fr] lg:px-8">
        <aside
          className={cn(
            "overflow-hidden rounded-[28px] bg-gradient-to-br p-6 text-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.55)]",
            palette.sidebar
          )}
        >
          <div className="flex h-full flex-col">
            <div>
              {eyebrow ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">
                  {eyebrow}
                </p>
              ) : null}
              <h2 className="mt-3 text-3xl font-semibold leading-tight">{title}</h2>
            </div>

            <div className="mt-8 space-y-3">
              {navItems.map((item) => {
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
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-auto rounded-[24px] border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur-sm">
              Access portal
            </div>
          </div>
        </aside>

        <main className="rounded-[32px] border border-slate-200 bg-slate-50/70 p-4 shadow-[0_20px_70px_-50px_rgba(15,23,42,0.35)] sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-slate-950">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

export function Field({
  label,
  hint,
  children,
  fullWidth = false,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <label className={cn("space-y-2", fullWidth && "md:col-span-2")}>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-slate-800">{label}</span>
        {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      </div>
      {children}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70",
        props.className
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70",
        props.className
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70",
        props.className
      )}
    />
  );
}

export function AccentButton({
  accent,
  className,
  ...props
}: React.ComponentProps<typeof Button> & { accent: "red" | "green" }) {
  return (
    <Button
      {...props}
      className={cn(
        "h-11 rounded-2xl px-5 text-sm font-semibold shadow-lg shadow-slate-200",
        accentStyles[accent].button,
        className
      )}
    />
  );
}
