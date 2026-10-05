// Access token lives in memory only (security.md §7); never persisted to storage.
let accessToken: string | null = null;
let activeRole: string | null = null;

export interface AuthHandlers {
  refresh: () => Promise<string | null>;
  onExpired: () => void;
  onPasswordChangeRequired: () => void;
}

let authHandlers: AuthHandlers | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setActiveRoleHeader(role: string | null) {
  activeRole = role;
}

export function getActiveRoleHeader(): string | null {
  return activeRole;
}

export function setAuthHandlers(handlers: AuthHandlers | null) {
  authHandlers = handlers;
}

export function getAuthHandlers(): AuthHandlers | null {
  return authHandlers;
}
