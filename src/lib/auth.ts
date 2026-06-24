import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

/**
 * Get the current authenticated user from the database.
 * Returns null if not authenticated or user not found in DB.
 */
export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { statistics: true },
  });

  return user;
}

/**
 * Get the current user or throw an error.
 * Use in protected routes where user must exist.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not found. Please complete onboarding.");
  }
  return user;
}

/**
 * Sync the Clerk user to the database.
 * Creates the user if they don't exist, updates if they do.
 * Called after sign-in / sign-up to keep the DB in sync with Clerk.
 */
export async function syncUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress || "";
  const fullName = clerkUser.firstName
    ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
    : null;

  // Derive a username from the Clerk username, or the email prefix
  const username =
    clerkUser.username || email.split("@")[0] || `user-${clerkUser.id.slice(-8)}`;

  // Determine auth provider
  const provider =
    clerkUser.externalAccounts?.some((a) => a.provider === "google")
      ? ("GOOGLE" as const)
      : ("EMAIL" as const);

  const user = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      email,
      fullName,
      profileImage: clerkUser.imageUrl,
      lastSeen: new Date(),
    },
    create: {
      clerkId: clerkUser.id,
      email,
      username,
      fullName,
      profileImage: clerkUser.imageUrl,
      provider,
      statistics: {
        create: {},
      },
    },
    include: { statistics: true },
  });

  return user;
}

/**
 * Check if the current user exists in the database.
 */
export async function hasCompletedOnboarding() {
  const user = await getCurrentUser();
  if (!user) return false;
  return !!user.username;
}
