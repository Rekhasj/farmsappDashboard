import { redirect } from "next/navigation";
import CropDoctorView from "@/features/doctor/CropDoctorView";
import { getLocale } from "@/i18n/server";
import { languageName } from "@/i18n/config";
import { getUser } from "@/lib/session";
import { fetchCallHistory, fetchExpertService } from "@/services/farmsapp";

export const dynamic = "force-dynamic";

/** Crop Doctor home (RN pages/CropDoctor.js): availability, Video Call Now, toll-free, call history. */
export default async function CropDoctorPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/crop-doctor");
  const [service, history, locale] = await Promise.all([fetchExpertService(user.farmerId), fetchCallHistory(user.farmerId), getLocale()]);

  // RN HolidayTextDisplay: expertUnavailableText / holidayText, with a {Language} suffix except English.
  const lang = locale === "en" ? "" : languageName(locale);
  const pick = (base: string) => {
    const v = service?.[`${base}${lang}`] ?? service?.[base];
    return typeof v === "string" ? v : "";
  };
  const status = !service
    ? null
    : service.holiday
      ? { kind: "holiday" as const, text: pick("holidayText") }
      : service.expertAvailable
        ? { kind: "open" as const, text: service.videoCallMessage ?? "" }
        : { kind: "closed" as const, text: pick("expertUnavailableText"), dayFrom: service.dayFrom, dayTo: service.dayTo };

  return (
    <CropDoctorView
      status={status}
      canCall={!!service?.videoCallEnabled && !service.holiday && !!service.expertAvailable}
      tollFree={service?.tollFreeNumber || "18001212333"}
      history={history ?? []}
    />
  );
}
