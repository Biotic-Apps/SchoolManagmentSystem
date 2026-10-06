"use client";

import { Trash2 } from "lucide-react";
import type { Option } from "@/components/shared/OptionSelect";
import { MoneyField } from "@/components/shared/form/MoneyField";
import { SelectField } from "@/components/shared/form/SelectField";
import { Button } from "@/components/ui/Button";
import { DUE_DAY_OPTIONS, FEE_FREQUENCY_OPTIONS } from "../../structure-options";

interface FeePlanItemRowProps {
  prefix: string;
  index: number;
  headOptions: Option[];
  onRemove?: () => void;
}

export function FeePlanItemRow({ prefix, index, headOptions, onRemove }: FeePlanItemRowProps) {
  return (
    <div className="flex flex-col gap-3 rounded-input border border-border p-3">
      <div className="flex items-center justify-between">
        <span className="text-caption font-medium text-fg-muted">Fee {index + 1}</span>
        {onRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} aria-label={`Remove fee ${index + 1}`}>
            <Trash2 />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <SelectField name={`${prefix}.feeHeadId`} label="Fee head" options={headOptions} required />
        <MoneyField name={`${prefix}.amount`} label="Amount" required />
        <SelectField name={`${prefix}.frequency`} label="Frequency" options={FEE_FREQUENCY_OPTIONS} required />
        <SelectField name={`${prefix}.dueDay`} label="Due day" options={DUE_DAY_OPTIONS} required />
      </div>
    </div>
  );
}
