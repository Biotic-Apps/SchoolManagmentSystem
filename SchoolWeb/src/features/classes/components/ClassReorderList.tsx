"use client";

import { OrderButtons } from "@/components/shared/OrderButtons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { useClassOrder } from "../use-class-order";

/** Junior to senior: move classes up or down, then save once. */
export function ClassReorderList({ order }: { order: ReturnType<typeof useClassOrder> }) {
  const count = order.items.length;
  return (
    <Card className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="text-label text-fg-muted">Put the classes in order from junior to senior. This order is used everywhere.</p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={order.cancel} disabled={order.saving}>
            Cancel
          </Button>
          <Button onClick={() => void order.save()} loading={order.saving}>
            Save order
          </Button>
        </div>
      </div>
      <ol className="divide-y divide-border">
        {order.items.map((item, index) => (
          <li key={item.id} className="flex items-center gap-3 px-4 py-2">
            <span className="w-6 text-right text-caption tabular-nums text-fg-muted">{index + 1}</span>
            <span className="flex-1 truncate text-body font-medium text-fg">{item.name}</span>
            <OrderButtons label={item.name} index={index} count={count} onMove={order.move} />
          </li>
        ))}
      </ol>
    </Card>
  );
}
