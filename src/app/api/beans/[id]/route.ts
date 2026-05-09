import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { BeanInputSchema } from "@/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bean = db.beans.getById(id);
  if (!bean) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(bean);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = BeanInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const bean = db.beans.update(id, parsed.data);
  if (!bean) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(bean);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = db.beans.delete(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
