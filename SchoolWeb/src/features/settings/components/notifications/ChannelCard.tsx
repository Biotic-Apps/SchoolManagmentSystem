"use client";

import type { LucideIcon } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { TextField } from "@/components/shared/form/TextField";
import { Card, CardContent } from "@/components/ui/Card";

interface ChannelCardProps {
  channel: "email" | "sms" | "push" | "whatsapp";
  icon: LucideIcon;
  title: string;
  description: string;
  switchLabel: string;
  field?: { name: string; label: string; maxLength: number };
}

/** One delivery channel: an on/off switch and its sender setting (disabled while the channel is off). */
export function ChannelCard({ channel, icon: Icon, title, description, switchLabel, field }: ChannelCardProps) {
  const { control } = useFormContext();
  const enabled = useWatch({ control, name: `${channel}.enabled` }) === true;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-input bg-selected text-on-selected">
            <Icon className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h3 className="text-body font-semibold text-fg">{title}</h3>
            <p className="text-caption text-fg-muted">{description}</p>
          </div>
        </div>
        <CheckboxField name={`${channel}.enabled`} label={switchLabel} />
        {field && <TextField name={field.name} label={field.label} disabled={!enabled} required={enabled} maxLength={field.maxLength} />}
      </CardContent>
    </Card>
  );
}
