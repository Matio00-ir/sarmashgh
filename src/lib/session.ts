// امضا و بررسی توکن نشست؛ هم در middleware (edge) و هم در سرور استفاده می‌شود
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "sarmashgh_session";
export const SESSION_DAYS = 30;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET باید حداقل ۳۲ کاراکتر باشد");
  return new TextEncoder().encode(s);
}

export async function signSession(userId: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
