"use client";

import { Clock, Plus } from "lucide-react";
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
  const { ownBranch } = page;
  const actions = (ownBranch || page.perms.canAdd) && (
    <>
      {ownBranch && (
        <Button onClick={() => page.timings.show(ownBranch)}>
          <Clock />
          Edit timings
        </Button>
      )}
      {page.perms.canAdd && (
        <Button onClick={() => page.form.show()}>
          <Plus />
          Add branch
        </Button>
      )}
    </>
  );

  return (
    <>
      <PageHeader title={view.title} description={view.description} actions={actions} />
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
