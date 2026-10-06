export interface RoutableLine {
  id: string;
  staffUserId: string | null;
}

export interface RoutingContext {
  callerId: string;
  callerIsSuperAdmin: boolean;
  /** Branch.principalUserId of the run's branch. */
  principalUserId: string | null;
}

export interface LineRouting {
  /** Approved by the caller now. */
  branch: string[];
  /** Routed to SUPER_ADMIN (own salary, or principal's when not super admin). */
  superAdmin: string[];
}

/** Nobody approves their own salary; the principal's line needs higher admin. */
export function routeLines(
  lines: RoutableLine[],
  context: RoutingContext,
): LineRouting {
  const routing: LineRouting = { branch: [], superAdmin: [] };
  for (const line of lines) {
    const own =
      line.staffUserId !== null && line.staffUserId === context.callerId;
    const principal =
      !context.callerIsSuperAdmin &&
      line.staffUserId !== null &&
      line.staffUserId === context.principalUserId;
    (own || principal ? routing.superAdmin : routing.branch).push(line.id);
  }
  return routing;
}
