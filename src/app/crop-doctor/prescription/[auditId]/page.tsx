import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PrescriptionView from "@/features/doctor/PrescriptionView";
import { CALL_COOKIE } from "@/app/api/doctor/route-shared";
import { getUser } from "@/lib/session";
import { verify } from "@/lib/signed-cookie";
import { fetchCallHistory, fetchPrescription } from "@/services/farmsapp";

export const dynamic = "force-dynamic";

/**
 * Crop Care Prescription (RN components/ViewPrescription.js). Only for the
 * farmer's own calls: one in their call history, or the call this browser just made.
 */
export default async function PrescriptionPage({ params }: { params: Promise<{ auditId: string }> }) {
  const { auditId: raw } = await params;
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/crop-doctor/prescription/${raw}`)}`);
  const auditId = Number(raw);

  const justMade = verify<{ auditId: number; farmerId: number }>((await cookies()).get(CALL_COOKIE)?.value);
  const own =
    (justMade?.auditId === auditId && justMade.farmerId === user.farmerId) ||
    ((await fetchCallHistory(user.farmerId)) ?? []).some((h) => h.auditId === auditId);
  const prescription = own && Number.isInteger(auditId) ? await fetchPrescription(auditId) : null;
  return <PrescriptionView prescription={prescription} />;
}
