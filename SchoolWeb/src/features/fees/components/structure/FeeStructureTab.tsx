"use client";

import { InlineNotice } from "@/components/shared/InlineNotice";
import { useFeeStructureTab } from "../../use-fee-structure-tab";
import { FeeHeadDialog } from "./FeeHeadDialog";
import { FeeHeadsSection } from "./FeeHeadsSection";
import { FeePlanDialog } from "./FeePlanDialog";
import { FeePlansSection } from "./FeePlansSection";
import { SiblingDiscountsSection } from "./SiblingDiscountsSection";

interface FeeStructureTabProps {
  branchId: string | null;
  schoolId: string | null;
}

export function FeeStructureTab({ branchId, schoolId }: FeeStructureTabProps) {
  const tab = useFeeStructureTab({ branchId, schoolId });

  if (!branchId) return <InlineNotice>Choose a branch to see its fee structure.</InlineNotice>;

  return (
    <div className="flex flex-col gap-6">
      <FeeHeadsSection tab={tab} />
      <FeePlansSection tab={tab} />
      <SiblingDiscountsSection schoolId={schoolId} />
      {tab.headDialog.open && <FeeHeadDialog schoolId={schoolId} onClose={tab.headDialog.close} />}
      {tab.planDialog.open && tab.sessionId && (
        <FeePlanDialog
          plan={tab.planDialog.item}
          scope={{ branchId, sessionId: tab.sessionId }}
          classOptions={tab.classOptions}
          headOptions={tab.headOptions}
          onClose={tab.planDialog.close}
        />
      )}
    </div>
  );
}
