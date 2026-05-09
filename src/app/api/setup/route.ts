import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { config } from "@/lib/config";

function isValidDataFile(parsed: unknown): boolean {
  return (
    typeof parsed === "object" &&
    parsed !== null &&
    ("brews" in parsed || "beans" in parsed)
  );
}

export async function POST(req: Request) {
  const { action, filePath } = (await req.json()) as {
    action: "create" | "open";
    filePath: string;
  };

  if (!filePath || typeof filePath !== "string") {
    return NextResponse.json({ error: "filePath required" }, { status: 400 });
  }

  const resolved = filePath.startsWith("~")
    ? path.join(process.env.HOME ?? "/", filePath.slice(1))
    : path.resolve(filePath);

  if (action === "create") {
    if (fs.existsSync(resolved)) {
      return NextResponse.json(
        { error: "File already exists. Use 'open' to connect to it." },
        { status: 409 }
      );
    }
    const dir = path.dirname(resolved);
    if (!fs.existsSync(dir)) {
      return NextResponse.json(
        { error: `Directory does not exist: ${dir}` },
        { status: 400 }
      );
    }
    fs.writeFileSync(resolved, JSON.stringify({ brews: [], beans: [] }, null, 2));
    config.update({ dataFile: resolved });
    return NextResponse.json({ dataFile: resolved });
  }

  if (action === "open") {
    if (!fs.existsSync(resolved)) {
      return NextResponse.json(
        { error: `File not found: ${resolved}` },
        { status: 404 }
      );
    }
    try {
      const raw = fs.readFileSync(resolved, "utf-8");
      const parsed = JSON.parse(raw);
      if (!isValidDataFile(parsed)) {
        return NextResponse.json(
          { error: "File does not look like a coffee tracker data file (needs brews or beans arrays)." },
          { status: 400 }
        );
      }
      // Fill in missing keys without overwriting existing data
      if (!parsed.brews) parsed.brews = [];
      if (!parsed.beans) parsed.beans = [];
      fs.writeFileSync(resolved, JSON.stringify(parsed, null, 2));
    } catch {
      return NextResponse.json(
        { error: "Could not parse file as JSON." },
        { status: 400 }
      );
    }
    config.update({ dataFile: resolved });
    return NextResponse.json({ dataFile: resolved });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function DELETE() {
  config.update({ dataFile: null });
  return new NextResponse(null, { status: 204 });
}
