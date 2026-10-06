"use client";

import { FormProvider } from "react-hook-form";
import { FormAlert } from "@/components/shared/FormAlert";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { TextField } from "@/components/shared/form/TextField";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useContactChangeForm } from "../use-contact-change-form";

export function ContactChangeCard() {
  const { form, submit, submitting, formError, sent } = useContactChangeForm();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request contact change</CardTitle>
        <CardDescription>
          The school keeps your verified phone, email and address. Changes apply after the school approves them.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form onSubmit={submit} noValidate className="flex flex-col gap-4">
            <FormAlert message={formError} />
            {sent && <InlineNotice tone="info">Your request was sent. You&apos;ll be notified once it is reviewed.</InlineNotice>}
            <TextField name="newPhone" label="New phone" type="tel" autoComplete="tel" />
            <TextField name="newEmail" label="New email" type="email" autoComplete="email" />
            <TextField name="newAddress" label="New address" autoComplete="street-address" />
            <Button type="submit" loading={submitting} className="self-start">
              Send request
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
