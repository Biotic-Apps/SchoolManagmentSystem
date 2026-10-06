"use client";

import { FormProvider } from "react-hook-form";
import { FormAlert } from "@/components/shared/FormAlert";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { Button } from "@/components/ui/Button";
import { RELATION_OPTIONS } from "@/features/people/options";
import type { useLinkChild } from "../use-link-child";

type DetailsForm = ReturnType<typeof useLinkChild>["details"];

export function LinkChildDetailsForm({ form: { form, submit, submitting, formError } }: { form: DetailsForm }) {
  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <FormAlert message={formError} />
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField name="admissionNo" label="Admission number" required autoComplete="off" />
          <TextField name="dob" label="Date of birth" type="date" required />
          <SelectField name="relation" label="Your relation" options={RELATION_OPTIONS} required />
        </div>
        <Button type="submit" loading={submitting} className="self-start">
          Send code
        </Button>
      </form>
    </FormProvider>
  );
}
