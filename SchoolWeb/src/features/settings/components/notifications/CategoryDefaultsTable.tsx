"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { categoryLabel } from "../../category-label";
import type { NotificationSettingsValues } from "../../notification-schemas";
import { CategoryChannelCheckbox, type CategoryChannel } from "./CategoryChannelCheckbox";

const COLUMNS: { channel: CategoryChannel; label: string }[] = [
  { channel: "inApp", label: "In-app" },
  { channel: "email", label: "Email" },
  { channel: "sms", label: "SMS" },
  { channel: "whatsapp", label: "WhatsApp" },
  { channel: "push", label: "Push" },
];

export function CategoryDefaultsTable() {
  const { control } = useFormContext<NotificationSettingsValues>();
  const { fields } = useFieldArray({ control, name: "categories" });
  const [email, sms, whatsapp, push] = useWatch({ control, name: ["email.enabled", "sms.enabled", "whatsapp.enabled", "push.enabled"] });
  const channelOn: Record<CategoryChannel, boolean> = { inApp: true, email, sms, whatsapp, push };

  if (fields.length === 0) {
    return <p className="text-label text-fg-muted">No notification categories are set up for this school.</p>;
  }

  return (
    <div className="overflow-hidden rounded-card border border-border">
      <Table className="min-w-[560px]">
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            {COLUMNS.map((column) => (
              <TableHead key={column.channel} className="w-24 text-center">
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((row, index) => {
            const { label, hint } = categoryLabel(row.category);
            return (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-fg">{label}</span>
                    {hint && <span className="text-caption text-fg-muted">{hint}</span>}
                  </div>
                </TableCell>
                {COLUMNS.map((column) => (
                  <TableCell key={column.channel} className="text-center">
                    <CategoryChannelCheckbox
                      index={index}
                      channel={column.channel}
                      label={`${label}: ${column.label}`}
                      disabled={!channelOn[column.channel]}
                    />
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
