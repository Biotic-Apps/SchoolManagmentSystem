import { ArrowRightLeft, LogOut, Pencil, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { StudentAction } from "../use-student-detail";

export function StudentActions({ onAction }: { onAction: (action: StudentAction) => void }) {
  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => onAction("edit")}>
        <Pencil />
        Edit
      </Button>
      <Button variant="secondary" size="sm" onClick={() => onAction("section")}>
        <Shuffle />
        Change section
      </Button>
      <Button variant="secondary" size="sm" onClick={() => onAction("transfer")}>
        <ArrowRightLeft />
        Transfer
      </Button>
      <Button variant="danger" size="sm" onClick={() => onAction("withdraw")}>
        <LogOut />
        Withdraw
      </Button>
    </>
  );
}
