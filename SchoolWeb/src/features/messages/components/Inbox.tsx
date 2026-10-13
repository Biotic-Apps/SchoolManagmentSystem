"use client";

import { MessagesSquare } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { useInbox } from "../use-inbox";
import { Conversation } from "./Conversation";
import { NewThreadDialog } from "./NewThreadDialog";
import { ThreadList } from "./ThreadList";

/** Two panes on large screens; on small screens the list or the open conversation. */
export function Inbox() {
  const inbox = useInbox();
  const open = !!inbox.selectedId;

  return (
    <Card className="grid h-[calc(100dvh-14rem)] min-h-[32rem] grid-rows-1 overflow-hidden lg:grid-cols-[380px_1fr]">
      <div
        className={cn(
          "min-h-0 flex-col border-border transition-all lg:flex lg:border-r lg:bg-surface",
          open ? "hidden" : "flex",
        )}
      >
        <ThreadList inbox={inbox} />
      </div>
      <div className={cn("min-h-0 min-w-0 flex-col transition-all lg:flex", open ? "flex" : "hidden")}>
        {inbox.selectedId ? (
          <Conversation
            key={`${inbox.selectedId}:${inbox.scope}`}
            threadId={inbox.selectedId}
            readOnly={inbox.readOnly}
            onBack={inbox.back}
          />
        ) : (
          <EmptyState
            icon={MessagesSquare}
            title="No conversation selected"
            description="Select a thread from the list to view messages and reply."
            className="h-full opacity-80"
          />
        )}
      </div>
      {inbox.composing && (
        <NewThreadDialog
          onClose={() => inbox.setComposing(false)}
          onCreated={(threadId) => {
            inbox.setComposing(false);
            inbox.select(threadId);
          }}
        />
      )}
    </Card>
  );
}
