"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import { usePayrollPage } from "../use-payroll-page";
import { AdjustmentsTab } from "./AdjustmentsTab";
import { RunsTab } from "./RunsTab";
import { StructuresTab } from "./StructuresTab";

export function PayrollPage() {
  const { picker, tab, setTab } = usePayrollPage();
  const branchId = picker.branchId;

  return (
    <>
      <PageHeader
        title="Salary & Payroll"
        description="Monthly payroll runs, salary structures and one-off adjustments."
        actions={<BranchPickerSelect picker={picker} />}
      />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="max-w-full overflow-x-auto">
          <TabsTrigger value="runs">Payroll runs</TabsTrigger>
          <TabsTrigger value="structures">Salary structures</TabsTrigger>
          <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
        </TabsList>
        <TabsContent value="runs">
          <RunsTab key={branchId} branchId={branchId} />
        </TabsContent>
        <TabsContent value="structures">
          <StructuresTab key={branchId} branchId={branchId} />
        </TabsContent>
        <TabsContent value="adjustments">
          <AdjustmentsTab key={branchId} branchId={branchId} />
        </TabsContent>
      </Tabs>
    </>
  );
}
