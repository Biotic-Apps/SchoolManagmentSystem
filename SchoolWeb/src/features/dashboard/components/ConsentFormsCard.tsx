import { FileSignature } from "lucide-react";
import { CountBadge } from "@/components/shared/CountBadge";
import { TodayCard } from "./TodayCard";

/** Consent forms the parent still has to answer; same card shape as the "today" card beside it. */
export function ConsentFormsCard({ count, href }: { count: number; href: string }) {
  return (
    <TodayCard title="Consent forms" icon={FileSignature} href={href} linkLabel="Review">
      <div className="flex items-center justify-between gap-3">
        <span className="text-label text-fg-muted">{count > 0 ? "Waiting for your answer" : "Nothing waiting for you"}</span>
        {count > 0 && <CountBadge count={count} />}
      </div>
    </TodayCard>
  );
}
