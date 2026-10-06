"use client";

import { ShieldCheck } from "lucide-react";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useTwoFactorCard } from "../use-two-factor-card";
import { DisableTwoFactorDialog } from "./DisableTwoFactorDialog";
import { RecoveryCodesDialog } from "./RecoveryCodesDialog";
import { TwoFactorSetupPanel } from "./TwoFactorSetupPanel";

export function TwoFactorCard() {
  const card = useTwoFactorCard();

  return (
    <Card>
      <CardHeader className="sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle>Two-step sign-in</CardTitle>
          <CardDescription>Ask for a code from your phone each time you sign in.</CardDescription>
        </div>
        <Badge tone={card.enabled ? "success" : "neutral"} className="self-start">
          {card.enabled ? "On" : "Off"}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {card.required && !card.enabled && (
          <InlineNotice tone="warning">Your school requires two-step sign-in for your role. Turn it on now.</InlineNotice>
        )}
        {card.setup ? (
          <TwoFactorSetupPanel setup={card.setup} enableForm={card.enableForm} onCancel={card.cancelSetup} />
        ) : card.enabled ? (
          <div className="flex flex-col gap-3">
            <p className="text-label text-fg-muted">
              Signing in needs your password and a code from your authenticator app. Lost your phone? Use a recovery
              code.
            </p>
            {!card.required && (
              <Button variant="danger" className="self-start" onClick={() => card.setDisableOpen(true)}>
                Turn off
              </Button>
            )}
          </div>
        ) : (
          <Button className="self-start" loading={card.starting} onClick={card.beginSetup}>
            <ShieldCheck />
            Set up two-step sign-in
          </Button>
        )}
      </CardContent>
      {card.disableOpen && (
        <DisableTwoFactorDialog onClose={() => card.setDisableOpen(false)} onDisabled={card.onDisabled} />
      )}
      <RecoveryCodesDialog codes={card.recoveryCodes} account={card.account} onClose={card.closeRecoveryCodes} />
    </Card>
  );
}
