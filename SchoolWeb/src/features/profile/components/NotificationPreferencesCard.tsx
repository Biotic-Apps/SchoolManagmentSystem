"use client";

import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useNotificationPreferencesCard } from "../use-notification-preferences";
import { NotificationPreferenceRow } from "./NotificationPreferenceRow";

export function NotificationPreferencesCard() {
  const card = useNotificationPreferencesCard();
  return (
    <Card>
      <CardHeader className="sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Everything always appears in your in-app notifications. Choose what also sends a push alert to your phone.
          </CardDescription>
        </div>
        <div className="flex gap-2 self-start">
          {card.dirty && (
            <Button variant="ghost" onClick={card.reset} disabled={card.saving}>
              Discard
            </Button>
          )}
          <Button onClick={card.save} loading={card.saving} disabled={!card.dirty || card.query.isLoading}>
            Save
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {card.query.isLoading && <Skeleton className="h-64 w-full" />}
        {!!card.query.error && <ErrorState error={card.query.error} onRetry={() => card.query.refetch()} />}
        {!card.query.isLoading && !card.query.error && (
          <div className="overflow-hidden rounded-card border border-border">
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-6 border-b border-border bg-background px-4 py-2.5 text-caption font-medium text-fg-muted">
              <span>Category</span>
              <span className="w-14 text-center">In-app</span>
              <span className="w-14 text-center">Push</span>
            </div>
            <ul className="divide-y divide-border">
              {card.rows.map((row) => (
                <NotificationPreferenceRow key={row.id} row={row} onToggle={card.toggle} />
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
