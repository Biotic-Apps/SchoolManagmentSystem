"use client";

import { useSession } from "@/features/auth/session-context";
import { ClassesPage } from "./ClassesPage";
import { MyClassesPage } from "./MyClassesPage";

const ROSTER_ROLES = new Set(["TEACHER", "HELPER"]);

/** Teachers and helpers see their own sections' rosters; managers see class setup. */
export function ClassesRoute() {
  const role = useSession().session?.activeRole;
  return role && ROSTER_ROLES.has(role) ? <MyClassesPage /> : <ClassesPage />;
}
