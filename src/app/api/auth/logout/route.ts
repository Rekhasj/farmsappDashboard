import { NextResponse } from "next/server";
import { endSession } from "@/lib/auth";

/** POST — logs out (RN ProfilePage: clears stored session; no backend call). */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  endSession(res);
  return res;
}
