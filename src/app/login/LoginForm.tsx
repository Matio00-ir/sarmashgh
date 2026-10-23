"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, Pencil, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { normalizePhone, toEnDigits, toFa } from "@/lib/fa";
import { cx } from "@/lib/cx";

const CODE_LENGTH = 5;
const RESEND_SECONDS = 60;

async function post(url: string, body: object): Promise<{ ok: boolean; data: Record<string, string> }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { ok: res.ok, data: await res.json().catch(() => ({})) };
  } catch {
    return { ok: false, data: { error: "اتصال برقرار نشد. اینترنتت را بررسی کن." } };
  }
}

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code" | "done">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  // شمارش معکوس ارسال دوباره
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function requestCode() {
    setError("");
    if (!normalizePhone(phone)) return setError("شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.");
    setBusy(true);
    const { ok, data } = await post("/api/auth/request", { phone });
    setBusy(false);
    if (!ok) return setError(data.error ?? "ارسال کد ناموفق بود.");
    setPhone(data.phone);
    setDevCode(data.devCode);
    setCode("");
    setWait(RESEND_SECONDS);
    setStep("code");
    setTimeout(() => codeRef.current?.focus(), 50);
  }

  async function verify(value = code) {
    if (value.length < CODE_LENGTH || busy) return;
    setError("");
    setBusy(true);
    const { ok, data } = await post("/api/auth/verify", { phone, code: value });
    setBusy(false);
    if (!ok) {
      setError(data.error ?? "کد درست نیست.");
      setCode("");
      codeRef.current?.focus();
      return;
    }
    setStep("done");
    router.replace(data.next);
    router.refresh();
  }

  if (step === "done") {
    return (
      <div role="status" className="animate-rise py-6 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-success-bg text-success">
          <CircleCheck className="size-8" aria-hidden />
        </span>
        <p className="mt-3 text-h4 font-semibold">وارد شدی!</p>
        <p className="mt-1 text-body-sm text-muted">در حال باز کردن درس‌ها…</p>
      </div>
    );
  }

  if (step === "phone") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          requestCode();
        }}
        noValidate
      >
        <span className="grid size-12 place-items-center rounded-card bg-[color-mix(in_srgb,var(--brand-primary)_12%,transparent)] text-primary">
          <Smartphone className="size-6" aria-hidden />
        </span>
        <h1 className="mt-4 text-h2 font-bold">ورود یا ثبت‌نام</h1>
        <p className="mt-1 text-body text-subtle">شماره موبایلت را بنویس تا کد ورود برایت پیامک شود.</p>

        <label htmlFor="phone" className="mt-6 mb-1.5 block text-label font-medium">
          شماره موبایل
        </label>
        <div
          dir="ltr"
          className={cx(
            "flex min-h-13 items-center overflow-hidden rounded-card border bg-background transition-colors focus-within:border-primary",
            error ? "border-danger" : "border-border",
          )}
        >
          <span className="border-e border-border px-3 text-body text-muted">+98</span>
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="912 345 6789"
            value={phone}
            onChange={(e) => setPhone(toEnDigits(e.target.value).replace(/[^\d+\s]/g, ""))}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "login-error" : undefined}
            className="h-13 flex-1 bg-transparent px-3 text-h4 tracking-wider outline-none placeholder:text-muted/60"
            autoFocus
          />
        </div>
        {error && (
          <p id="login-error" role="alert" className="mt-2 text-body-sm text-danger-text">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" loading={busy} disabled={!phone.trim()} className="mt-5 w-full">
          {busy ? "در حال ارسال کد…" : "دریافت کد ورود"}
        </Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        verify();
      }}
      noValidate
    >
      <h1 className="text-h2 font-bold">کد ورود</h1>
      <p className="mt-1 text-body text-subtle">
        کد {toFa(CODE_LENGTH)} رقمی پیامک‌شده به{" "}
        <span dir="ltr" className="font-semibold text-foreground">
          {toFa(phone)}
        </span>{" "}
        را وارد کن.
      </p>
      <button
        type="button"
        onClick={() => {
          setStep("phone");
          setError("");
        }}
        className="mt-1 inline-flex min-h-10 items-center gap-1 text-label font-medium text-link"
      >
        <Pencil className="size-3.5" aria-hidden />
        اصلاح شماره
      </button>

      {devCode && (
        <p className="mt-4 rounded-card bg-warning-bg p-3 text-body-sm text-warning-text">
          حالت توسعه (سرویس پیامک وصل نیست). کد: <b dir="ltr" className="tracking-widest">{devCode}</b>
        </p>
      )}

      {/* یک ورودی واقعی روی خانه‌های نمایشی؛ پشتیبانی از چسباندن و پرشدن خودکار کد پیامکی */}
      <label htmlFor="otp" className="sr-only">
        کد ورود
      </label>
      <div dir="ltr" className="relative mt-5">
        <input
          id="otp"
          ref={codeRef}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={CODE_LENGTH}
          value={code}
          onChange={(e) => {
            const v = toEnDigits(e.target.value).replace(/\D/g, "").slice(0, CODE_LENGTH);
            setCode(v);
            setError("");
            if (v.length === CODE_LENGTH) verify(v);
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "otp-error" : undefined}
          className="absolute inset-0 z-10 w-full cursor-text opacity-0"
        />
        <div className="grid grid-cols-5 gap-2" aria-hidden>
          {Array.from({ length: CODE_LENGTH }, (_, i) => {
            const active = i === Math.min(code.length, CODE_LENGTH - 1);
            return (
              <span
                key={i}
                className={cx(
                  "grid h-14 place-items-center rounded-card border-2 bg-background text-h2 font-semibold transition-colors",
                  error ? "border-danger" : active ? "border-primary" : code[i] ? "border-border" : "border-border-subtle",
                )}
              >
                {code[i] ?? ""}
              </span>
            );
          })}
        </div>
      </div>
      {error && (
        <p id="otp-error" role="alert" className="mt-2 text-body-sm text-danger-text">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" loading={busy} disabled={code.length < CODE_LENGTH} className="mt-5 w-full">
        {busy ? "در حال بررسی…" : "ورود"}
      </Button>

      <div className="mt-4 text-center text-body-sm text-muted">
        {wait > 0 ? (
          <span aria-live="polite">ارسال دوباره تا {toFa(wait)} ثانیه‌ی دیگر</span>
        ) : (
          <button type="button" onClick={requestCode} disabled={busy} className="min-h-10 font-medium text-link">
            کد نرسید؟ ارسال دوباره
          </button>
        )}
      </div>
    </form>
  );
}
