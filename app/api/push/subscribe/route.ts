import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type PushSubscriptionJSON = { endpoint: string; expirationTime?: number | null; keys?: { p256dh?: string; auth?: string } };

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const body = await request.json() as { subscription?: PushSubscriptionJSON; deviceName?: string };
  if (!body.subscription?.endpoint || !body.subscription.keys?.p256dh || !body.subscription.keys?.auth) return NextResponse.json({ error: "Invalid push subscription." }, { status: 400 });
  const { error } = await supabase.from("push_subscriptions").upsert({ endpoint: body.subscription.endpoint, subscription: body.subscription, device_name: String(body.deviceName ?? "Browser").slice(0, 80), active: true, updated_at: new Date().toISOString() }, { onConflict: "endpoint" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
