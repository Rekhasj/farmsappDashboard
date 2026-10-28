import { redirect } from "next/navigation";
import EnquiryForm from "@/features/profile/EnquiryForm";
import { getUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Product Enquiry / Request Product (RN pages/ProductEnquiryPage.js). */
export default async function ProductEnquiryPage() {
  if (!(await getUser())) redirect("/login?next=/product-enquiry");
  return <EnquiryForm />;
}
