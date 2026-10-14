import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site/content";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const POINTS = ["Web portal + Android", "Fee challans", "Report cards", "Parent portal"];

/**
 * The card that appears whenever the site is shared — WhatsApp, LinkedIn, a
 * pasted link in a chat. Drawn rather than photographed so it stays correct if
 * the copy changes, and kept to system fonts so generating it never depends on
 * a network fetch.
 *
 * Gradients use `ellipse at <position>` with no explicit radii: satori's parser
 * reads a second length as the start of the colour-stop list and throws.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#ffffff",
          backgroundImage:
            "radial-gradient(ellipse at 78% -8%, rgba(123,104,238,0.30), transparent 68%), radial-gradient(ellipse at 6% 100%, rgba(106,90,205,0.16), transparent 62%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundImage: "linear-gradient(140deg, #9B8BF4, #7B68EE 55%, #6A5ACD)",
            }}
          >
            {/* lucide GraduationCap, inlined: satori cannot render a React component. */}
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
              <path d="M22 10v6" />
              <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
            </svg>
          </div>
          <span style={{ fontSize: 38, fontWeight: 700, color: "#1a1530", letterSpacing: -1 }}>
            {SITE.name}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 68,
              fontWeight: 700,
              color: "#1a1530",
              letterSpacing: -2.6,
              lineHeight: 1.05,
              maxWidth: 940,
            }}
          >
            {SITE.tagline}
          </span>
          <span style={{ marginTop: 26, fontSize: 28, color: "#5b5670", maxWidth: 900 }}>
            School management software for Pakistan — admissions, attendance, exams,
            fees, payroll and a portal for every parent.
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
          {POINTS.map((item) => (
            <span key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: "#7B68EE" }}
              />
              <span style={{ fontSize: 22, color: "#5b5670" }}>{item}</span>
            </span>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
