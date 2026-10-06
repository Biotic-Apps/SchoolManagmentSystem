import type { ReactNode } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime, formatNumber, textOrDash } from "@/lib/format";
import { lastBackupAt } from "./support-format";
import type { SystemHealth } from "./support-types";

export interface HealthTileData {
  id: string;
  label: string;
  value: ReactNode;
  hint?: string;
}

export function healthTiles(health: SystemHealth): HealthTileData[] {
  const dbOk = health.db?.toLowerCase() === "ok";
  const storageOk = !!health.storage?.ok;
  return [
    {
      id: "db",
      label: "Database",
      value: <StatusBadge status={dbOk ? "OK" : "DOWN"} label={dbOk ? "OK" : "Down"} />,
    },
    {
      id: "queue",
      label: "Job queue",
      value: textOrDash(health.queue?.driver),
      hint: `${formatNumber(health.queue?.waiting ?? 0)} waiting · ${formatNumber(health.queue?.failed ?? 0)} failed`,
    },
    {
      id: "storage",
      label: "File storage",
      value: (
        <span className="flex flex-wrap items-center gap-2">
          {textOrDash(health.storage?.driver)}
          <StatusBadge status={storageOk ? "OK" : "DOWN"} label={storageOk ? "OK" : "Unreachable"} />
        </span>
      ),
    },
    { id: "backup", label: "Last backup", value: formatDateTime(lastBackupAt(health.lastBackup)) },
    { id: "restore", label: "Last verified restore", value: formatDateTime(health.lastRestoreVerified) },
    { id: "version", label: "Version", value: <span className="font-mono">{textOrDash(health.version)}</span> },
  ];
}
