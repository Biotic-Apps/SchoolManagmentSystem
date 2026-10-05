"use client";

import type { ReactNode } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useSessionGate } from "../use-session-gate";
import { ForcedPasswordChange } from "./ForcedPasswordChange";

export function SessionGate({ children }: { children: ReactNode }) {
  const status = useSessionGate();
  if (status === "password-change") return <ForcedPasswordChange />;
  if (status !== "authenticated") {
    return (
      <div className="grid min-h-dvh place-items-center bg-background text-fg-muted">
        <Spinner className="size-6" label="Checking your session" />
      </div>
    );
  }
  return children;
}
