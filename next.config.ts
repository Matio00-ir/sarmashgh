import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // محتوای درس‌ها از پوشه content در زمان اجرا خوانده می‌شود
  outputFileTracingIncludes: { "/**": ["./content/**/*"] },
};

export default nextConfig;
