import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_PAYLOAD = "dayframe-authorized-v1";

export function sessionToken() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return "";
  return createHmac("sha256", secret).update(COOKIE_PAYLOAD).digest("hex");
}

export function validSession(value?: string) {
  const expected = sessionToken();
  if (!value || !expected || value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}
