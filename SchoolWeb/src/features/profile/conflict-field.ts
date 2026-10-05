import { ApiError } from "@/lib/api-error";

/**
 * PATCH /me answers a taken email or phone with CONFLICT. When the message names the field,
 * re-throw it as a field-level VALIDATION_FAILED so useServerForm shows it inline.
 */
export function conflictToField(error: unknown): unknown {
  if (!(error instanceof ApiError) || error.code !== "CONFLICT") return error;
  const text = error.message.toLowerCase();
  const field = text.includes("email") ? "email" : text.includes("phone") ? "phone" : null;
  if (!field) return error;
  return new ApiError(error.status, {
    code: "VALIDATION_FAILED",
    message: error.message,
    details: [{ field, message: error.message }],
  });
}
