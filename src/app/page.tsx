import { Flame, Hammer, Users, Clock, Trophy, Zap } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.12),_transparent_50%)]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <Flame className="size-7 text-primary" />
          <span className="text-xl font-bold tracking-tight">GrindForge</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            Sign In
          </Link>
          <Link href="/sign-up" className={cn(buttonVariants())}>
            Start Forging
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
          <Hammer className="size-4 text-primary" />
          Social Accountability Learning Platform
        </div>

        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
          The Digital Forge for{" "}
          <span className="text-primary">Ambitious Learners</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Track your grind, stay visible to your guild, and forge consistency
          through community. Real-time study tracking with accountability built in.
        </p>

        <div className="mt-10 flex items-center gap-4">
          <Link href="/sign-up" className={cn(buttonVariants({ size: "lg" }), "gap-2 text-base font-bold px-8")}>
            <Flame className="size-5" /> Start Forging — Free
          </Link>
          <Link href="/sign-in" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "text-base px-8")}>
            Sign In
          </Link>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid w-full max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Clock,
              title: "Study Timer",
              desc: "Track sessions with pause, resume, auto-save. Never lose progress.",
            },
            {
              icon: Users,
              title: "Study Groups",
              desc: "Create guilds, set goals, hold each other accountable.",
            },
            {
              icon: Zap,
              title: "Anti-Cheat",
              desc: "Idle detection, checkpoints, and warnings keep you honest.",
            },
            {
              icon: Trophy,
              title: "Leaderboards",
              desc: "Daily, weekly, monthly rankings. Compete with your guild.",
            },
            {
              icon: Flame,
              title: "Forge Score",
              desc: "Earn points for consistency. Build your learning reputation.",
            },
            {
              icon: Hammer,
              title: "Challenges",
              desc: "Join community challenges. Push your limits together.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-6 text-left transition-colors hover:border-primary/30"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="size-5 text-primary" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-foreground">{feature.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="mt-16 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
          {[
            { label: "Stack", value: "Next.js 15 + Prisma" },
            { label: "Database", value: "PostgreSQL (Neon)" },
            { label: "Auth", value: "Clerk" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border bg-card px-4 py-5 text-left"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-1 font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mx-auto max-w-6xl px-6 py-8 text-center text-sm text-muted-foreground border-t border-border mt-10">
        <p>Built with 🔥 by GrindForge. Track your grind. Forge your future.</p>
      </footer>
    </div>
  );
}
