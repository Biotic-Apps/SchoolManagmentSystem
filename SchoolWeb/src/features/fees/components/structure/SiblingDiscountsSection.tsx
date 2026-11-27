"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { FormAlert } from "@/components/shared/FormAlert";
import { useServerForm } from "@/lib/use-server-form";
import {
  useSiblingDiscounts,
  useCreateSiblingDiscount,
  useUpdateSiblingDiscount,
  useDeleteSiblingDiscount,
  type SiblingDiscount,
} from "../../sibling-discount-api";
import {
  siblingDiscountSchema,
  SIBLING_DISCOUNT_DEFAULTS,
  type SiblingDiscountFormValues,
} from "../../sibling-discount-schemas";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

interface Props {
  schoolId: string | null;
}

export function SiblingDiscountsSection({ schoolId }: Props) {
  const { data: rules = [], isLoading } = useSiblingDiscounts(schoolId);
  const createMut = useCreateSiblingDiscount();
  const updateMut = useUpdateSiblingDiscount();
  const deleteMut = useDeleteSiblingDiscount();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<SiblingDiscount | null>(null);

  const { form, submit, formError } = useServerForm<SiblingDiscountFormValues>({
    schema: siblingDiscountSchema,
    defaultValues: SIBLING_DISCOUNT_DEFAULTS,
    conflictField: "childIndex",
    onSubmit: async (values) => {
      if (editId) return updateMut.mutateAsync({ id: editId, percentOff: values.percentOff });
      if (!schoolId) throw new Error("Choose a school first");
      return createMut.mutateAsync({ ...values, schoolId });
    },
    onSuccess: () => {
      form.reset(SIBLING_DISCOUNT_DEFAULTS);
      setShowForm(false);
      setEditId(null);
    },
  });

  const startEdit = (rule: SiblingDiscount) => {
    setEditId(rule.id);
    form.reset({ childIndex: rule.childIndex, percentOff: rule.percentOff });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditId(null);
    form.reset(SIBLING_DISCOUNT_DEFAULTS);
  };

  if (!schoolId) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Sibling Discounts</CardTitle>
        {!showForm && (
          <Button size="sm" variant="secondary" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Add rule
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {rules.length === 0 && !isLoading && !showForm && (
          <InlineNotice>
            No sibling discount rules configured. Add rules to automatically discount fees for
            families with multiple children.
          </InlineNotice>
        )}

        {rules.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Child</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>{ordinal(rule.childIndex)} child</TableCell>
                  <TableCell>{rule.percentOff}%</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Edit ${ordinal(rule.childIndex)} child discount`}
                      onClick={() => startEdit(rule)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Remove ${ordinal(rule.childIndex)} child discount`}
                      onClick={() => setDeleting(rule)}
                      disabled={deleteMut.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {showForm && (
          <form onSubmit={submit} className="space-y-2">
            <FormAlert message={formError} />
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <Label htmlFor="sibling-child-index">Child #</Label>
                <Input
                  id="sibling-child-index"
                  type="number"
                  className="w-24"
                  disabled={!!editId}
                  {...form.register("childIndex", { valueAsNumber: true })}
                />
                {form.formState.errors.childIndex && (
                  <p className="text-xs text-destructive">{form.formState.errors.childIndex.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="sibling-percent-off">Discount %</Label>
                <Input
                  id="sibling-percent-off"
                  type="number"
                  className="w-24"
                  {...form.register("percentOff", { valueAsNumber: true })}
                />
                {form.formState.errors.percentOff && (
                  <p className="text-xs text-destructive">{form.formState.errors.percentOff.message}</p>
                )}
              </div>
              <Button type="submit" size="sm" disabled={createMut.isPending || updateMut.isPending}>
                {editId ? "Update" : "Add"}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={cancelForm}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Remove sibling discount?"
        description={
          deleting
            ? `The ${ordinal(deleting.childIndex)} child discount (${deleting.percentOff}%) will no longer apply to new invoices.`
            : undefined
        }
        confirmLabel="Remove"
        tone="danger"
        loading={deleteMut.isPending}
        onConfirm={() =>
          deleting && deleteMut.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      />
    </Card>
  );
}
