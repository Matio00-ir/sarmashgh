import { redirect } from "next/navigation";
import { AuthFrame } from "@/components/AuthFrame";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "ورود" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/learn");
  return (
    <AuthFrame>
      <div className="rounded-xl border border-border-subtle bg-surface p-5 shadow-raised sm:p-7">
        <LoginForm />
      </div>
      <p className="mt-4 text-center text-caption text-muted">
        با ورود، حساب کاربری‌ات با همین شماره ساخته یا باز می‌شود.
      </p>
    </AuthFrame>
  );
}
