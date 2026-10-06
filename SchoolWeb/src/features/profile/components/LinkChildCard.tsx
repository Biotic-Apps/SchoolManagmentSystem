"use client";

import { InlineNotice } from "@/components/shared/InlineNotice";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useLinkChild } from "../use-link-child";
import { LinkChildDetailsForm } from "./LinkChildDetailsForm";
import { LinkChildOtpForm } from "./LinkChildOtpForm";

export function LinkChildCard() {
  const link = useLinkChild();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Link a child</CardTitle>
        <CardDescription>
          Enter your child&apos;s admission number and date of birth. We send a code to the phone the school has on record.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {link.step === "details" && <LinkChildDetailsForm form={link.details} />}
        {link.step === "otp" && link.started && (
          <LinkChildOtpForm form={link.otp} started={link.started} onBack={link.restart} />
        )}
        {link.step === "sent" && (
          <>
            <InlineNotice tone="info">
              Request sent. The school will review it; your child appears in the switcher once it is approved.
            </InlineNotice>
            <Button variant="secondary" onClick={link.restart} className="self-start">
              Link another child
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
