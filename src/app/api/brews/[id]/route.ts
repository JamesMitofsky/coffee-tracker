import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { BrewInputSchema } from "@/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const brew = db.brews.getById(id);
  if (!brew) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(brew);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = BrewInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const brew = db.brews.update(id, parsed.data);
  if (!brew) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(brew);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = db.brews.delete(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
