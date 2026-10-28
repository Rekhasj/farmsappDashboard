import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUser } from "@/lib/session";
import { verify } from "@/lib/signed-cookie";
import { sendCallFeedback } from "@/services/farmsapp";
import { CALL_COOKIE } from "../route-shared";

/**
 * PUT { auditId, issueResolved, comments } — RN FeedbackScreen after the video
 * call. Only for the call this browser just started (signed cookie set by POST /api/doctor).
 */
export async function PUT(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ login: true }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { auditId?: unknown; issueResolved?: unknown; comments?: unknown } | null;
  const auditId = Number(body?.auditId);
  const issueResolved = body?.issueResolved === true;
  const comments = typeof body?.comments === "string" ? body.comments.trim().slice(0, 100) : "";
  if (!issueResolved && !comments) return NextResponse.json({ ok: false, error: "feedback" }, { status: 400 });

  const call = verify<{ auditId: number; farmerId: number }>((await cookies()).get(CALL_COOKIE)?.value);
  if (!call || call.auditId !== auditId || call.farmerId !== user.farmerId) return NextResponse.json({ ok: false }, { status: 404 });

  const ok = await sendCallFeedback(auditId, issueResolved, comments);
  return NextResponse.json({ ok }, { status: ok ? 200 : 502 });
}
