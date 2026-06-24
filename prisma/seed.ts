import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const achievements = [
    {
      name: "First Forge",
      description: "Complete your first study session",
      icon: "bronze-anvil",
    },
    {
      name: "Week Warrior",
      description: "Maintain a 7-day streak",
      icon: "silver-flame",
    },
    {
      name: "Grind Master",
      description: "Forge 100 hours total",
      icon: "gold-hammer",
    },
  ];

  for (const achievement of achievements) {
    const existing = await prisma.achievement.findFirst({
      where: { name: achievement.name },
    });

    if (!existing) {
      await prisma.achievement.create({ data: achievement });
    }
  }

  const settings = [
    { key: "forge_score_formula_version", value: "1" },
    { key: "default_idle_timeout_minutes", value: "10" },
    { key: "default_checkpoint_frequency_minutes", value: "60" },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log("Seed completed: achievements and system settings ready.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
