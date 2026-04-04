import Link from "next/link";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-bold">
              VM
            </div>
            <p className="text-lg font-semibold text-foreground">VManage</p>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Smart Dormitory Management System
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Streamline your residence with intelligent room management, maintenance tracking, and AI-powered support. Manage your dorm experience effortlessly.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">Get Started</h2>

          <div className="space-y-4">
            {/* Student Signup Card */}
            <Link
              href="/signup"
              className="card-base p-4 hover:shadow-md transition-all block group"
            >
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded flex-shrink-0">
                  <UserPlus className="size-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg mb-1">
                    New Student?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Create an account to get started with VManage
                  </p>
                  <div className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                    Sign up now <ArrowRight className="size-4" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Login Card */}
            <Link
              href="/login"
              className="card-base p-4 hover:shadow-md transition-all block group"
            >
              <div className="flex items-start gap-4">
                <div className="bg-secondary/10 text-secondary p-3 rounded flex-shrink-0">
                  <LogIn className="size-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg mb-1">
                    Already have an account?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Sign in to access your dashboard and manage your residence
                  </p>
                  <div className="flex items-center gap-1 text-secondary text-sm font-medium group-hover:gap-2 transition-all">
                    Sign in now <ArrowRight className="size-4" />
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Features */}
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Why VManage?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Easy room and profile management</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Quick issue reporting and tracking</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>AI-powered support and assistance</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Real-time updates and notifications</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
