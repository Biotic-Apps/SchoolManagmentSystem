import type { DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { PersonCell } from "@/components/shared/PersonCell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { designationLabel } from "@/features/staff/options";
import { cn } from "@/lib/cn";
import { textOrDash } from "@/lib/format";
import { formatPeriod } from "@/lib/period";
import { NUMERIC_COLUMN } from "@/lib/table";
import { structureTotals } from "./normalize";
import type { PayrollStaffRow, SalaryStructure } from "./types";

export const structureStaffColumns: DataTableColumn<PayrollStaffRow>[] = [
  {
    id: "name",
    header: "Name",
    cell: (row) => <PersonCell name={row.name} caption={row.employeeNo} />,
  },
  { id: "designation", header: "Staff type", cell: (row) => textOrDash(designationLabel(row.designation)) },
  {
    id: "basic",
    header: "Basic",
    className: cn(NUMERIC_COLUMN, "whitespace-nowrap"),
    cell: (row) => (row.salary ? <MoneyText amountMinor={row.salary.basicMinor} /> : <Badge tone="warning">No salary set</Badge>),
  },
  {
    id: "gross",
    header: "Gross",
    className: cn(NUMERIC_COLUMN, "whitespace-nowrap"),
    cell: (row) => (row.salary ? <MoneyText amountMinor={row.salary.grossMinor} /> : "—"),
  },
  {
    id: "overtime",
    header: "Overtime rate",
    className: "whitespace-nowrap",
    cell: (row) =>
      !row.salary ? (
        "—"
      ) : row.salary.overtimeRateMinor ? (
        <span>
          <MoneyText amountMinor={row.salary.overtimeRateMinor} /> / hour
        </span>
      ) : (
        <span className="text-fg-muted">School rule</span>
      ),
  },
  { id: "status", header: "Status", className: "whitespace-nowrap", cell: (row) => <StatusBadge status={row.status} /> },
];

const MONEY = cn(NUMERIC_COLUMN, "whitespace-nowrap");

export const structureHistoryColumns: DataTableColumn<SalaryStructure>[] = [
  { id: "from", header: "Effective from", className: "whitespace-nowrap", cell: (row) => formatPeriod(row.effectiveFrom) },
  { id: "basic", header: "Basic", className: MONEY, cell: (row) => <MoneyText amountMinor={row.basicMinor} /> },
  { id: "gross", header: "Gross", className: MONEY, cell: (row) => <MoneyText amountMinor={structureTotals(row).gross} /> },
  { id: "net", header: "Net", className: MONEY, cell: (row) => <MoneyText amountMinor={structureTotals(row).net} /> },
];
