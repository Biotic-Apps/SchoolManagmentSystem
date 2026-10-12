import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { AccountsRoute } from "@/features/accounts/components/AccountsRoute";

export const metadata: Metadata = { title: "Accounts" };

export default function Page() {
  return (
    <ModuleGuard moduleId="accounts">
      <AccountsRoute />
    </ModuleGuard>
  );
}
