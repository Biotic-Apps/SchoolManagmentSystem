import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EMPTY_VALUE } from "@/lib/format";

interface StatCardProps {
  label: string;
  value?: ReactNode;
  hint?: string;
  icon?: LucideIcon;
  loading?: boolean;
}

export function StatCard({ label, value, hint, icon: Icon, loading }: StatCardProps) {
  return (
    <Card className="flex h-full flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-label text-fg-muted">{label}</span>
        {Icon && (
          <span className="grid size-9 place-items-center rounded-input bg-selected text-on-selected">
            <Icon className="size-4" />
          </span>
        )}
      </div>
      {loading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <span className="text-page-title font-semibold text-fg">{value ?? EMPTY_VALUE}</span>
      )}
      {hint && <span className="text-caption text-fg-muted">{hint}</span>}
    </Card>
  );
}
