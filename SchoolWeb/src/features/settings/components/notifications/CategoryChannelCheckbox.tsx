"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/Checkbox";
import type { NotificationSettingsValues } from "../../notification-schemas";

export type CategoryChannel = "inApp" | "email" | "sms" | "push" | "whatsapp";

interface CategoryChannelCheckboxProps {
  index: number;
  channel: CategoryChannel;
  label: string;
  disabled: boolean;
}

export function CategoryChannelCheckbox({ index, channel, label, disabled }: CategoryChannelCheckboxProps) {
  const { control } = useFormContext<NotificationSettingsValues>();
  return (
    <Controller
      control={control}
      name={`categories.${index}.${channel}`}
      render={({ field }) => (
        <Checkbox
          ref={field.ref}
          checked={field.value === true}
          onCheckedChange={(checked) => field.onChange(checked === true)}
          disabled={disabled}
          aria-label={label}
          className="mx-auto"
        />
      )}
    />
  );
}
