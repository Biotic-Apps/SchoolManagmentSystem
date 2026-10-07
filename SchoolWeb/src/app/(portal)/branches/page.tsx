import { Suspense } from "react";
import type { Metadata } from "next";
import { BranchesPage } from "@/features/branches/components/BranchesPage";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";

export const metadata: Metadata = { title: "Branches" };

export default function Page() {
  return (
    <ModuleGuard moduleId="branches">
      {/* useSearchParams (?open=) needs a Suspense boundary for static rendering. */}
      <Suspense>
        <BranchesPage />
      </Suspense>
    </ModuleGuard>
  );
}
