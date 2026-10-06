import { DetailList } from "@/components/shared/DetailList";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { payloadSummary } from "../payload-summary";
import type { ApprovalRequest } from "../types";

const TITLES: Record<string, string> = {
  CHILD_LINK: "Link requested",
  CONTACT_CHANGE: "Requested contact change",
  SYLLABUS_PLAN: "Syllabus plan",
  PROBATION_REVIEW: "Change awaiting review",
};

/** What the request asks for, read from its payload; hidden when the API sends none. */
export function ApprovalPayloadSummary({ request }: { request: ApprovalRequest }) {
  const lines = payloadSummary(request.type, request.payload);
  if (lines.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <SectionHeading title={TITLES[request.type] ?? "Request details"} />
      <DetailList items={lines} />
    </section>
  );
}
