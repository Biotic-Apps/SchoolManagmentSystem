import { ApiError, hasErrorCode } from "@/lib/api-error";
import type { Register } from "./types";

/** Holidays and weekends answer 400 VALIDATION_FAILED with a NON_WORKING_DAY reason. */
export function isNonWorkingDay(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  if (error.code === "NON_WORKING_DAY") return true;
  return error.code === "VALIDATION_FAILED" && JSON.stringify(error.details ?? "").includes("NON_WORKING_DAY");
}

export function isAlreadySubmitted(error: unknown): boolean {
  return hasErrorCode(error, "ALREADY_SUBMITTED");
}

export function isRecordLocked(error: unknown): boolean {
  return hasErrorCode(error, "RECORD_LOCKED");
}

/** 409 ALREADY_SUBMITTED carries the current register, either as details or details.register. */
export function registerFromConflict(error: unknown): Register | null {
  if (!(error instanceof ApiError) || !error.details || typeof error.details !== "object") return null;
  const details = error.details as { register?: Register } & Partial<Register>;
  const candidate = details.register ?? details;
  return Array.isArray(candidate.entries) && typeof candidate.status === "string" ? (candidate as Register) : null;
}
