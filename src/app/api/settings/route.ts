import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { SettingsSchema } from "@/types";

export async function GET() {
  const { dataFile: _df, ...settings } = config.get();
  return NextResponse.json(settings);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const parsed = SettingsSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { dataFile: _df, ...settings } = config.update(parsed.data);
  return NextResponse.json(settings);
}
