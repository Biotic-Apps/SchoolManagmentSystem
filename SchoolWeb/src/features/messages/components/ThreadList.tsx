"use client";

import { Inbox as InboxIcon, Plus, Search } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Skeleton } from "@/components/ui/Skeleton";
import type { InboxState } from "../use-inbox";
import { ScopeToggle } from "./ScopeToggle";
import { ThreadRow } from "./ThreadRow";

export function ThreadList({ inbox }: { inbox: InboxState }) {
  const { query, threads } = inbox;
  const filtered = !!inbox.search.trim() || inbox.unreadOnly;

  return (
    <>
      <div className="flex flex-col gap-3 border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
            <Input
              type="search"
              value={inbox.search}
              onChange={(event) => inbox.setSearch(event.target.value)}
              placeholder="Search messages"
              aria-label="Search messages"
              className="pl-9"
            />
          </div>
          {!inbox.readOnly && (
            <Button size="icon" className="size-11" aria-label="New message" onClick={() => inbox.setComposing(true)}>
              <Plus />
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="inbox-unread-only"
              checked={inbox.unreadOnly}
              onCheckedChange={(checked) => inbox.setUnreadOnly(checked === true)}
            />
            <Label htmlFor="inbox-unread-only">Unread only</Label>
          </div>
          {inbox.canReadBranch && <ScopeToggle value={inbox.scope} onChange={inbox.setScope} />}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {query.isLoading && (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        )}
        {!!query.error && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
        {!query.isLoading && !query.error && threads.length === 0 && (
          <EmptyState
            icon={InboxIcon}
            title={filtered ? "No matching conversations" : "No conversations yet"}
            description={inbox.readOnly || filtered ? undefined : "Start one with the + button."}
          />
        )}
        <ul className="flex flex-col">
          {threads.map((thread) => (
            <li key={thread.id} className="border-b border-border last:border-b-0">
              <ThreadRow
                thread={thread}
                selected={thread.id === inbox.selectedId}
                onSelect={() => inbox.select(thread.id)}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
