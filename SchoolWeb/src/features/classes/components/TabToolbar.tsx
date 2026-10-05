import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TabToolbarProps {
  children: ReactNode;
  addLabel: string;
  onAdd?: () => void;
}

/** Filters on the left, the tab's add button on the right (hidden without permission). */
export function TabToolbar({ children, addLabel, onAdd }: TabToolbarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div className="flex-1">{children}</div>
      {onAdd && (
        <Button onClick={onAdd} className="self-start">
          <Plus />
          {addLabel}
        </Button>
      )}
    </div>
  );
}
