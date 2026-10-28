import { redirect } from "next/navigation";
import LoginView from "@/features/auth/LoginView";
import { safeNext } from "@/lib/safe-next";
import { getUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Sign in (RN modules/auth/screens/SignInPage.js): mobile → OTP → pincode for new farmers. */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await getUser()) redirect(next);
  return <LoginView next={next} />;
}
