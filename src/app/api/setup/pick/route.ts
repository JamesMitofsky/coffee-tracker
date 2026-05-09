import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(req: Request) {
  const { action } = (await req.json()) as { action: "create" | "open" };

  const script =
    action === "create"
      ? `osascript -e 'POSIX path of (choose file name with prompt "Choose where to save your coffee data" default name "coffee-brews.json")'`
      : `osascript -e 'POSIX path of (choose file with prompt "Select your coffee data file" of type {"json"})'`;

  try {
    const { stdout } = await execAsync(script);
    const filePath = stdout.trim();
    if (!filePath) return NextResponse.json({ filePath: null });
    return NextResponse.json({ filePath });
  } catch {
    // User cancelled the dialog
    return NextResponse.json({ filePath: null });
  }
}
