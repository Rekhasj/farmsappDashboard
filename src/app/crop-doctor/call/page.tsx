import { redirect } from "next/navigation";
import CallFlow from "@/features/doctor/CallFlow";
import { getUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Crop Doctor video call flow (RN SelectCropsPage → language → waiting → call → feedback → thank you). */
export default async function CropDoctorCallPage() {
  if (!(await getUser())) redirect("/login?next=/crop-doctor");
  return <CallFlow />;
}
