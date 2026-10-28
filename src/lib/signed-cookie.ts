/**
 * SERVER-ONLY. Tamper-proof cookie values: base64url(JSON) + "." + HMAC-SHA256.
 * The backend trusts any farmerId it's given (there is no per-user token),
 * so the website must make sure a visitor can't just edit a cookie to become
 * another farmer — every identity cookie goes through here.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET is not set (or too short) — see .env.example.");
  return s;
}

const mac = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

/** `maxAgeSeconds` is baked into the signed value, so an old cookie can't be replayed after it expires. */
export function sign<T extends object>(value: T, maxAgeSeconds: number): string {
  const payload = Buffer.from(JSON.stringify({ v: value, exp: Date.now() + maxAgeSeconds * 1000 })).toString("base64url");
  return `${payload}.${mac(payload)}`;
}

export function verify<T>(token: string | undefined): T | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const given = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(mac(payload));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const { v, exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { v: T; exp: number };
    return typeof exp === "number" && exp > Date.now() ? v : null;
  } catch {
    return null;
  }
}
