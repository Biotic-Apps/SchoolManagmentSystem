import type { AuditChange } from "./diff";

// Plain-language titles and icon kinds for audit action keys ("branch.principal_change").

export type AuditKind =
  | "create"
  | "update"
  | "archive"
  | "restore"
  | "people"
  | "schedule"
  | "settings"
  | "signin"
  | "security"
  | "money"
  | "approve"
  | "reject"
  | "publish"
  | "import"
  | "other";

const TITLES: Record<string, string> = {
  "school.create": "Created school",
  "school.update": "Updated school details",
  "school.archive": "Archived school",
  "school.activate": "Reactivated school",
  "branch.create": "Created branch",
  "branch.update": "Updated branch details",
  "branch.archive": "Archived branch",
  "branch.activate": "Reactivated branch",
  "branch.principal_change": "Changed principal",
  "branch.settings_update": "Updated branch settings",
  "timetable.periods": "Changed the period schedule",
  "timetable.draft": "Saved a timetable draft",
  "timetable.publish": "Published the timetable",
  "settings.school.update": "Updated school settings",
  "settings.policies.update": "Updated policies",
  "settings.notifications.update": "Updated notification settings",
  "user.create": "Created user account",
  "user.reset_password": "Reset password",
  "user.update_self": "Updated own profile",
  "user.assignment_add": "Added a role assignment",
  "user.assignment_end": "Ended a role assignment",
  "auth.login": "Signed in",
  "auth.password_change": "Changed password",
  "auth.password_reset": "Reset password",
  "auth.2fa_enabled": "Turned on two-step verification",
  "auth.2fa_disabled": "Turned off two-step verification",
  "auth.2fa_recovery_regenerated": "Generated new recovery codes",
  "auth.2fa_recovery_used": "Used a recovery code",
  "auth.account_locked": "Account locked after failed sign-ins",
  "auth.session_timeout": "Session timed out",
  "staff.create": "Added staff member",
  "staff.update": "Updated staff details",
  "staff.status": "Changed staff status",
  "staff.probation": "Updated probation",
  "staff.assignment_add": "Added an assignment",
  "staff.assignment_end": "Ended an assignment",
  "staff.assignment_expire": "Assignment expired",
  "student.register": "Registered student",
  "student.update": "Updated student details",
  "student.withdraw": "Withdrew student",
  "student.change_section": "Moved to another section",
  "student.guardian_link": "Linked a guardian",
  "student.guardian_revoke": "Removed a guardian link",
  "guardian.update": "Updated guardian details",
  "guardian.account_create": "Created parent account",
  "guardian.contact_change": "Changed contact details",
  "guardian.contact_change_request": "Requested a contact change",
  "role.create": "Created role",
  "role.update": "Updated role permissions",
  "role.delete": "Deleted role",
};

const PAST: Record<string, string> = {
  create: "created", update: "updated", delete: "deleted", archive: "archived", activate: "reactivated",
  approve: "approved", approved: "approved", reject: "rejected", rejected: "rejected", publish: "published",
  submit: "submitted", request: "requested", cancel: "cancelled", issue: "issued", reissue: "reissued",
  close: "closed", confirm: "confirmed", withdraw: "withdrawn", save: "saved", add: "added", end: "ended",
  set: "set", apply: "applied", record: "recorded", reverse: "reversed", verify: "verified", generate: "generated",
  revert: "reverted", commit: "committed", upload: "uploaded", return: "returned", decision: "decided",
};

/** "timetable.periods" → "Timetable periods updated"; "fee_plan.approve" → "Fee plan approved". */
export function humaniseAction(action: string): string {
  const words = action.split(/[._\s-]+/).filter(Boolean).map((word) => word.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase());
  if (!words.length) return "Updated";
  const last = words[words.length - 1];
  const sentence = PAST[last] ? [...words.slice(0, -1), PAST[last]] : [...words, "updated"];
  const text = sentence.join(" ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Plain sentence for an action, refined by what actually changed. */
export function actionTitle(action: string, changes: AuditChange[] = []): string {
  if (action.endsWith(".update") && changes.length > 0) {
    const entity = action.split(".")[0];
    if (changes.every((change) => change.key.startsWith("timings."))) return `Updated ${entity} timings`;
    if (changes.every((change) => change.key === "status")) return `Changed ${entity} status`;
  }
  return TITLES[action] ?? humaniseAction(action);
}

const KIND_RULES: [RegExp, AuditKind][] = [
  [/^auth\.login$|^auth\.otp/, "signin"],
  [/^auth\.|password|2fa/, "security"],
  [/archive|withdraw|delete|revoke|cancel|expire|end$|_end$/, "archive"],
  [/activate|restore|revert/, "restore"],
  [/reject|declined|blocked/, "reject"],
  [/approve|verify|confirm/, "approve"],
  [/publish|issue/, "publish"],
  [/^timetable\.|period|schedule|slot/, "schedule"],
  [/principal|assignment|guardian_link|participants|reassign/, "people"],
  [/settings|policies|preferences/, "settings"],
  [/payment|invoice|fee|refund|payroll|expense|concession|dues/, "money"],
  [/import/, "import"],
  [/create|register|add$|_add$/, "create"],
  [/update|change|save|set|status/, "update"],
];

export function actionKind(action: string): AuditKind {
  return KIND_RULES.find(([pattern]) => pattern.test(action))?.[1] ?? "other";
}
