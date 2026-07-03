import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  const body = (await req.json()) as { id: string; order: number }[];
  await prisma.$transaction(
    body.map((item) => prisma.dashboard.update({ where: { id: item.id }, data: { order: item.order } })),
  );
  return NextResponse.json({ ok: true });
}
