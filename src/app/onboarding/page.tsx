import { redirect } from "next/navigation";
import { AuthFrame } from "@/components/AuthFrame";
import { getCurrentUser } from "@/lib/auth";
import { GRADE_TITLES, STREAMS, TRACKS } from "@/lib/catalog";
import { OnboardingForm, type GradeOption } from "./OnboardingForm";

export const metadata = { title: "شروع" };

const GRADE_ORDER = ["7", "8", "9", "10", "11", "12", "konkur"];

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const grades: GradeOption[] = GRADE_ORDER.map((g) => {
    const tracks = TRACKS.filter((t) => t.grade === g);
    return {
      grade: g,
      title: GRADE_TITLES[g],
      available: tracks.some((t) => t.available),
      streams: tracks
        .filter((t) => t.stream)
        .map((t) => ({ id: t.stream!, title: STREAMS[t.stream!], available: t.available })),
    };
  });

  return (
    <AuthFrame wide>
      <OnboardingForm
        grades={grades}
        initialName={user.name ?? ""}
        initialGrade={user.grade ?? undefined}
        initialStream={user.stream ?? undefined}
        editing={Boolean(user.name)}
      />
    </AuthFrame>
  );
}
