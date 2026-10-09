"use client";

import { X } from "lucide-react";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useSetupChecklistCard } from "../use-setup-checklist-card";
import { ChecklistRow } from "./ChecklistRow";

export function SetupChecklistCard({ branchId }: { branchId: string | null }) {
  const card = useSetupChecklistCard(branchId);
  if (!card.visible) return null;

  return (
    <Card aria-labelledby="setup-checklist-title" role="region" className="flex flex-col gap-4 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="setup-checklist-title" className="text-card-title font-semibold text-fg">
            Set up your school
          </h2>
          <p className="text-label text-fg-muted">
            {card.done} of {card.total} done{card.branchName ? ` for ${card.branchName}` : ""}. Finish these to start
            daily work.
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={card.dismiss} aria-label="Hide this checklist" className="-mr-2 -mt-2">
          <X />
        </Button>
      </div>
      {card.picker && <BranchPickerSelect picker={card.picker} className="sm:w-72" />}
      <ProgressBar percent={(card.done / Math.max(1, card.total)) * 100} label="Setup progress" tone="success" />
      <ul className="-mx-3 grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        {card.items.map((item) => (
          <ChecklistRow key={item.key} item={item} />
        ))}
      </ul>
    </Card>
  );
}
