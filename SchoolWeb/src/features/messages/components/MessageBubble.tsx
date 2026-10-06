import { CheckCheck } from "lucide-react";
import { AttachmentList } from "@/components/shared/AttachmentList";
import { cn } from "@/lib/cn";
import { humanize } from "@/lib/format";
import { messageStamp } from "../format";
import type { Message } from "../types";

export function MessageBubble({ message, mine }: { message: Message; mine: boolean }) {
  return (
    <div className={cn("flex max-w-[85%] flex-col gap-1 sm:max-w-[70%]", mine ? "items-end self-end" : "self-start")}>
      <span className="px-1 text-caption text-fg-muted">
        {mine ? "You" : `${message.sender.name} · ${humanize(message.sender.role)}`}
      </span>
      <div
        className={cn(
          "flex flex-col gap-2 rounded-card px-4 py-2.5",
          mine ? "bg-selected" : "border border-border bg-surface",
        )}
      >
        {message.body && <p className="whitespace-pre-wrap break-words text-label text-fg">{message.body}</p>}
        <AttachmentList items={message.attachments} />
      </div>
      <span className="flex items-center gap-1 whitespace-nowrap px-1 text-caption text-fg-muted">
        {messageStamp(message.sentAt)}
        {mine && message.readByOthers && (
          <>
            <span aria-hidden>·</span>
            <CheckCheck className="size-3.5 text-primary" />
            Seen
          </>
        )}
      </span>
    </div>
  );
}
