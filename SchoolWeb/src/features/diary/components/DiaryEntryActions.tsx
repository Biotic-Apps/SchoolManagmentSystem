import { Pencil, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { DiaryTabState } from "../use-diary-tab";
import type { DiaryEntry } from "../types";

export function DiaryEntryActions({ entry, tab }: { entry: DiaryEntry; tab: DiaryTabState }) {
  const publishing = tab.publishingId === entry.id;
  return (
    <>
      {tab.canEditEntry(entry) && (
        <Button variant="secondary" size="sm" onClick={() => tab.editor.show(entry)} disabled={publishing}>
          <Pencil />
          Edit
        </Button>
      )}
      {tab.canPublishEntry(entry) && (
        <Button size="sm" loading={publishing} disabled={!!tab.publishingId} onClick={() => tab.publish(entry)}>
          <Send />
          Publish
        </Button>
      )}
    </>
  );
}
