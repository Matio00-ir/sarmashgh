"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SoonBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { toFa } from "@/lib/fa";
import { cx } from "@/lib/cx";

export type GradeOption = {
  grade: string;
  title: string;
  available: boolean;
  streams: { id: string; title: string; available: boolean }[];
};

export function OnboardingForm(props: {
  grades: GradeOption[];
  initialName: string;
  initialGrade?: string;
  initialStream?: string;
  editing: boolean;
}) {
  const router = useRouter();
  const firstAvailable = props.grades.find((g) => g.available);
  const [step, setStep] = useState(0);
  const [name, setName] = useState(props.initialName);
  const [grade, setGrade] = useState(props.initialGrade ?? firstAvailable?.grade);
  const [stream, setStream] = useState(props.initialStream ?? firstAvailable?.streams.find((s) => s.available)?.id);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const current = props.grades.find((g) => g.grade === grade);
  const needsStream = Boolean(current?.streams.length);
  const steps = needsStream ? 3 : 2;

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, grade, stream: needsStream ? stream : null }),
      });
      if (!res.ok) {
        setError((await res.json().catch(() => ({}))).error ?? "ذخیره نشد.");
        setBusy(false);
        return;
      }
      router.replace("/learn");
      router.refresh();
    } catch {
      setError("اتصال برقرار نشد. دوباره امتحان کن.");
      setBusy(false);
    }
  }

  function next() {
    if (step === 0 && !name.trim()) return setError("اسمت را بنویس.");
    setError("");
    if (step + 1 < steps) setStep(step + 1);
    else submit();
  }

  const canNext =
    step === 0 ? name.trim().length > 0 : step === 1 ? Boolean(current?.available) : Boolean(stream);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        next();
      }}
    >
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-body-sm text-muted">
          <span>
            مرحله‌ی {toFa(step + 1)} از {toFa(steps)}
          </span>
          {props.editing && <span>ویرایش اطلاعات</span>}
        </div>
        <ProgressBar value={(step + 1) / steps} label="مراحل شروع" />
      </div>

      <div key={step} className="animate-rise">
        {step === 0 && (
          <>
            <h1 className="text-h1 font-bold">{props.editing ? "اطلاعاتت را ویرایش کن" : "خوش اومدی!"}</h1>
            <p className="mt-1 text-body text-subtle">بیا این مبحث‌ها رو از پایه با هم یاد بگیریم. اول بگو اسمت چیه؟</p>
            <label htmlFor="name" className="mt-6 mb-1.5 block text-label font-medium">
              نام
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder="مثلاً سارا"
              autoComplete="given-name"
              autoFocus
              className="min-h-13 w-full rounded-card border border-border bg-surface px-4 text-body-lg outline-none transition-colors focus:border-primary"
            />
          </>
        )}

        {step === 1 && (
          <fieldset>
            <legend className="text-h1 font-bold">پایه‌ات کدام است؟</legend>
            <p className="mt-1 text-body text-subtle">فعلاً پایه‌ی یازدهم فعال است؛ بقیه به‌زودی اضافه می‌شوند.</p>
            <div role="radiogroup" className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {props.grades.map((g) => (
                <Choice
                  key={g.grade}
                  label={g.title}
                  selected={grade === g.grade}
                  disabled={!g.available}
                  onSelect={() => {
                    setGrade(g.grade);
                    setStream(g.streams.find((s) => s.available)?.id);
                  }}
                />
              ))}
            </div>
          </fieldset>
        )}

        {step === 2 && current && (
          <fieldset>
            <legend className="text-h1 font-bold">رشته‌ات کدام است؟</legend>
            <p className="mt-1 text-body text-subtle">{current.title}</p>
            <div role="radiogroup" className="mt-6 grid gap-2.5">
              {current.streams.map((s) => (
                <Choice
                  key={s.id}
                  label={s.title}
                  selected={stream === s.id}
                  disabled={!s.available}
                  onSelect={() => setStream(s.id)}
                />
              ))}
            </div>
          </fieldset>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-body-sm text-danger-text">
          {error}
        </p>
      )}

      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => setStep(step - 1)}
            icon={<ArrowRight className="size-5" aria-hidden />}
          >
            قبلی
          </Button>
        )}
        <Button type="submit" size="lg" loading={busy} disabled={!canNext} className="flex-1">
          {step + 1 < steps ? "بعدی" : "شروع یادگیری"}
          {!busy && <ArrowLeft className="size-5" aria-hidden />}
        </Button>
      </div>
    </form>
  );
}

function Choice(props: { label: string; selected: boolean; disabled: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={props.selected}
      aria-disabled={props.disabled}
      disabled={props.disabled}
      onClick={props.onSelect}
      className={cx(
        "flex min-h-14 items-center gap-3 rounded-card border-2 px-4 text-start text-body font-medium transition-colors",
        props.selected
          ? "border-primary bg-[color-mix(in_srgb,var(--brand-primary)_8%,var(--surface))]"
          : "border-border-subtle bg-surface hover:border-border",
        props.disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <span
        className={cx(
          "grid size-5 shrink-0 place-items-center rounded-full border-2",
          props.selected ? "border-primary bg-primary text-on-primary" : "border-border",
        )}
        aria-hidden
      >
        {props.selected && <Check className="size-3" strokeWidth={3} />}
      </span>
      <span className="flex-1">{props.label}</span>
      {props.disabled && <SoonBadge />}
    </button>
  );
}
