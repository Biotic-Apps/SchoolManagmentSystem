"use client";

import { Search } from "lucide-react";
import { FormProvider } from "react-hook-form";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/Card";
import { StudentSearchField } from "@/features/students/components/StudentSearchField";
import { usePickupLookup } from "../use-pickup-lookup";
import { PickupPersonsTab } from "./PickupPersonsTab";

export function AuthorizedPersonsTab({ branchId }: { branchId: string }) {
  const { form, studentId } = usePickupLookup();
  return (
    <div className="flex flex-col gap-4">
      <FormProvider {...form}>
        <div className="md:w-96">
          <StudentSearchField name="studentId" label="Find a student" branchId={branchId} />
        </div>
      </FormProvider>
      {studentId ? (
        <Card>
          <CardContent>
            <PickupPersonsTab key={studentId} studentId={studentId} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={Search}
            title="Search for a student"
            description="See and verify the people authorized to collect them."
          />
        </Card>
      )}
    </div>
  );
}
