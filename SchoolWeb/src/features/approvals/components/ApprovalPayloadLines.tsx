import { MoneyText } from "@/components/shared/MoneyText";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { formatNumber, humanize } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import { payloadItems } from "../payload-lines";

/** Line items carried by finance approvals (purchase order, payroll, promotion). */
export function ApprovalPayloadLines({ payload }: { payload: unknown }) {
  const { title, items } = payloadItems(payload);
  if (items.length === 0) return null;
  const hasQuantity = items.some((item) => item.quantity !== null);
  const hasAmount = items.some((item) => item.amountMinor !== null);
  return (
    <section className="flex flex-col gap-3">
      <SectionHeading title={title} />
      <div className="overflow-hidden rounded-card border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Item</TableHead>
              {hasQuantity && <TableHead className={NUMERIC_COLUMN}>Qty</TableHead>}
              {hasAmount && <TableHead className={NUMERIC_COLUMN}>Amount</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.key}>
                <TableCell>
                  <span className="flex flex-col">
                    <span className="font-medium">{item.label}</span>
                    {item.note && <span className="text-caption text-fg-muted">{humanize(item.note)}</span>}
                  </span>
                </TableCell>
                {hasQuantity && <TableCell className={NUMERIC_COLUMN}>{formatNumber(item.quantity)}</TableCell>}
                {hasAmount && (
                  <TableCell className={NUMERIC_COLUMN}>
                    <MoneyText amountMinor={item.amountMinor} />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
