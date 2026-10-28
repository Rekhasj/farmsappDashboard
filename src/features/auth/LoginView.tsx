"use client";

import { useEffect, useRef, useState } from "react";
import BackLink from "@/components/layout/BackLink";
import { IconArrowLeft } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/Skeletons";
import { useT } from "@/i18n/I18nProvider";

const OTP_LENGTH = 4; // RN constants/auth.js
const RESEND_SECONDS = 30; // RN useSignInFlow RESEND_TIMEOUT
const ERROR_CLEAR_MS = 1000; // RN OTP_ERROR_DISPLAY_MS

type Step = "mobile" | "otp" | "pincode";

async function post(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; needPincode?: boolean; restart?: boolean };
  return { ...data, ok: res.ok && data.ok !== false };
}

/** Logged in: full load so every server component and the cart pick up the new farmer. */
function finish(next: string) {
  window.location.assign(next);
}

/**
 * RN SignInPage flow: LoginForm (10-digit mobile → Get OTP), OtpContainer
 * (4 boxes, auto-submit, 30 s resend), then PincodeSelectionScreen for a new
 * farmer when the backend asks for one.
 */
export default function LoginView({ next }: { next: string }) {
  const t = useT();
  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");

  return (
    <div className="flex min-h-screen flex-col bg-white md:min-h-[calc(100dvh-4.5rem)] md:items-center md:justify-center md:bg-[#f5f5f5] md:py-12">
      <div className="flex flex-1 flex-col md:w-full md:max-w-md md:flex-none md:overflow-hidden md:rounded-2xl md:border md:border-[#eee] md:bg-white md:pb-8 md:shadow-sm">
      <header className="flex items-center gap-3 border-b border-[#eee] px-4 py-3">
        {step === "otp" ? (
          <button
            type="button"
            onClick={() => setStep("mobile")}
            aria-label={t("common.back")}
            className="flex size-8 items-center justify-center rounded-full border border-[#eee]"
          >
            <IconArrowLeft className="size-4" />
          </button>
        ) : step === "mobile" ? (
          <BackLink href="/" aria-label={t("common.backToHome")} className="flex size-8 items-center justify-center rounded-full border border-[#eee]">
            <IconArrowLeft className="size-4" />
          </BackLink>
        ) : null}
        <h1 className="text-sm font-bold text-[#202020]">{step === "otp" ? t("auth.otpTitle") : t("auth.login")}</h1>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-5 pt-8">
        <div className="mx-auto mb-8 flex size-16 items-center justify-center rounded-2xl bg-[#eef7ec]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="FarmsApp" className="size-11 object-contain" />
        </div>
        {step === "mobile" && <MobileStep mobile={mobile} setMobile={setMobile} onSent={() => setStep("otp")} />}
        {step === "otp" && (
          <OtpStep mobile={mobile} next={next} onNeedPincode={() => setStep("pincode")} onChangeNumber={() => setStep("mobile")} />
        )}
        {step === "pincode" && <PincodeStep next={next} onRestart={() => setStep("mobile")} />}
      </main>
      </div>
    </div>
  );
}

