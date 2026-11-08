import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE_NAME = "escale_admin";

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function secret(): string {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
}

/** Jeton de session : signature HMAC, invalidé si le secret change. */
export function makeToken(): string {
  return createHmac("sha256", secret()).update("escale-admin-v1").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // On compare des empreintes de même longueur pour éviter les fuites de timing.
  const hash = (s: string) => createHmac("sha256", "escale-pw").update(s).digest();
  return timingSafeEqual(hash(input), hash(expected));
}

export async function isAdmin(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const jar = await cookies();
  const value = jar.get(COOKIE_NAME)?.value;
  return Boolean(value) && safeEqual(value as string, makeToken());
}
