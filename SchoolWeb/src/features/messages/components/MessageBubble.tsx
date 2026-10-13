import { CheckCheck } from "lucide-react";
import { AttachmentList } from "@/components/shared/AttachmentList";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
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

      <div className={cn("flex gap-2", mine && "flex-row-reverse")}>
        {/* Avatar for received messages */}
        {!mine && <PersonAvatar name={message.sender.name} size="sm" className="mt-0.5 shrink-0" />}

        <div
          className={cn(
            "group relative flex flex-col gap-2 px-4 py-2.5 transition-colors",
            mine
              ? "rounded-2xl rounded-br-md bg-primary/10"
              : "rounded-2xl rounded-bl-md border border-border bg-surface",
          )}
        >
          {message.body && <p className="whitespace-pre-wrap break-words text-label text-fg">{message.body}</p>}
          <AttachmentList items={message.attachments} />

          {/* Full timestamp tooltip on hover */}
          <span
            className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-fg px-2 py-1 text-[11px] text-on-primary opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
            aria-hidden
          >
            {new Date(message.sentAt).toLocaleString()}
          </span>
        </div>
      </div>

      <span
        className={cn(
          "flex items-center gap-1 whitespace-nowrap text-[11px] leading-4 text-fg-muted",
          mine ? "pr-1" : "pl-11",
        )}
      >
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
