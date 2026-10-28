import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import { getT } from "@/i18n/server";
import { getSession } from "@/lib/session";
import { fetchContactUs } from "@/services/farmsapp";

export const dynamic = "force-dynamic";

const digits = (v?: string) => (v ?? "").replace(/[^\d+]/g, "");

/** Contact Us (RN pages/ContactUsPage.jsx): call, email and WhatsApp from the contact-us API. */
export default async function ContactPage() {
  const [{ farmerId }, t] = await Promise.all([getSession(), getT()]);
  const c = await fetchContactUs(farmerId);
  const wa = digits(c?.whatsappNumber).replace(/^\+/, "");
  const cards = [
    c?.customerCareNumber && {
      icon: "📞",
      label: t("contact.support"),
      value: t("contact.hours"),
      href: `tel:${digits(c.customerCareNumber)}`,
      cta: c.customerCareNumber,
    },
    c?.customerCareEmail && {
      icon: "✉️",
      label: t("contact.email"),
      value: c.customerCareEmail,
      href: `mailto:${c.customerCareEmail}`,
      cta: t("contact.sendEmail"),
    },
    wa && {
      icon: "💬",
      label: t("contact.whatsapp"),
      value: c!.whatsappNumber!,
      // RN uses whatsapp://send; the web uses wa.me (opens the app or WhatsApp Web).
      href: `https://wa.me/${wa.length === 10 ? `91${wa}` : wa}?text=Hi`,
      cta: t("contact.sendMessage"),
    },
  ].filter(Boolean) as { icon: string; label: string; value: string; href: string; cta: string }[];

  return (
    <PageShell title={t("contact.title")} back="/profile" width="max-w-5xl">
      {/* Desktop hero — phones keep the app's plain list. */}
      <section className="hidden items-center justify-between gap-6 rounded-2xl bg-linear-to-r from-[#1f4529] to-[#2e6b3d] px-10 py-8 text-white md:flex">
        <div>
          <p className="text-2xl font-extrabold">{t("contact.title")}</p>
          <p className="mt-1 text-sm text-white/85">{t("contact.subtitle")}</p>
          <p className="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">🕘 {t("contact.hours")}</p>
        </div>
        <span className="text-7xl" aria-hidden>
          🌾
        </span>
      </section>
      {cards.length === 0 ? (
        <p className="pt-16 text-center text-sm text-[#6a7282]">{t("common.pageLoadFailed")}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <section key={card.label} className="flex flex-col rounded-2xl border border-[#eee] bg-white p-5 md:p-7 md:shadow-sm">
              <span className="flex size-11 items-center justify-center rounded-full bg-[#eef7ec] text-xl md:size-14 md:text-2xl" aria-hidden>
                {card.icon}
              </span>
              <h2 className="mt-3 text-sm font-bold text-[#202020] md:mt-4 md:text-base">{card.label}</h2>
              <p className="mt-1 flex-1 break-words text-xs text-[#6a7282]">{card.value}</p>
              <a
                href={card.href}
                target={card.href.startsWith("https://") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="mt-4 flex h-10 items-center justify-center rounded-lg bg-[#1f4529] px-3 text-sm font-bold text-white hover:bg-[#2e5b3a]"
              >
                {card.cta}
              </a>
            </section>
          ))}
        </div>
      )}
      {/* Desktop: the rest of Help & Support, so the page isn't a dead end. */}
      <div className="hidden gap-4 md:grid md:grid-cols-2">
        {[
          { href: "/queries", icon: "💬", title: t("query.title"), text: t("query.placeholder") },
          { href: "/product-enquiry", icon: "📝", title: t("enquiry.title"), text: t("enquiry.notFound") },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="flex items-center gap-4 rounded-2xl border border-[#eee] bg-white p-5 hover:border-[#b9d3bd] hover:bg-[#fafdf9]">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#eef7ec] text-xl" aria-hidden>
              {l.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-[#202020]">{l.title}</span>
              <span className="block truncate text-xs text-[#6a7282]">{l.text}</span>
            </span>
            <span className="text-xl text-[#1f4529]" aria-hidden>
              ›
            </span>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
