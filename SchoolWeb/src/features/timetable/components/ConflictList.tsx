import { InlineNotice } from "@/components/shared/InlineNotice";
import type { ConflictsState } from "../use-conflicts";

/** Result of the last check/publish attempt; conflicting cells are highlighted in the grid too. */
export function ConflictList({ conflicts }: { conflicts: ConflictsState }) {
  if (!conflicts.checked || conflicts.items.length === 0) return null;
  const count = conflicts.items.length;
  return (
    <InlineNotice tone="error">
      <p className="font-medium">
        {count} conflict{count === 1 ? "" : "s"} to fix before publishing
      </p>
      <ul className="mt-1 flex list-disc flex-col gap-1 pl-4">
        {conflicts.items.map((item) => (
          <li key={item.id}>
            <span className="font-medium">{item.where}</span> — {item.type}: {item.message}
          </li>
        ))}
      </ul>
    </InlineNotice>
  );
}
