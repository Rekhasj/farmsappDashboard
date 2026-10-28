import { redirect } from "next/navigation";
import QueriesView from "@/features/profile/QueriesView";
import { getUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Post Query (RN components/CommonQueryDisplay.js). */
export default async function QueriesPage() {
  if (!(await getUser())) redirect("/login?next=/queries");
  return <QueriesView />;
}
