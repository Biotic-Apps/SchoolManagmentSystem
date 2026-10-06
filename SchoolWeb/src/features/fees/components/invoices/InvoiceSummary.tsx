import { DetailList } from "@/components/shared/DetailList";
import { formatDate } from "@/lib/format";
import { formatPeriod } from "@/lib/period";
import { studentCaption } from "../../invoice-options";
import type { Invoice } from "../../types";

export function InvoiceSummary({ invoice }: { invoice: Invoice }) {
  return (
    <DetailList
      items={[
        { label: "Student", value: invoice.student.name },
        { label: "Admission no. & class", value: studentCaption(invoice.student) || null },
        { label: "Billing month", value: formatPeriod(invoice.period) },
        { label: "Issued on", value: invoice.issueDate ? formatDate(invoice.issueDate) : null },
        { label: "Due date", value: formatDate(invoice.dueDate) },
      ]}
    />
  );
}
