import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Block } from "@/lib/types";

function scheduledIso(date: string, time: string, offsetMinutes: number) {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours, minutes) + offsetMinutes * 60_000).toISOString();
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const body = await request.json() as { date?: string; blocks?: Block[]; offsetMinutes?: number };
  if (!body.date || !Array.isArray(body.blocks)) return NextResponse.json({ error: "Invalid schedule." }, { status: 400 });
  const offset = Number.isFinite(body.offsetMinutes) ? Number(body.offsetMinutes) : 0;
  const rows = body.blocks.map((block) => ({ dedupe_key: `${body.date}:${block.id}:${block.start}`, scheduled_for: scheduledIso(body.date!, block.start, offset), title: block.type === "break" ? "Take a break" : block.type === "life" ? "Life block" : "Start focus", body: block.label, url: "/", sent_at: null }));
  const { error } = await supabase.from("reminders").upsert(rows, { onConflict: "dedupe_key" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, scheduled: rows.length });
}
