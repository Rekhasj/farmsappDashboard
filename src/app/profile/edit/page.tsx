import { redirect } from "next/navigation";
import EditProfileForm from "@/features/profile/EditProfileForm";
import { getUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Edit Profile (RN pages/PersonalInfo.js): name only; mobile is read-only. */
export default async function EditProfilePage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/profile/edit");
  return <EditProfileForm name={user.name ?? ""} mobile={user.mobile} />;
}
