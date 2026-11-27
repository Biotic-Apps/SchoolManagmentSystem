"use client";

import { Link2, Smartphone, Wifi, WifiOff } from "lucide-react";
import { CopyButton } from "@/components/shared/CopyButton";
import { Badge } from "@/components/ui/Badge";
import { API_URL } from "@/config/env";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSmsGatewayStatus } from "../../sms-gateway-api";

interface SmsGatewayTabProps {
  schoolId: string;
}

export function SmsGatewayTab({ schoolId }: SmsGatewayTabProps) {
  const { data, isPending, error } = useSmsGatewayStatus(schoolId);

  if (isPending) return <Skeleton className="h-48 w-full" />;
  if (error) {
    return (
      <Card>
        <CardContent>
          <p className="text-body text-error">Failed to load SMS gateway status.</p>
        </CardContent>
      </Card>
    );
  }

  // The relay talks to the API host, not the web host (same base as the Android app's smsGatewayUrl).
  const gatewayUrl = `${API_URL}/sms-gateway`;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="size-5" />
            SMS Gateway via Android Phone
          </CardTitle>
          <CardDescription>
            Use your school&apos;s Android phone as an SMS relay. The phone polls for pending messages and sends them as
            real SMS.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Connection status */}
          <div className="flex items-center gap-3">
            {data.deviceId ? (
              <>
                <Wifi className="size-5 text-success" />
                <div className="flex flex-col gap-0.5">
                  <p className="text-body font-medium text-fg">Phone connected</p>
                  <p className="text-caption text-fg-muted">Device: {data.deviceId}</p>
                </div>
                <Badge tone="success" dot className="ml-auto">
                  Connected
                </Badge>
              </>
            ) : (
              <>
                <WifiOff className="size-5 text-fg-muted" />
                <div className="flex flex-col gap-0.5">
                  <p className="text-body font-medium text-fg">No phone connected</p>
                  <p className="text-caption text-fg-muted">
                    No relay phone has picked up messages yet. Set one up with the address below.
                  </p>
                </div>
                <Badge tone="neutral" dot className="ml-auto">
                  Disconnected
                </Badge>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-card border border-border bg-surface p-4">
              <p className="text-caption text-fg-muted">Pending messages</p>
              <p className="text-display text-fg">{data.pending}</p>
            </div>
            <div className="rounded-card border border-border bg-surface p-4">
              <p className="text-caption text-fg-muted">Gateway status</p>
              <p className="text-body font-medium text-fg">{data.enabled ? "Enabled" : "Disabled"}</p>
            </div>
            <div className="rounded-card border border-border bg-surface p-4">
              <p className="text-caption text-fg-muted">Last SMS sent</p>
              <p className="text-body font-medium text-fg">
                {data.lastSentAt ? new Date(data.lastSentAt).toLocaleString() : "Never"}
              </p>
            </div>
          </div>

          {/* Relay address. There is no QR pairing: the relay signs in like any staff user. */}
          <div className="flex flex-col items-center gap-4 rounded-card border border-border bg-surface p-6">
            <Link2 className="size-8 text-fg-muted" />
            <h3 className="text-body font-semibold text-fg">Relay address</h3>
            <p className="text-center text-caption text-fg-muted">
              The relay phone signs in with a staff account of this school that can view settings, then uses this
              address: it fetches waiting messages from <code>/pending</code> and confirms each one it sent.
            </p>
            <div className="flex max-w-full items-center gap-2">
              <code className="block max-w-full overflow-x-auto rounded-input bg-background px-3 py-2 text-caption text-fg">
                {gatewayUrl}
              </code>
              <CopyButton text={gatewayUrl} aria-label="Copy relay address" />
            </div>
            <p className="text-center text-caption text-fg-muted">
              The phone checks for waiting messages every few seconds and sends them as normal SMS from its SIM card.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
