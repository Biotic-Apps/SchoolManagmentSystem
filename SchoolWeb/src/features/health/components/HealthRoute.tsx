"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useHealthRoute } from "../use-health-route";
import { AllergyAlertsTab } from "./AllergyAlertsTab";
import { ChangeRequestsTab } from "./ChangeRequestsTab";
import { IncidentsTab } from "./IncidentsTab";

export function HealthRoute() {
  const { tab, setTab, canEdit } = useHealthRoute();
  return (
    <>
      <PageHeader
        title="Health & Safety"
        description="Incidents, allergy alerts for class rosters and parent requests to update health records."
      />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="max-w-full overflow-x-auto">
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="alerts">Allergy alerts</TabsTrigger>
          {canEdit && <TabsTrigger value="requests">Change requests</TabsTrigger>}
        </TabsList>
        <TabsContent value="incidents">
          <IncidentsTab />
        </TabsContent>
        <TabsContent value="alerts">
          <AllergyAlertsTab />
        </TabsContent>
        {canEdit && (
          <TabsContent value="requests">
            <ChangeRequestsTab />
          </TabsContent>
        )}
      </Tabs>
    </>
  );
}
