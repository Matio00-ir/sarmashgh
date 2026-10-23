import { ImageResponse } from "next/og";
import { LOGO_PAGE_LEFT, LOGO_PAGE_RIGHT, LOGO_STAR, LOGO_VIEWBOX } from "./logo";

/**
 * آیکون اپ: نشانه‌ی سرمشق روی زمینه‌ی آبی برند.
 * نشانه در ۶۰٪ میانی است تا در آیکون Maskable اندروید بریده نشود.
 * در اندازه‌ی favicon فقط کتاب (بدون ستاره) کشیده می‌شود تا شلوغ نشود.
 */
export function appIcon(size: number) {
  const mark = Math.round(size * 0.6);
  const small = size <= 64;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#365CEB",
          borderRadius: small ? size * 0.22 : 0,
        }}
      >
        <svg width={mark} height={mark} viewBox={LOGO_VIEWBOX}>
          <path d={LOGO_PAGE_RIGHT} fill="#FFFFFF" />
          <path d={LOGO_PAGE_LEFT} fill="#FFFFFF" opacity={0.82} />
          {!small && <path d={LOGO_STAR} fill="#FDE68A" />}
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
