"use client";

import { ArrowUpDown, Layers, Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useClassesOverviewTab } from "../use-classes-overview";
import { ClassCard } from "./ClassCard";
import { ClassFormDialog } from "./ClassFormDialog";
import { ClassReorderList } from "./ClassReorderList";

interface ClassesOverviewTabProps {
  branchId: string;
  schoolId: string;
  sessionId: string | null;
}

export function ClassesOverviewTab({ branchId, schoolId, sessionId }: ClassesOverviewTabProps) {
  const tab = useClassesOverviewTab(branchId, sessionId);
  const { query, order } = tab;

  return (
    <div className="flex flex-col gap-4">
      {!order.active && (tab.canAdd || tab.canReorder) && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {tab.canReorder && (
            <Button variant="secondary" onClick={order.start}>
              <ArrowUpDown />
              Reorder
            </Button>
          )}
          {tab.canAdd && (
            <Button onClick={() => tab.addDialog.show(true)}>
              <Plus />
              Add class
            </Button>
          )}
        </div>
      )}
      {query.isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-44 w-full" />
          ))}
        </div>
      )}
      {!query.isLoading && !!query.error && (
        <Card>
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        </Card>
      )}
      {!query.isLoading && !query.error && tab.classes.length === 0 && (
        <Card>
          <EmptyState
            icon={Layers}
            title="No classes yet"
            description="Add your first class, e.g. Playgroup or Class 1. You'll add its sections and subjects next."
            action={
              tab.canAdd ? (
                <Button onClick={() => tab.addDialog.show(true)}>
                  <Plus />
                  Add class
                </Button>
              ) : undefined
            }
          />
        </Card>
      )}
      {order.active ? (
        <ClassReorderList order={order} />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tab.classes.map((item) => (
            <li key={item.id} className="flex">
              <ClassCard item={item} branchId={branchId} sessionId={sessionId} onOpen={() => tab.open(item.id)} />
            </li>
          ))}
        </ul>
      )}
      {tab.addDialog.open && (
        <ClassFormDialog schoolId={schoolId} levelOrder={tab.nextLevel} onClose={tab.addDialog.close} onCreated={tab.onCreated} />
      )}
    </div>
  );
}
