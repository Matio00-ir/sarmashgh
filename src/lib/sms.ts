// ارسال کد ورود با کاوه‌نگار (سرویس Verify Lookup).
// برای استفاده از سرویس دیگر، فقط همین تابع را عوض کنید.
export async function sendOtpSms(phone: string, code: string): Promise<boolean> {
  const key = process.env.KAVENEGAR_API_KEY;
  if (!key) {
    console.log(`[OTP] کد ورود ${phone}: ${code}`);
    return true;
  }
  const params = new URLSearchParams({
    receptor: phone,
    token: code,
    template: process.env.KAVENEGAR_TEMPLATE || "verify",
  });
  try {
    const res = await fetch(`https://api.kavenegar.com/v1/${key}/verify/lookup.json?${params}`);
    return res.ok;
  } catch (e) {
    console.error("[OTP] خطا در ارسال پیامک", e);
    return false;
  }
}

export const smsConfigured = () => Boolean(process.env.KAVENEGAR_API_KEY);
