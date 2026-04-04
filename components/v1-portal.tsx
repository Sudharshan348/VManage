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
    sidebar: "bg-primary",
    button: "btn-primary",
    highlight: "text-primary font-semibold",
  },
  green: {
    sidebar: "bg-secondary",
    button: "btn-primary",
    highlight: "text-primary font-semibold",
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-bold">
              VM
            </div>
            <p className="text-lg font-semibold text-foreground">VManage</p>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {eyebrow && <p className="text-sm text-muted-foreground mt-1">{eyebrow}</p>}
        </div>

        <main className="card-base p-6 sm:p-8">
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
    <section className="card-base p-4 sm:p-6 border-t-4 border-t-primary">
      <h3 className="text-xl font-bold text-foreground">{title}</h3>
      {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
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
        <span className="label-base">{label}</span>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
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
        "input-base",
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
        "input-base",
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
        "input-base min-h-28 resize-none",
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
        "btn-primary",
        className
      )}
    />
  );
}
