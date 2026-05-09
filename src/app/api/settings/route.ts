import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SettingsSchema } from "@/types";

export async function GET() {
  return NextResponse.json(db.settings.get());
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const parsed = SettingsSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const settings = db.settings.update(parsed.data);
  return NextResponse.json(settings);
}
