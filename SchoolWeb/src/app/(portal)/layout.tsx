import type { ReactNode } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { SessionGate } from "@/features/auth/components/SessionGate";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <SessionGate>
      <PortalShell>{children}</PortalShell>
    </SessionGate>
  );
}
