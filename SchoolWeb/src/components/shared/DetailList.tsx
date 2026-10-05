import type { ReactNode } from "react";
import { EMPTY_VALUE } from "@/lib/format";

export interface DetailItem {
  label: string;
  value: ReactNode;
}

export function DetailList({ items }: { items: DetailItem[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-0.5">
          <dt className="text-caption text-fg-muted">{item.label}</dt>
          <dd className="break-words text-label text-fg">{item.value ?? EMPTY_VALUE}</dd>
        </div>
      ))}
    </dl>
  );
}
