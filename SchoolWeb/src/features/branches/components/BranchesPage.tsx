"use client";

import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { SessionsCalendarPanel } from "@/features/sessions/components/SessionsCalendarPanel";
import { useBranchesPage } from "../use-branches-page";
import { useBranchesView } from "../use-branches-view";
import { BranchesList } from "./BranchesList";

export function BranchesPage() {
  const page = useBranchesPage();
  const view = useBranchesView();

  return (
    <>
      <PageHeader
        title={view.title}
        description={view.description}
        actions={
          page.perms.canAdd && (
            <Button onClick={() => page.form.show()}>
              <Plus />
              Add branch
            </Button>
          )
        }
      />
      {view.showCalendarTab ? (
        <Tabs defaultValue="branch">
          <TabsList>
            <TabsTrigger value="branch">Branch</TabsTrigger>
            <TabsTrigger value="calendar">Sessions & Calendar</TabsTrigger>
          </TabsList>
          <TabsContent value="branch">
            <BranchesList page={page} />
          </TabsContent>
          <TabsContent value="calendar">
            <SessionsCalendarPanel />
          </TabsContent>
        </Tabs>
      ) : (
        <BranchesList page={page} />
      )}
    </>
  );
}
