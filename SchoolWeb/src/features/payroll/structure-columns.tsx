import type { DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { PersonCell } from "@/components/shared/PersonCell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { designationLabel } from "@/features/staff/options";
import type { StaffSummary } from "@/features/staff/types";
import { cn } from "@/lib/cn";
import { textOrDash } from "@/lib/format";
import { formatPeriod } from "@/lib/period";
import { NUMERIC_COLUMN } from "@/lib/table";
import { structureTotals } from "./normalize";
import type { SalaryStructure } from "./types";

export const structureStaffColumns: DataTableColumn<StaffSummary>[] = [
  {
    id: "name",
    header: "Name",
    cell: (row) => <PersonCell name={row.name} caption={row.employeeNo} photoUrl={row.photoUrl} />,
  },
  { id: "designation", header: "Designation", cell: (row) => textOrDash(designationLabel(row.designation)) },
  { id: "status", header: "Status", className: "whitespace-nowrap", cell: (row) => <StatusBadge status={row.status} /> },
];

const MONEY = cn(NUMERIC_COLUMN, "whitespace-nowrap");

export const structureHistoryColumns: DataTableColumn<SalaryStructure>[] = [
  { id: "from", header: "Effective from", className: "whitespace-nowrap", cell: (row) => formatPeriod(row.effectiveFrom) },
  { id: "basic", header: "Basic", className: MONEY, cell: (row) => <MoneyText amountMinor={row.basicMinor} /> },
  { id: "gross", header: "Gross", className: MONEY, cell: (row) => <MoneyText amountMinor={structureTotals(row).gross} /> },
  { id: "net", header: "Net", className: MONEY, cell: (row) => <MoneyText amountMinor={structureTotals(row).net} /> },
];
