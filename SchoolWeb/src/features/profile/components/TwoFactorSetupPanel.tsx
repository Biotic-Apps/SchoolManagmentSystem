"use client";

import { FormProvider } from "react-hook-form";
import { FormAlert } from "@/components/shared/FormAlert";
import { TextField } from "@/components/shared/form/TextField";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { groupSecret } from "../recovery-codes";
import type { TwoFactorSetup } from "../two-factor-api";
import type { useTwoFactorCard } from "../use-two-factor-card";
import { useQrDataUrl } from "../use-qr-data-url";

interface TwoFactorSetupPanelProps {
  setup: TwoFactorSetup;
  enableForm: ReturnType<typeof useTwoFactorCard>["enableForm"];
  onCancel: () => void;
}

export function TwoFactorSetupPanel({ setup, enableForm, onCancel }: TwoFactorSetupPanelProps) {
  const qr = useQrDataUrl(setup.otpauthUrl);
  const { form, submit, submitting, formError } = enableForm;

  return (
    <div className="flex flex-col gap-5">
      <ol className="flex list-decimal flex-col gap-1 pl-5 text-label text-fg">
        <li>Open an authenticator app (Google Authenticator, Microsoft Authenticator or similar).</li>
        <li>Scan this QR code, or type the key below.</li>
        <li>Enter the 6-digit code the app shows.</li>
      </ol>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="grid size-48 shrink-0 place-items-center rounded-input border border-border bg-surface p-2">
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element -- generated data URL
            <img src={qr} alt="QR code for your authenticator app" className="size-full" />
          ) : (
            <Skeleton className="size-full" />
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-caption text-fg-muted">Setup key</span>
          <code className="select-all break-all font-mono text-label text-fg">{groupSecret(setup.secret)}</code>
        </div>
      </div>
      <FormProvider {...form}>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormAlert message={formError} />
          <TextField
            name="code"
            label="Code from the app"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={7}
            className="sm:max-w-60"
            required
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={submitting}>
              Turn on
            </Button>
            <Button variant="secondary" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
