import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { getTrack } from "./catalog";
import { SESSION_COOKIE, SESSION_DAYS, signSession, verifySession } from "./session";

export async function getCurrentUser() {
  const jar = await cookies();
  const userId = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  return db.user.findUnique({ where: { id: userId } });
}

/** کاربر واردشده‌ای که پایه‌اش را انتخاب کرده؛ در غیر این صورت هدایت می‌شود */
export async function requireStudent() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const track = getTrack(user.grade, user.stream);
  if (!track?.available) redirect("/onboarding");
  return { user, track };
}

export async function startSession(userId: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await signSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
