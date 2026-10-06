import { useIsParent } from "@/features/auth/use-active-child";

/** Parents see their linked child's profile; staff see the students register. */
export function useStudentsRoute() {
  return { view: useIsParent() ? ("child" as const) : ("register" as const) };
}
