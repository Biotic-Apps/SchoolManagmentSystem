import { InlineNotice } from "@/components/shared/InlineNotice";
import { shortUrl } from "../login-url";
import type { LoginSlipPreview } from "../login-slips-api";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** What printing will do, shown before anything changes. */
export function LoginSlipReview({ review }: { review: LoginSlipPreview }) {
  const changes = review.create + review.reset;
  const rows = [
    { n: review.create, text: "get a new parent sign-in with a temporary password" },
    { n: review.reset, text: "never signed in: their temporary password is replaced" },
    { n: review.keep, text: "already sign in: password unchanged, slip shows the username" },
    { n: review.skip, text: "skipped (no verified guardian, or sign-in disabled)" },
  ].filter((row) => row.n > 0);

  return (
    <div className="flex flex-col gap-3 rounded-input border border-border p-3" role="status">
      <p className="text-label text-fg">
        <span className="font-semibold">{plural(review.slips, "slip")}</span> for {plural(review.students, "student")}{" "}
        · sign-in at <span className="font-medium">{shortUrl(review.loginUrl)}</span>
      </p>
      <ul className="flex flex-col gap-1.5 text-label text-fg-muted">
        {rows.map((row) => (
          <li key={row.text}>
            <span className="font-semibold tabular-nums text-fg">{row.n}</span> {row.n === 1 ? "parent" : "parents"}{" "}
            {row.text}
          </li>
        ))}
      </ul>
      {changes > 0 && (
        <InlineNotice tone="warning">
          {plural(changes, "parent")} will get a new temporary password; slips printed earlier for them stop working.
          Only you can download this PDF. Hand each slip over privately.
        </InlineNotice>
      )}
    </div>
  );
}
