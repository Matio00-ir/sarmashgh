import { createHash } from "node:crypto";

export function hashCode(phone: string, code: string) {
  return createHash("sha256").update(`${phone}:${code}:${process.env.AUTH_SECRET}`).digest("hex");
}
