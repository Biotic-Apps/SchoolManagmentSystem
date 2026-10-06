import type { Option } from "@/components/shared/OptionSelect";
import { humanize } from "@/lib/format";
import type { EarlyLeaveStatus } from "./types";

const EARLY_LEAVE_STATUSES: readonly EarlyLeaveStatus[] = ["REQUESTED", "APPROVED", "REJECTED", "CANCELLED"];

export const EARLY_LEAVE_STATUS_OPTIONS: Option[] = EARLY_LEAVE_STATUSES.map((id) => ({ id, name: humanize(id) }));
