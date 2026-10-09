import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";

/** Card-shaped placeholder (title + a few text lines) shown while a panel loads. */
export function SkeletonCard({ lines = 2, className }: { lines?: number; className?: string }) {
  return (
    <Card aria-hidden className={cn("flex flex-col gap-4 p-5 sm:p-6", className)}>
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: lines }, (_, index) => (
          <Skeleton key={index} className={cn("h-4", index % 2 ? "w-2/3" : "w-full")} />
        ))}
      </div>
    </Card>
  );
}
