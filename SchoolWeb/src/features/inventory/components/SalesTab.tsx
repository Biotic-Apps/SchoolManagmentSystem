"use client";

import { FormProvider } from "react-hook-form";
import { FormAlert } from "@/components/shared/FormAlert";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { StudentSearchField } from "@/features/students/components/StudentSearchField";
import { useItemLookups } from "../use-item-lookups";
import { useSaleForm } from "../use-sale-form";
import { SaleLines } from "./SaleLines";

export function SalesTab({ branchId }: { branchId: string }) {
  const lookups = useItemLookups(branchId);
  const sale = useSaleForm(lookups);
  const noItems = !lookups.isLoading && lookups.saleableOptions.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sell to a student</CardTitle>
        <CardDescription>
          Uniforms, books and other saleable items. The items are issued from this branch&apos;s stock and added as
          lines to the student&apos;s fee invoice.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...sale.form}>
          <form onSubmit={sale.submit} noValidate className="flex flex-col gap-4">
            <FormAlert message={sale.formError} />
            {noItems && <InlineNotice tone="warning">No saleable items yet. Mark items as “Sold to students” first.</InlineNotice>}
            <StudentSearchField name="studentId" branchId={branchId} required />
            <SaleLines sale={sale} itemOptions={lookups.saleableOptions} />
            <div className="flex justify-end">
              <Button type="submit" loading={sale.submitting} disabled={noItems}>
                Record sale
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
