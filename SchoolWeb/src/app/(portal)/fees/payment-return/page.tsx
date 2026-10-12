import type { Metadata } from "next";
import { Suspense } from "react";
import { OnlinePaymentReturn } from "@/features/fees/components/parent/OnlinePaymentReturn";

export const metadata: Metadata = { title: "Payment Status" };

export default function Page() {
  return (
    <Suspense>
      <OnlinePaymentReturn />
    </Suspense>
  );
}
