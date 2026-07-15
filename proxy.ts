import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/login", "/api/auth/login", "/api/push/send", "/manifest.webmanifest", "/sw.js", "/icon.svg", "/icon-192.png", "/icon-512.png", "/apple-icon.png"];

async function expectedToken(secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("dayframe-authorized-v1"));
  return Array.from(new Uint8Array(signature)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (publicPaths.some((path) => pathname === path || pathname.startsWith("/_next/") || pathname.startsWith("/favicon"))) return NextResponse.next();
  const secret = process.env.AUTH_SECRET;
  if (!secret) return NextResponse.next();
  const provided = request.cookies.get("dayframe_session")?.value ?? "";
  const expected = await expectedToken(secret);
  if (safeEqual(provided, expected)) return NextResponse.next();
  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const login = new URL("/login", request.url);
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };
