"use client";

import { useState } from "react";
import { Check, CornerUpLeft, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

export type ApprovalDecision = "APPROVED" | "REJECTED" | "RETURNED";

interface ApprovalActionsProps {
  pending?: ApprovalDecision | null;
  onDecide: (decision: ApprovalDecision, comment: string) => void;
}

const NEEDS_COMMENT: ApprovalDecision[] = ["REJECTED", "RETURNED"];

export function ApprovalActions({ pending, onDecide }: ApprovalActionsProps) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const decide = (decision: ApprovalDecision) => {
    if (NEEDS_COMMENT.includes(decision) && !comment.trim()) {
      setError("Add a comment explaining why.");
      return;
    }
    setError(null);
    onDecide(decision, comment.trim());
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="approval-comment">Comment</Label>
        <Textarea
          id="approval-comment"
          rows={3}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Required when rejecting or returning"
          aria-invalid={!!error}
        />
        {error && (
          <p role="alert" className="text-caption text-error">
            {error}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => decide("APPROVED")} loading={pending === "APPROVED"} disabled={!!pending}>
          <Check />
          Approve
        </Button>
        <Button variant="secondary" onClick={() => decide("RETURNED")} loading={pending === "RETURNED"} disabled={!!pending}>
          <CornerUpLeft />
          Return
        </Button>
        <Button variant="danger" onClick={() => decide("REJECTED")} loading={pending === "REJECTED"} disabled={!!pending}>
          <X />
          Reject
        </Button>
      </div>
    </div>
  );
}
