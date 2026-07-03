import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();

  if (body.active === false) {
    const activeCount = await prisma.dashboard.count({ where: { active: true } });
    const current = await prisma.dashboard.findUnique({ where: { id: params.id } });
    if (current?.active && activeCount <= 1) {
      return NextResponse.json({ error: "Debe existir al menos 1 dashboard activo" }, { status: 400 });
    }
  }

  const data: any = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.url !== undefined) data.url = body.url;
  if (body.duration !== undefined) data.duration = Math.min(3600, Math.max(5, Number(body.duration)));
  if (body.active !== undefined) data.active = body.active;

  const updated = await prisma.dashboard.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.dashboard.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
