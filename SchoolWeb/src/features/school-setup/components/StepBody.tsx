import type { StepId } from "../steps";
import { BellStep } from "./BellStep";
import { BranchStep } from "./BranchStep";
import { ClassesStep } from "./ClassesStep";
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
    case "classes":
      return <ClassesStep />;
    case "bell":
      return <BellStep />;
    case "review":
      return <ReviewStep onEdit={onEdit} />;
  }
}
