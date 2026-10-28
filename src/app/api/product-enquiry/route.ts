import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { requestProduct } from "@/services/farmsapp";

const MAX_IMAGES = 3;
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * POST multipart { productName, moleculeName, productDescription, images[] }
 * — RN ProductEnquiryPage "Request Product". The same limits as the app are
 * checked again here (one name required, ≤3 images, ≤5 MB each, images only).
 */
export async function POST(request: Request) {
  const { user, storeId } = await getSession();
  if (!user) return NextResponse.json({ ok: false, login: true }, { status: 401 });

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ ok: false, error: "Invalid form" }, { status: 400 });
  const field = (k: string, max: number) => String(form.get(k) ?? "").trim().slice(0, max);
  const productName = field("productName", 120);
  const moleculeName = field("moleculeName", 120);
  const productDescription = field("productDescription", 1000);
  if (!productName && !moleculeName) return NextResponse.json({ ok: false, error: "oneRequired" }, { status: 400 });

  const images = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (images.length > MAX_IMAGES) return NextResponse.json({ ok: false, error: "max3" }, { status: 400 });
  if (images.some((f) => f.size > MAX_BYTES || !f.type.startsWith("image/"))) {
    return NextResponse.json({ ok: false, error: "tooBig" }, { status: 400 });
  }

  const ok = await requestProduct({ farmerId: user.farmerId, storeId, productName, moleculeName, productDescription, images });
  return NextResponse.json({ ok }, { status: ok ? 200 : 502 });
}
