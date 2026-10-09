import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

/** Same shape as the parent dashboard, so nothing jumps when data arrives. */
export function ParentHomeSkeleton() {
  return (
    <div role="status" aria-label="Loading your child's dashboard" className="flex flex-col gap-4">
      <Card className="flex items-center gap-4 p-5 sm:p-6">
        <Skeleton className="size-16 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {["Attendance", "Fees", "Result", "Homework"].map((label) => (
          <StatCard key={label} label={label} loading className="p-4 sm:p-5" />
        ))}
      </div>
      <SkeletonCard lines={1} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SkeletonCard lines={4} />
        <SkeletonCard lines={4} />
      </div>
    </div>
  );
}
