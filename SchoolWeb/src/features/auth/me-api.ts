import { ApiError } from "@/lib/api-error";
import { http } from "@/lib/http";
import { getActiveRoleHeader, setActiveRoleHeader } from "@/lib/request-context";
import { saveActiveRole } from "./active-role-store";
import type { Session } from "./types";

async function getMe(): Promise<Session> {
  const me = (await http.get<Session>("/me")).data;
  return { ...me, assignments: me.assignments ?? [], children: me.children ?? [] };
}

/** GET /me; a remembered role the user no longer holds falls back to the default role. */
export async function fetchMe(): Promise<Session> {
  try {
    return await getMe();
  } catch (error) {
    const staleRole = error instanceof ApiError && error.status === 403 && error.code === "FORBIDDEN";
    if (!staleRole || !getActiveRoleHeader()) throw error;
    setActiveRoleHeader(null);
    saveActiveRole(null);
    return getMe();
  }
}
