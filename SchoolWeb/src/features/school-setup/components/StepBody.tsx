import type { StepId } from "../steps";
import { BranchStep } from "./BranchStep";
import { PeopleStep } from "./PeopleStep";
import { ReviewStep } from "./ReviewStep";
import { SchoolStep } from "./SchoolStep";

export function StepBody({ step, onEdit }: { step: StepId; onEdit: (index: number) => void }) {
  switch (step) {
    case "school":
      return <SchoolStep />;
    case "branch":
      return <BranchStep />;
    case "people":
      return <PeopleStep />;
    case "review":
      return <ReviewStep onEdit={onEdit} />;
  }
}
