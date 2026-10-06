import { Suspense } from "react";
import type { Metadata } from "next";
import { GuardiansPage } from "@/features/guardians/components/GuardiansPage";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";

export const metadata: Metadata = { title: "Parents & Guardians" };

export default function Page() {
  return (
    <ModuleGuard moduleId="guardians">
      {/* useSearchParams (?open=) needs a Suspense boundary for static rendering. */}
      <Suspense>
        <GuardiansPage />
      </Suspense>
    </ModuleGuard>
  );
}
