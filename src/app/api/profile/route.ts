import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getTrack } from "@/lib/catalog";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "اول وارد شو" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim().slice(0, 40);
  const track = getTrack(body.grade, body.stream ?? null);
  if (!name) return NextResponse.json({ error: "اسمت رو بنویس" }, { status: 400 });
  if (!track?.available) return NextResponse.json({ error: "این پایه به زودی اضافه می‌شود" }, { status: 400 });

  await db.user.update({
    where: { id: user.id },
    data: { name, grade: track.grade, stream: track.stream ?? null },
  });
  return NextResponse.json({ ok: true });
}
