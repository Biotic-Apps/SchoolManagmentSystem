import { useMemo } from "react";
import { useWatch } from "react-hook-form";
import type { Option } from "@/components/shared/OptionSelect";
import { useVendors } from "@/features/expenses/vendors-api";
import { toMinor } from "@/lib/money";
import { useServerForm } from "@/lib/use-server-form";
import { orderDefaults, orderSchema, toOrderInput } from "./purchase-order-schemas";
import { useCreatePurchaseOrder } from "./purchasing-api";
import type { PurchaseRequest } from "./types";

const ALL_VENDORS = { page: 1, pageSize: 100 };

export function useOrderForm(request: PurchaseRequest, onDone: () => void) {
  const create = useCreatePurchaseOrder(request.id);
  const vendors = useVendors(ALL_VENDORS);
  const { form, submit, submitting, formError } = useServerForm({
    schema: orderSchema,
    defaultValues: orderDefaults(request),
    onSubmit: (values) => create.mutateAsync(toOrderInput(values)),
    onSuccess: onDone,
  });
  const lines = useWatch({ control: form.control, name: "lines" });
  const vendorOptions: Option[] = useMemo(
    () => (vendors.data?.data ?? []).map((vendor) => ({ id: vendor.id, name: vendor.name })),
    [vendors.data],
  );
  const lineTotals = (lines ?? []).map((line) => (Number(line.quantity) || 0) * (toMinor(line.unitPrice) ?? 0));

  return {
    form,
    submit,
    submitting,
    formError,
    vendorOptions,
    vendorsLoading: vendors.isLoading,
    lineTotals,
    total: lineTotals.reduce((sum, value) => sum + value, 0),
  };
}
