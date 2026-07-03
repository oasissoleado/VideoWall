import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const config = await prisma.displayConfig.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return NextResponse.json(config);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const config = await prisma.displayConfig.upsert({
    where: { id: "singleton" },
    update: {
      resolution: body.resolution,
      zoom: Math.min(200, Math.max(50, Number(body.zoom ?? 100))),
      fallbackImageUrl: body.fallbackImageUrl ?? null,
      refreshInterval: Number(body.refreshInterval ?? 300),
    },
    create: { id: "singleton" },
  });
  return NextResponse.json(config);
}
