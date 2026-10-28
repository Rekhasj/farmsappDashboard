import { redirect } from "next/navigation";
import ProfileView from "@/features/profile/ProfileView";
import { getUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Profile (RN pages/ProfilePage.js). */
export default async function ProfilePage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/profile");
  return <ProfileView name={user.name ?? null} mobile={user.mobile} />;
}
