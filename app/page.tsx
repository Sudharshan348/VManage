import Link from "next/link";
import { ArrowRight, LogIn, MessageSquareWarning, UserPlus } from "lucide-react";

const entryCards = [
  {
    href: "/signup",
    title: "Student signup",
    icon: UserPlus,
    tint: "bg-emerald-50 text-emerald-700",
  },
  {
    href: "/login",
    title: "Sign in",
    icon: LogIn,
    tint: "bg-red-50 text-red-700",
  },
  {
    href: "/issues",
    title: "Raise issue",
    icon: MessageSquareWarning,
    tint: "bg-emerald-50 text-emerald-700",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_35px_90px_-60px_rgba(15,23,42,0.45)]">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <section className="bg-gradient-to-br from-red-700 via-red-600 to-emerald-600 p-8 text-white sm:p-12">
            <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
              VManage
            </h1>
          </section>

          <section className="bg-slate-50 p-8 sm:p-12">
            <div className="grid gap-4">
              {entryCards.map((card) => {
                const Icon = card.icon;

                return (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="group rounded-[28px] border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`inline-flex rounded-2xl p-3 ${card.tint}`}>
                          <Icon className="size-5" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-950">{card.title}</h2>
                      </div>
                      <ArrowRight className="size-5 text-slate-400 transition group-hover:text-slate-900" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