function MobileStep({ mobile, setMobile, onSent }: { mobile: string; setMobile: (v: string) => void; onSent: () => void }) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const valid = /^\d{10}$/.test(mobile);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!mobile) return setError(t("auth.enterMobileError"));
    if (!valid) return setError(t("auth.invalidMobile"));
    setBusy(true);
    setError("");
    const r = await post("/api/auth/otp", { mobile });
    setBusy(false);
    if (!r.ok) return setError(r.error || t("location.errorGeneric"));
    onSent();
  }

  return (
    <form onSubmit={submit} noValidate>
      <h2 className="text-lg font-bold text-[#202020]">{t("auth.enterMobileTitle")}</h2>
      <p className="mt-1 text-xs text-[#6a7282]">{t("auth.otpDescription")}</p>
      <label className={`mt-6 flex h-12 items-center gap-2 rounded-lg border px-3 ${error ? "border-[#c80000]" : "border-[#e5e5e5] focus-within:border-[#1f4529]"}`}>
        <span className="text-sm font-semibold text-[#202020]" aria-hidden>
          🇮🇳 +91
        </span>
        <span className="h-5 w-px bg-[#e5e5e5]" aria-hidden />
        <input
          value={mobile}
          onChange={(e) => {
            setError("");
            setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
          }}
          inputMode="numeric"
          autoComplete="tel-national"
          autoFocus
          maxLength={10}
          placeholder={t("auth.mobilePlaceholder")}
          aria-label={t("auth.mobilePlaceholder")}
          aria-invalid={!!error}
          className="min-w-0 flex-1 bg-transparent text-sm tracking-wide outline-none"
        />
        <span className={`text-sm ${valid ? "text-[#1f6b3a]" : "text-[#ccc]"}`} aria-hidden>
          ✓
        </span>
      </label>
      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-[#c80000]">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!valid || busy}
        className="mt-6 h-12 w-full rounded-lg bg-[#1f4529] text-sm font-bold text-white disabled:opacity-50"
      >
        {busy ? t("common.loading") : t("auth.getOtp")}
      </button>
    </form>
  );
}

function OtpStep({
  mobile,
  next,
  onNeedPincode,
  onChangeNumber,
}: {
  mobile: string;
  next: string;
  onNeedPincode: () => void;
  onChangeNumber: () => void;
}) {
  const t = useT();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [notice, setNotice] = useState(t("auth.otpSent"));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  async function verify(code: string) {
    setBusy(true);
    setError("");
    const r = await post("/api/auth/verify", { mobile, otp: code });
    if (r.ok && r.needPincode) return onNeedPincode();
    if (r.ok) return finish(next);
    setBusy(false);
    setError(r.error || t("location.errorGeneric"));
    // RN: show the error, then clear the boxes for another try.
    setTimeout(() => {
      setOtp("");
      inputRef.current?.focus();
    }, ERROR_CLEAR_MS);
  }

  async function resend() {
    setSeconds(RESEND_SECONDS);
    setError("");
    const r = await post("/api/auth/otp", { mobile });
    if (r.ok) setNotice(t("auth.otpSent"));
    else setError(r.error || t("location.errorGeneric"));
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-[#202020]">{t("auth.enterOtp")}</h2>
      <p className="mt-1 text-xs text-[#6a7282]">
        {t("auth.otpSentTo")} <span className="font-semibold text-[#202020]">+91 {mobile}</span>{" "}
        <button type="button" onClick={onChangeNumber} className="font-bold text-[#1f4529] underline">
          {t("auth.change")}
        </button>
      </p>
      {notice && !error && <p className="mt-3 text-xs font-semibold text-[#1f6b3a]">{notice}</p>}

      {/* One real input (so SMS autofill / paste work) drawn as 4 boxes. */}
      <div className="relative mt-6" onClick={() => inputRef.current?.focus()}>
        <input
          ref={inputRef}
          value={otp}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH);
            setOtp(v);
            setError("");
            if (v.length === OTP_LENGTH && !busy) void verify(v);
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={OTP_LENGTH}
          disabled={busy}
          aria-label={t("auth.enterOtp")}
          aria-invalid={!!error}
          className="absolute inset-0 z-10 opacity-0"
        />
        <div className="flex justify-center gap-3" aria-hidden>
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <span
              key={i}
              className={`flex size-14 items-center justify-center rounded-xl border-2 text-xl font-bold ${
                error ? "border-[#c80000] text-[#c80000]" : i === otp.length ? "border-[#1f4529]" : "border-[#e5e5e5]"
              }`}
            >
              {otp[i] ?? ""}
            </span>
          ))}
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-center text-xs font-medium text-[#c80000]">
          {error}
        </p>
      )}
      {busy && (
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#6a7282]">
          <Spinner className="size-4" /> {t("auth.verifying")}
        </p>
      )}

      <p className="mt-8 text-center text-xs text-[#6a7282]">
        {t("auth.otpNotReceived")}{" "}
        <button type="button" onClick={resend} disabled={seconds > 0} className="font-bold text-[#1f4529] disabled:text-[#9a9a9a]">
          {t("auth.resend")}
          {seconds > 0 ? ` (${String(seconds).padStart(2, "0")}s)` : ""}
        </button>
      </p>
    </div>
  );
}

