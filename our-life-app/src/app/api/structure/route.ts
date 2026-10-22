import { NextRequest, NextResponse } from "next/server";
import { structureEntry } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { text } = body as { text: string };

  if (!text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  const ai = await structureEntry(text);
  return NextResponse.json({ ai });
}
