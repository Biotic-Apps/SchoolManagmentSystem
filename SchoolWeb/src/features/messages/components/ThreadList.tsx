"use client";

import { Inbox as InboxIcon, Plus, Search } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import type { InboxState } from "../use-inbox";
import { ScopeToggle } from "./ScopeToggle";
import { ThreadRow } from "./ThreadRow";

export function ThreadList({ inbox }: { inbox: InboxState }) {
  const { query, threads } = inbox;
  const filtered = !!inbox.search.trim() || inbox.unreadOnly;

  return (
    <>
      {/* Search header */}
      <div className="flex flex-col gap-3 border-b border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
            <Input
              type="search"
              value={inbox.search}
              onChange={(event) => inbox.setSearch(event.target.value)}
              placeholder="Search messages"
              aria-label="Search messages"
              className="rounded-full pl-9"
            />
          </div>
          {!inbox.readOnly && (
            <Button
              size="icon"
              className="size-11 rounded-full bg-primary text-on-primary shadow-sm hover:bg-primary/90"
              aria-label="New message"
              onClick={() => inbox.setComposing(true)}
            >
              <Plus />
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => inbox.setUnreadOnly(!inbox.unreadOnly)}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              inbox.unreadOnly
                ? "border-primary bg-primary text-on-primary"
                : "border-border bg-transparent text-fg-muted hover:border-fg-muted"
            }`}
          >
            Unread only
          </button>
          {inbox.canReadBranch && <ScopeToggle value={inbox.scope} onChange={inbox.setScope} />}
        </div>
      </div>

      {/* Thread list */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Thread count indicator */}
        {!query.isLoading && !query.error && threads.length > 0 && (
          <div className="border-b border-border px-4 py-2">
            <span className="text-xs text-fg-muted">
              {threads.length} {threads.length === 1 ? "conversation" : "conversations"}
            </span>
          </div>
        )}

        {/* Loading skeletons */}
        {query.isLoading && (
          <div className="flex flex-col">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex items-start gap-3 border-b border-border p-4">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!!query.error && <ErrorState error={query.error} onRetry={() => query.refetch()} />}

        {/* Empty state */}
        {!query.isLoading && !query.error && threads.length === 0 && (
          <EmptyState
            icon={InboxIcon}
            title={filtered ? "No matching conversations" : "No conversations yet"}
            description={
              filtered
                ? "Try adjusting your search or filters."
                : inbox.readOnly
                  ? "Messages will appear here once you receive them."
                  : "Send your first message to get started."
            }
            action={
              !inbox.readOnly && !filtered ? (
                <Button
                  className="mt-2 rounded-full bg-primary text-on-primary hover:bg-primary/90"
                  onClick={() => inbox.setComposing(true)}
                >
                  <Plus className="size-4" />
                  New message
                </Button>
              ) : undefined
            }
          />
        )}

        {/* Thread rows */}
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
