import { ApiError } from "./api-error";

const FRIENDLY: Record<string, string> = {
  VALIDATION_FAILED: "Some fields need attention. Check the form and try again.",
  UNAUTHENTICATED: "Your session has ended. Please sign in again.",
  SESSION_REVOKED: "This session was ended. Please sign in again.",
  INVALID_CREDENTIALS: "The email, phone or password is incorrect.",
  ACCOUNT_DISABLED: "This account is disabled. Contact your school administrator.",
  ACCOUNT_LOCKED: "Too many failed attempts. Your account is locked for 15 minutes.",
  PASSWORD_CHANGE_REQUIRED: "Change your password to continue.",
  FORBIDDEN: "You don't have permission to do this.",
  FORBIDDEN_SCOPE: "This record is outside the schools or branches you manage.",
  NOT_FOUND: "This record no longer exists or you can't access it.",
  CONFLICT: "This conflicts with an existing record.",
  RECORD_LOCKED: "This record is locked and can no longer be changed.",
  RATE_LIMITED: "Too many requests. Wait a moment and try again.",
  NETWORK_ERROR: "Cannot reach the server. Check your connection and try again.",
  CLEARANCE_REQUIRED: "Clearance is pending: settle dues and return issued items first.",
  GATEWAY_DISABLED: "Online payment is not available for this school yet.",
  DAY_CLOSED: "This day's collection is closed; back-dated cash payments are blocked.",
  NEGATIVE_STOCK: "Not enough stock for this movement.",
  CONFIRM_CODE_MISMATCH: "The code you typed doesn't match the school code.",
};

// For these codes the server message is more specific than the generic text.
const SERVER_MESSAGE_CODES = new Set([
  "CONFLICT",
  "RECORD_LOCKED",
  "CLEARANCE_REQUIRED",
  "NEGATIVE_STOCK",
  // Academics & timetable (docs/api/academics-timetable-contract.md)
  "SECTION_IN_USE",
  "SUBJECT_IN_USE",
  "SUBJECT_NOT_IN_CLASS",
  "SUBJECT_NOT_IN_GROUP",
  "STAFF_LEFT",
  "OWN_ASSIGNMENT",
  "UNKNOWN_STAFF",
  "UNKNOWN_ROOM",
  "ROOM_NAME_TAKEN",
  "PERIOD_NOT_ON_DAY",
  "BREAK_PERIOD",
  "NON_WORKING_DAY",
  "PERIODS_IN_USE",
  "NOTHING_TO_PUBLISH",
  "NOTHING_TO_DISCARD",
  "TIMETABLE_CONFLICTS",
]);

const FALLBACK = "Something went wrong. Please try again.";

const ROUTE_MISSING = /^Cannot (GET|POST|PUT|PATCH|DELETE) /;

/** A 404 for the endpoint itself (API older than the web app), not for a record. */
export function isRouteMissing(error: unknown): boolean {
  return error instanceof ApiError && error.code === "NOT_FOUND" && ROUTE_MISSING.test(error.message);
}

const OUT_OF_DATE = "The server is out of date or not reachable. Please try again in a moment.";


export function errorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return FALLBACK;
  if (isRouteMissing(error)) return OUT_OF_DATE;
  if (SERVER_MESSAGE_CODES.has(error.code) && error.message) return error.message;
  return FRIENDLY[error.code] ?? FALLBACK;
}

/** Server lists like `details: ["English: 2 teacher assignments, 11 lessons"]`, if any. */
export function errorDetails(error: unknown): string[] {
  if (!(error instanceof ApiError) || !Array.isArray(error.details)) return [];
  return error.details.filter((item): item is string => typeof item === "string");
}

/** errorMessage plus the server's detail lines: "This subject is in use (English: 11 lessons)". */
export function errorWithDetails(error: unknown): string {
  const details = errorDetails(error);
  return details.length ? `${errorMessage(error)} (${details.join("; ")})` : errorMessage(error);
}
