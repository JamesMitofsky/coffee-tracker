import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { BeanInputSchema } from "@/types";
import { randomUUID } from "crypto";

export async function GET() {
  const beans = db.beans.getAll();
  return NextResponse.json(beans);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = BeanInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const bean = db.beans.create({
    ...parsed.data,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(bean, { status: 201 });
}