function PincodeStep({ next, onRestart }: { next: string; onRestart: () => void }) {
  const t = useT();
  const [pincode, setPincode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<null | "gps" | "save">(null);

  async function save(code: string) {
    setBusy("save");
    setError("");
    const r = await post("/api/auth/signup", { pincode: code });
    if (r.ok) return finish(next);
    setBusy(null);
    if (r.restart) return onRestart();
    setError(r.error || t("location.errorGeneric"));
  }

  function onChange(value: string) {
    setError("");
    if (!/^\d*$/.test(value)) return setError(t("location.errorDigits"));
    if (value.startsWith("0")) return setError(t("location.errorPincode"));
    setPincode(value.slice(0, 6));
  }

  function useGps() {
    if (!navigator.geolocation) return setError(t("location.errorUnsupported"));
    setBusy("gps");
    setError("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(`/api/location?lat=${coords.latitude}&lng=${coords.longitude}`);
          const data = (await res.json().catch(() => ({}))) as { pincode?: string };
          if (!res.ok || !data.pincode) throw new Error();
          setPincode(data.pincode);
          await save(data.pincode);
        } catch {
          setError(t("location.errorNoPincode"));
          setBusy(null);
        }
      },
      (err) => {
        setError(err.code === err.PERMISSION_DENIED ? t("location.errorDenied") : t("location.errorFailed"));
        setBusy(null);
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 10000 },
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-[#202020]">{t("auth.pincodeTitle")}</h2>
      <button
        type="button"
        onClick={useGps}
        disabled={!!busy}
        className="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-[#1f4529] text-sm font-bold text-white disabled:opacity-60"
      >
        {busy === "gps" ? t("location.fetching") : t("location.useCurrent")}
      </button>
      <div className="relative my-6 flex items-center justify-center">
        <span className="absolute inset-x-0 h-px bg-[#f3f4f6]" />
        <span className="relative bg-white px-2.5 text-[10px] uppercase text-[#99a1af]">{t("auth.or")}</span>
      </div>
      <p className="text-sm font-semibold text-[#202020]">{t("auth.pincodeManual")}</p>
      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^[1-9]\d{5}$/.test(pincode)) return setError(t("location.errorPincode"));
          void save(pincode);
        }}
      >
        <input
          value={pincode}
          onChange={(e) => onChange(e.target.value)}
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          placeholder={t("location.pincodePlaceholder")}
          aria-invalid={!!error}
          disabled={!!busy}
          className={`h-12 min-w-0 flex-1 rounded-lg border px-3 text-sm outline-none ${error ? "border-[#c80000]" : "border-[#e5e5e5] focus:border-[#1f4529]"}`}
        />
        <button type="submit" disabled={!!busy || pincode.length !== 6} className="h-12 rounded-lg bg-[#1f4529] px-5 text-sm font-bold text-white disabled:opacity-50">
          {busy === "save" ? "…" : t("auth.check")}
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-[#c80000]">
          {error}
        </p>
      )}
      <div className="mt-8 rounded-xl bg-[#f6faf6] p-4">
        <p className="text-xs font-bold text-[#202020]">{t("auth.whyLocation")}</p>
        <p className="mt-1 text-[11px] leading-5 text-[#6a7282]">{t("auth.locationDisclaimer")}</p>
      </div>
    </div>
  );
}
