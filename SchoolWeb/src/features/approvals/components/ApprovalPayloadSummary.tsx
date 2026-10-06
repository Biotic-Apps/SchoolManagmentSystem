import { DetailList } from "@/components/shared/DetailList";
import { MoneyText } from "@/components/shared/MoneyText";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { payloadSummary } from "../payload-summary";
import type { ApprovalRequest } from "../types";
import { ApprovalPayloadLines } from "./ApprovalPayloadLines";

const TITLES: Record<string, string> = {
  CHILD_LINK: "Link requested",
  CONTACT_CHANGE: "Requested contact change",
  SYLLABUS_PLAN: "Syllabus plan",
  PROBATION_REVIEW: "Change awaiting review",
  RESULT_PUBLISH: "Results to publish",
  PROMOTION: "Promotion decisions",
  CONCESSION: "Concession requested",
  REFUND: "Refund requested",
  PAYMENT_REVERSAL: "Payment to reverse",
  PAYROLL: "Payroll run",
  EXPENSE: "Expense",
  PURCHASE_ORDER: "Purchase request",
  CERTIFICATE: "Certificate requested",
};

/** What the request asks for, read from its payload; hidden when the API sends none. */
export function ApprovalPayloadSummary({ request }: { request: ApprovalRequest }) {
  const lines = payloadSummary(request.type, request.payload);
  if (lines.length === 0 && !request.payload) return null;
  const items = lines.map((line) => ({
    label: line.label,
    value: line.amountMinor !== undefined ? <MoneyText amountMinor={line.amountMinor} /> : line.value,
  }));
  return (
    <>
      {items.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeading title={TITLES[request.type] ?? "Request details"} />
          <DetailList items={items} />
        </section>
      )}
      <ApprovalPayloadLines payload={request.payload} />
    </>
  );
}
