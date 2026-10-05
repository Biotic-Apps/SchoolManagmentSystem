import { LogOut, Monitor, Smartphone } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import { Badge } from "@/components/ui/Badge";
import type { DeviceSession } from "@/features/auth/types";
import { formatDateTime, humanize, textOrDash } from "@/lib/format";

function DeviceName({ device }: { device: DeviceSession }) {
  const Icon = device.platform === "ANDROID" ? Smartphone : Monitor;
  return (
    <span className="flex items-center gap-2">
      <Icon className="size-4 shrink-0 text-fg-muted" />
      <span className="font-medium">{device.deviceName?.trim() || "Unknown device"}</span>
      {device.current && <Badge tone="primary">This device</Badge>}
    </span>
  );
}

export function deviceColumns(onRevoke: (device: DeviceSession) => void): DataTableColumn<DeviceSession>[] {
  return [
    { id: "device", header: "Device", cell: (row) => <DeviceName device={row} /> },
    { id: "platform", header: "Platform", cell: (row) => humanize(row.platform) },
    { id: "ip", header: "IP address", cell: (row) => <span className="font-mono">{textOrDash(row.ip)}</span> },
    { id: "lastUsed", header: "Last used", cell: (row) => formatDateTime(row.lastUsedAt), className: "whitespace-nowrap" },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => (
        <RowActions
          actions={[
            { id: "revoke", label: "Sign out device", icon: LogOut, danger: true, onSelect: () => onRevoke(row), hidden: row.current },
          ]}
        />
      ),
    },
  ];
}
