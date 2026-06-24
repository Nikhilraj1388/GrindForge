import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Sidebar } from "@/components/sidebar";
import { syncUser, hasCompletedOnboarding } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Sync user to database on every dashboard load
  await syncUser();

  // Check if profile is complete
  const profileDone = await hasCompletedOnboarding();
  if (!profileDone) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-[220px] min-h-screen">{children}</main>
    </div>
  );
}
