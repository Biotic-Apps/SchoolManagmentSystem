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
};

// For these codes the server message is more specific than the generic text.
const SERVER_MESSAGE_CODES = new Set(["CONFLICT", "RECORD_LOCKED", "CLEARANCE_REQUIRED", "NEGATIVE_STOCK"]);

const FALLBACK = "Something went wrong. Please try again.";

export function errorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return FALLBACK;
  if (SERVER_MESSAGE_CODES.has(error.code) && error.message) return error.message;
  return FRIENDLY[error.code] ?? FALLBACK;
}
