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
    <Card className="grid h-[calc(100dvh-14rem)] min-h-[32rem] grid-rows-1 overflow-hidden lg:grid-cols-[360px_1fr]">
      <div className={cn("min-h-0 flex-col border-border lg:flex lg:border-r", open ? "hidden" : "flex")}>
        <ThreadList inbox={inbox} />
      </div>
      <div className={cn("min-h-0 min-w-0 flex-col lg:flex", open ? "flex" : "hidden")}>
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
            title="Pick a conversation"
            description="Choose a thread to read and reply."
            className="h-full"
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
