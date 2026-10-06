import type { Option } from "@/components/shared/OptionSelect";
import type { StepperStep } from "@/components/shared/StatusStepper";

export const ENQUIRY_STATUS_OPTIONS: Option[] = [
  { id: "NEW", name: "New" },
  { id: "CONTACTED", name: "Contacted" },
  { id: "CONVERTED", name: "Converted" },
  { id: "CLOSED", name: "Closed" },
];

/** Statuses a user may set by hand; CONVERTED only comes from "Convert to application". */
export const ENQUIRY_UPDATE_STATUS_OPTIONS: Option[] = ENQUIRY_STATUS_OPTIONS.filter((o) => o.id !== "CONVERTED");

export const APPLICATION_STATUS_OPTIONS: Option[] = [
  { id: "SUBMITTED", name: "Submitted" },
  { id: "DOCUMENTS_PENDING", name: "Documents pending" },
  { id: "TEST_SCHEDULED", name: "Test scheduled" },
  { id: "TEST_COMPLETED", name: "Test completed" },
  { id: "OFFERED", name: "Offered" },
  { id: "WAITLISTED", name: "Waitlisted" },
  { id: "REJECTED", name: "Rejected" },
  { id: "CONFIRMED", name: "Confirmed" },
  { id: "ENROLLED", name: "Enrolled" },
  { id: "EXPIRED", name: "Expired" },
  { id: "WITHDRAWN", name: "Withdrawn" },
];

export const FEE_STATUS_OPTIONS: Option[] = [
  { id: "PAID", name: "Paid" },
  { id: "WAIVED", name: "Waived" },
  { id: "PENDING", name: "Pending (collect later)" },
];

export const DECISION_OPTIONS: Option[] = [
  { id: "OFFER", name: "Offer a seat" },
  { id: "WAITLIST", name: "Add to waiting list" },
  { id: "REJECT", name: "Reject" },
];

export const SOURCE_SUGGESTIONS = "e.g. Walk-in, Referral, Facebook, Banner";

export type ApplicationStepId =
  | "submitted"
  | "documents"
  | "test_scheduled"
  | "test_completed"
  | "decision"
  | "confirmed"
  | "enrolled";

export const APPLICATION_STEPS: StepperStep[] = [
  { id: "submitted", label: "Submitted" },
  { id: "documents", label: "Documents" },
  { id: "test_scheduled", label: "Test scheduled" },
  { id: "test_completed", label: "Test completed" },
  { id: "decision", label: "Decision" },
  { id: "confirmed", label: "Confirmed" },
  { id: "enrolled", label: "Enrolled" },
];
