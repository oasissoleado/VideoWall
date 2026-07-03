import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const dashboards = await prisma.dashboard.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(dashboards);
}

export async function POST(req: Request) {
  const body = await req.json();
  const count = await prisma.dashboard.count();
  const created = await prisma.dashboard.create({
    data: {
      name: body.name ?? "Nuevo dashboard",
      url: body.url ?? "",
      duration: Math.min(3600, Math.max(5, Number(body.duration ?? 30))),
      order: count,
      active: body.active ?? true,
    },
  });
  return NextResponse.json(created);
}
