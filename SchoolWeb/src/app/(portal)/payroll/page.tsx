import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { PayrollPage } from "@/features/payroll/components/PayrollPage";

export const metadata: Metadata = { title: "Salary & Payroll" };

export default function Page() {
  return (
    <ModuleGuard moduleId="payroll">
      <PayrollPage />
    </ModuleGuard>
  );
}
