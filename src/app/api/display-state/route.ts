import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [dashboards, config] = await Promise.all([
    prisma.dashboard.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.displayConfig.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    }),
  ]);

  const version = Math.max(
    config.updatedAt.getTime(),
    ...dashboards.map((d) => d.updatedAt.getTime()),
    0,
  );

  return NextResponse.json({ version, dashboards, config });
}
