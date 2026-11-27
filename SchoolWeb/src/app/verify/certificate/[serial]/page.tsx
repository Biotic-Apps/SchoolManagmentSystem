import type { Metadata } from "next";
import { headers } from "next/headers";
import { CircleCheck, CircleX } from "lucide-react";
import { formatDate } from "@/lib/format";

// Public page behind the QR / "verify at" link printed on certificates (proxy.ts lists /verify as public).
// The API answer (GET /certificates/verify/:serial, @Public) is JSON; this renders it for people.

export const metadata: Metadata = {
  title: "Certificate verification",
  robots: { index: false, follow: false },
};

const API_URL = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

const TYPE_LABELS: Record<string, string> = {
  SCHOOL_LEAVING: "School leaving certificate",
  TRANSFER: "Transfer certificate",
  CHARACTER: "Character certificate",
  ATTENDANCE: "Attendance certificate",
  ACHIEVEMENT: "Certificate of achievement",
};

interface Verification {
  valid: boolean;
  type: string | null;
  studentName: string | null;
  issuedOn: string | null;
}

type Outcome = { kind: "result"; data: Verification } | { kind: "error" };

/** Only our reverse proxy's right-most X-Forwarded-For entry is trusted (same rule as server/upstream.ts). */
async function forwardedFor(): Promise<Record<string, string>> {
  const list = ((await headers()).get("x-forwarded-for") ?? "").split(",").map((v) => v.trim()).filter(Boolean);
  const last = list.at(-1);
  return last && /^[0-9a-fA-F:.]{2,45}$/.test(last) ? { "X-Forwarded-For": last } : {};
}

async function verify(serial: string): Promise<Outcome> {
  try {
    const response = await fetch(`${API_URL}/certificates/verify/${encodeURIComponent(serial)}`, {
      headers: { Accept: "application/json", ...(await forwardedFor()) },
      cache: "no-store",
    });
    if (!response.ok) return { kind: "error" };
    const body = (await response.json()) as { data?: Verification };
    return body.data ? { kind: "result", data: body.data } : { kind: "error" };
  } catch {
    return { kind: "error" };
  }
}

export default async function CertificateVerifyPage({ params }: PageProps<"/verify/certificate/[serial]">) {
  const { serial: raw } = await params;
  const serial = decodeURIComponent(raw).slice(0, 64);
  const outcome = await verify(serial);
  const valid = outcome.kind === "result" && outcome.data.valid;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-sm">
        <p className="text-sm text-fg-muted">Certificate verification</p>
        <p className="mt-1 break-all font-mono text-sm">{serial}</p>

        {outcome.kind === "error" ? (
          <div className="mt-6">
            <h1 className="text-xl font-semibold">Could not check this certificate</h1>
            <p className="mt-2 text-sm text-fg-muted">
              The verification service did not answer. Please try again in a few minutes.
            </p>
          </div>
        ) : valid ? (
          <div className="mt-6">
            <h1 className="flex items-center gap-2 text-xl font-semibold text-green-700">
              <CircleCheck aria-hidden className="size-6" />
              Valid certificate
            </h1>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-fg-muted">Type</dt>
              <dd>{TYPE_LABELS[outcome.data.type ?? ""] ?? outcome.data.type}</dd>
              <dt className="text-fg-muted">Student</dt>
              <dd>{outcome.data.studentName}</dd>
              <dt className="text-fg-muted">Issued on</dt>
              <dd>{formatDate(outcome.data.issuedOn)}</dd>
            </dl>
            <p className="mt-4 text-xs text-fg-muted">
              This confirms an original certificate issued by the school with this serial number.
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <h1 className="flex items-center gap-2 text-xl font-semibold text-red-700">
              <CircleX aria-hidden className="size-6" />
              Not a valid certificate
            </h1>
            <p className="mt-2 text-sm text-fg-muted">
              No issued certificate has this serial number. Check the number printed on the certificate, or
              contact the school office.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
