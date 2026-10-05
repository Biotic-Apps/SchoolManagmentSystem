"use client";

import { FormProvider } from "react-hook-form";
import { FormAlert } from "@/components/shared/FormAlert";
import { TextField } from "@/components/shared/form/TextField";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useProfileForm } from "../use-profile-form";

export function ProfileDetailsCard() {
  const { form, submit, submitting, formError, dirty } = useProfileForm();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your details</CardTitle>
        <CardDescription>You can sign in with your email or phone number.</CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form onSubmit={submit} noValidate className="flex flex-col gap-4">
            <FormAlert message={formError} />
            <TextField name="name" label="Full name" autoComplete="name" required />
            <TextField name="email" label="Email" type="email" autoComplete="email" />
            <TextField name="phone" label="Phone" type="tel" autoComplete="tel" />
            <Button type="submit" loading={submitting} disabled={!dirty} className="self-start">
              Save details
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
