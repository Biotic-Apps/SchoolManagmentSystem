"use client";

import { Send } from "lucide-react";
import { FormProvider } from "react-hook-form";
import { FormAlert } from "@/components/shared/FormAlert";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { TEST_MESSAGE_CHANNELS } from "../../test-message-schema";
import { useTestMessageForm } from "../../use-test-message-form";

export function TestMessageCard() {
  const { form, submit, submitting, formError, channel, result } = useTestMessageForm();
  const email = channel === "EMAIL";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send test message</CardTitle>
        <CardDescription>
          Checks the email and SMS provider settings by sending one message right away.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form onSubmit={submit} noValidate className="flex flex-col gap-4">
            <FormAlert message={formError} />
            <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
              <SelectField name="channel" label="Channel" options={TEST_MESSAGE_CHANNELS} required />
              <TextField
                key={channel}
                name="to"
                label={email ? "Email address" : "Mobile number"}
                type={email ? "email" : "tel"}
                inputMode={email ? "email" : "tel"}
                autoComplete="off"
                required
              />
            </div>
            {result?.ok && <InlineNotice>Sent. Check the inbox or phone to confirm it arrived.</InlineNotice>}
            {result && !result.ok && (
              <InlineNotice tone="error">Not sent: {result.error ?? "the provider rejected the message."}</InlineNotice>
            )}
            <Button type="submit" loading={submitting} className="self-start">
              <Send />
              Send test
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
