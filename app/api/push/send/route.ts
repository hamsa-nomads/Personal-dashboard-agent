import { NextResponse } from "next/server";
import { sendDueReminders } from "@/lib/push";

async function handler(request: Request) {
  const expected = process.env.CRON_SECRET;
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? new URL(request.url).searchParams.get("secret") ?? "";
  if (!expected || provided !== expected) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json(await sendDueReminders()); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Push failed" }, { status: 500 }); }
}

export const GET = handler;
export const POST = handler;
