import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/fa";
import { sendOtpSms, smsConfigured } from "@/lib/sms";
import { hashCode } from "@/lib/otp";

const CODE_TTL_MS = 2 * 60 * 1000;
const RESEND_AFTER_MS = 60 * 1000;

export async function POST(req: Request) {
  const { phone: raw } = await req.json().catch(() => ({}));
  const phone = normalizePhone(String(raw ?? ""));
  if (!phone) return NextResponse.json({ error: "شماره موبایل درست نیست" }, { status: 400 });

  const last = await db.otpCode.findFirst({ where: { phone }, orderBy: { createdAt: "desc" } });
  if (last && Date.now() - last.createdAt.getTime() < RESEND_AFTER_MS) {
    return NextResponse.json({ error: "کمی صبر کن و دوباره امتحان کن" }, { status: 429 });
  }

  const isProd = process.env.NODE_ENV === "production";
  if (isProd && !smsConfigured()) {
    return NextResponse.json({ error: "ارسال پیامک پیکربندی نشده" }, { status: 503 });
  }

  const code = String(randomInt(10000, 100000));
  await db.otpCode.deleteMany({ where: { phone } });
  await db.otpCode.create({
    data: { phone, codeHash: hashCode(phone, code), expiresAt: new Date(Date.now() + CODE_TTL_MS) },
  });

  if (!(await sendOtpSms(phone, code))) {
    return NextResponse.json({ error: "ارسال پیامک ناموفق بود" }, { status: 502 });
  }

  // در حالت توسعه (بدون سرویس پیامک) کد را برمی‌گردانیم تا تست راحت باشد
  return NextResponse.json({ phone, devCode: !isProd && !smsConfigured() ? code : undefined });
}
