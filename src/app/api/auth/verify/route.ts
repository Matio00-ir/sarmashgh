import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizePhone, toEnDigits } from "@/lib/fa";
import { startSession } from "@/lib/auth";
import { getTrack } from "@/lib/catalog";
import { hashCode } from "@/lib/otp";

const MAX_ATTEMPTS = 5;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const phone = normalizePhone(String(body.phone ?? ""));
  const code = toEnDigits(String(body.code ?? "")).trim();
  if (!phone || !/^\d{5}$/.test(code)) {
    return NextResponse.json({ error: "کد را درست وارد کن" }, { status: 400 });
  }

  const otp = await db.otpCode.findFirst({ where: { phone }, orderBy: { createdAt: "desc" } });
  if (!otp || otp.expiresAt < new Date() || otp.attempts >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "کد منقضی شده؛ دوباره درخواست بده" }, { status: 400 });
  }

  const ok = timingSafeEqual(Buffer.from(otp.codeHash), Buffer.from(hashCode(phone, code)));
  if (!ok) {
    await db.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return NextResponse.json({ error: "کد اشتباه است" }, { status: 400 });
  }

  await db.otpCode.deleteMany({ where: { phone } });
  const user = await db.user.upsert({ where: { phone }, update: {}, create: { phone } });
  await startSession(user.id);

  const onboarded = Boolean(user.name && getTrack(user.grade, user.stream)?.available);
  return NextResponse.json({ next: onboarded ? "/learn" : "/onboarding" });
}
