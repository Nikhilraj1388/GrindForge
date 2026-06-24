import { Flame } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Header */}
      <header className="absolute left-0 right-0 top-0 z-20 px-6 py-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <Flame className="size-7 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            GrindForge
          </span>
        </Link>
      </header>

      {children}
    </div>
  );
}
