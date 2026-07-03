import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.displayConfig.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  const count = await prisma.dashboard.count();
  if (count === 0) {
    await prisma.dashboard.createMany({
      data: [
        { name: "Ventas — Resumen", url: "https://app.powerbi.com/view?r=DEMO1", duration: 30, order: 0, active: true },
        { name: "Operaciones", url: "https://app.powerbi.com/view?r=DEMO2", duration: 45, order: 1, active: true },
      ],
    });
  }
}

main().finally(() => prisma.$disconnect());
