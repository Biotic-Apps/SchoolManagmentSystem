"use client";

import type { PromotionsTabState } from "../../use-promotions-tab";
import { ApplyPromotionsDialog } from "./ApplyPromotionsDialog";
import { ConfirmPromotionsDialog } from "./ConfirmPromotionsDialog";
import { OverridePromotionDialog } from "./OverridePromotionDialog";
import { SuggestPromotionsDialog } from "./SuggestPromotionsDialog";

/** Dialogs mount only while open so each starts from fresh defaults. */
export function PromotionDialogs({ tab }: { tab: PromotionsTabState }) {
  const { dialogs } = tab;
  return (
    <>
      {dialogs.suggest.open && <SuggestPromotionsDialog tab={tab} />}
      {dialogs.override.item && (
        <OverridePromotionDialog
          row={dialogs.override.item}
          branchId={tab.scope.branchId}
          toSessionId={tab.toSessionId}
          onClose={dialogs.override.close}
        />
      )}
      {dialogs.confirm.open && <ConfirmPromotionsDialog tab={tab} />}
      {dialogs.apply.open && <ApplyPromotionsDialog tab={tab} />}
    </>
  );
}
