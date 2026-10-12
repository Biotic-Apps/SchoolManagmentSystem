"use client";

import { Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useFamilyChallan, type FamilyChallanInput } from "../../family-challan-api";

interface FamilyChallanButtonProps {
  branchId: string;
  /** Guardian ID for guardian-scoped challan. */
  guardianId?: string;
  /** Specific student IDs (siblings). */
  studentIds?: string[];
  variant?: "secondary" | "outline" | "ghost";
  size?: "sm" | "default";
}

/** Button that generates and opens a family (combined sibling) challan PDF. */
export function FamilyChallanButton({
  branchId,
  guardianId,
  studentIds,
  variant = "secondary",
  size = "sm",
}: FamilyChallanButtonProps) {
  const mutation = useFamilyChallan();

  const onClick = () => {
    const input: FamilyChallanInput = { branchId };
    if (guardianId) input.guardianId = guardianId;
    else if (studentIds?.length) input.studentIds = studentIds;
    mutation.mutate(input);
  };

  return (
    <Button variant={variant} size={size} loading={mutation.isPending} onClick={onClick}>
      <Users className="mr-1 h-4 w-4" />
      Family challan
    </Button>
  );
}
