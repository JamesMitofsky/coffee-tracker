import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { BrewInputSchema } from "@/types";
import { randomUUID } from "crypto";

export async function GET() {
  const brews = db.brews.getAll();
  return NextResponse.json(brews);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = BrewInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const brew = db.brews.create({
    ...parsed.data,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(brew, { status: 201 });
}
