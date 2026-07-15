import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { DashboardState } from "@/lib/types";

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ configured: false });
  const { data, error } = await supabase.from("dashboard_state").select("state").eq("id", "shared").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ configured: true, state: data?.state ?? null });
}

export async function PUT(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ configured: false });
  const state = await request.json() as DashboardState;
  if (!state || state.version !== 2 || !Array.isArray(state.tasks) || !Array.isArray(state.projects)) return NextResponse.json({ error: "Invalid dashboard state." }, { status: 400 });
  const { error } = await supabase.from("dashboard_state").upsert({ id: "shared", state, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ configured: true, ok: true });
}
