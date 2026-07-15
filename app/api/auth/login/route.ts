import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { sessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  const configuredCode = process.env.DASHBOARD_ACCESS_CODE;
  const secret = process.env.AUTH_SECRET;
  if (!configuredCode || !secret) return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  const body = await request.json().catch(() => ({})) as { code?: string };
  const provided = String(body.code ?? "");
  const valid = provided.length === configuredCode.length && timingSafeEqual(Buffer.from(provided), Buffer.from(configuredCode));
  if (!valid) return NextResponse.json({ error: "Incorrect access code." }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set("dayframe_session", sessionToken(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return response;
}
