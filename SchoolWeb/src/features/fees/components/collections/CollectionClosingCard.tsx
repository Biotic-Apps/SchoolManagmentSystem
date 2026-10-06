"use client";

import { DetailList } from "@/components/shared/DetailList";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { MoneyText } from "@/components/shared/MoneyText";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { EMPTY_VALUE, formatDateTime, textOrDash } from "@/lib/format";
import type { DailyCollection } from "../../types";

/** Stored closing of a closed day. */
export function CollectionClosingCard({ closing, expectedCashMinor }: { closing: DailyCollection["closing"]; expectedCashMinor: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Day closed</CardTitle>
        <CardDescription>The cash count recorded when this day was closed.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <InlineNotice tone="warning">Back-dated cash payments for this day are blocked.</InlineNotice>
        <DetailList
          items={[
            { label: "Expected cash", value: <MoneyText amountMinor={expectedCashMinor} /> },
            { label: "Cash counted", value: <MoneyText amountMinor={closing?.cashCountedMinor} /> },
            { label: "Difference", value: <MoneyText amountMinor={closing?.differenceMinor} /> },
            { label: "Closed by", value: closing?.closedBy?.name ?? EMPTY_VALUE },
            { label: "Closed at", value: formatDateTime(closing?.closedAt) },
            { label: "Note", value: textOrDash(closing?.note) },
          ]}
        />
      </CardContent>
    </Card>
  );
}
