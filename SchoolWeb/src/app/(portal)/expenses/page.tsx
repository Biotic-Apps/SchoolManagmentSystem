import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { ExpensesRoute } from "@/features/expenses/components/ExpensesRoute";

export const metadata: Metadata = { title: "Expenses & Vendors" };

export default function Page() {
  return (
    <ModuleGuard moduleId="expenses">
      <ExpensesRoute />
    </ModuleGuard>
  );
}
