"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import { usePayrollPage } from "../use-payroll-page";
import { AdjustmentsTab } from "./AdjustmentsTab";
import { OvertimeTab } from "./OvertimeTab";
import { PayRulesTab } from "./PayRulesTab";
import { RunsTab } from "./RunsTab";
import { StructuresTab } from "./StructuresTab";

export function PayrollPage() {
  const { picker, tab, setTab } = usePayrollPage();
  const branchId = picker.branchId;

  return (
    <>
      <PageHeader
        title="Salary & Payroll"
        description="Salaries for every staff member: teachers, coordinators, helpers, office staff and the principal. Attendance, overtime and adjustments are applied each month."
        actions={<BranchPickerSelect picker={picker} />}
      />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="max-w-full overflow-x-auto">
          <TabsTrigger value="runs">Monthly payroll</TabsTrigger>
          <TabsTrigger value="structures">Salary setup</TabsTrigger>
          <TabsTrigger value="overtime">Overtime</TabsTrigger>
          <TabsTrigger value="adjustments">Bonus & deductions</TabsTrigger>
          <TabsTrigger value="rules">Pay rules</TabsTrigger>
        </TabsList>
        <TabsContent value="runs">
          <RunsTab key={branchId} branchId={branchId} />
        </TabsContent>
        <TabsContent value="structures">
          <StructuresTab key={branchId} branchId={branchId} />
        </TabsContent>
        <TabsContent value="overtime">
          <OvertimeTab key={branchId} branchId={branchId} />
        </TabsContent>
        <TabsContent value="adjustments">
          <AdjustmentsTab key={branchId} branchId={branchId} />
        </TabsContent>
        <TabsContent value="rules">
          <PayRulesTab key={branchId} branchId={branchId} />
        </TabsContent>
      </Tabs>
    </>
  );
}
