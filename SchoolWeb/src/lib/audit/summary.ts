import { actionTitle } from "./actions";
import { auditChanges, type AuditChange } from "./diff";
import { recordFacts, recordSentence } from "./facts";

// One audit entry → a plain-language title plus readable change rows.

export type NameLookup = (id: string) => string | undefined;

export interface AuditSummary {
  title: string;
  changes: AuditChange[];
}

type Row = Record<string, unknown>;

const CREATE_VERBS = new Set(["create", "register"]);
const DELETE_VERBS = new Set(["delete", "remove"]);

function asRow(value: unknown): Row | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? (value as Row) : null;
}

function ids(value: unknown): string[] {
  if (typeof value === "string" && value) return [value];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && !!item) : [];
}

/** User ids an entry refers to, so the page can look their names up. */
export function referencedUserIds(action: string, before: unknown, after: unknown): string[] {
  if (action !== "branch.principal_change") return [];
  return [...new Set([...ids(asRow(after)?.principalUserId), ...ids(asRow(after)?.endedFor), ...ids(asRow(before)?.principalUserId)])];
}

function principalChange(before: Row | null, after: Row | null, lookup: NameLookup): AuditSummary {
  const nextId = ids(after?.principalUserId)[0];
  const title = nextId ? `Principal changed to ${lookup(nextId) ?? "a new principal"}` : "Principal removed";
  const ended = ids(after?.endedFor);
  const previous = ended.length ? ended : ids(before?.principalUserId).filter((id) => id !== nextId);
  if (!previous.length) return { title, changes: [] };
  const names = previous.map(lookup).filter((name): name is string => !!name);
  const to = names.length ? `${names.join(", ")} removed` : "Removed";
  return { title, changes: [{ key: "previousPrincipal", label: "Previous principal", from: null, to }] };
}

export function summariseAudit(action: string, before: unknown, after: unknown, lookup: NameLookup = () => undefined): AuditSummary {
  const parts = action.split(".");
  const verb = parts[parts.length - 1];
  const entity = parts.length > 1 ? parts[0].replace(/_/g, " ") : "record";
  const listKey = verb || "items";

  if (action === "branch.principal_change") return principalChange(asRow(before), asRow(after), lookup);
  // "staff.account.create" makes something inside the record, not the record itself.
  if (parts.length > 2 && CREATE_VERBS.has(verb) && after) {
    return { title: actionTitle(action), changes: recordFacts(after, listKey) };
  }
  if (CREATE_VERBS.has(verb) && after) {
    return { title: recordSentence("Created", entity, asRow(after) ?? {}), changes: recordFacts(after, listKey) };
  }
  if (DELETE_VERBS.has(verb) && before) {
    return { title: recordSentence("Deleted", entity, asRow(before) ?? {}), changes: recordFacts(before, listKey) };
  }
  const changes = auditChanges(before, after, action);
  return { title: actionTitle(action, changes), changes };
}
