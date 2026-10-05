export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export const NETWORK_ERROR = "NETWORK_ERROR";

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code;
    this.details = body.details;
  }
}

export function networkError(): ApiError {
  return new ApiError(0, { code: NETWORK_ERROR, message: "Cannot reach the server." });
}

export function hasErrorCode(error: unknown, code: string): boolean {
  return error instanceof ApiError && error.code === code;
}
