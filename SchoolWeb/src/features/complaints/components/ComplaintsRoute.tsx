"use client";

import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { BOX_LABEL } from "../options";
import { useComplaintsRoute } from "../use-complaints-route";
import { ComplaintDetailDrawer } from "./ComplaintDetailDrawer";
import { ComplaintFormDialog } from "./ComplaintFormDialog";
import { ComplaintsTab } from "./ComplaintsTab";

export function ComplaintsRoute() {
  const route = useComplaintsRoute();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Complaints"
        description="Raise a concern and follow it until it is resolved. Every complaint has a response deadline."
        actions={
          <Button onClick={() => route.form.show(true)}>
            <Plus />
            File complaint
          </Button>
        }
      />
      {route.boxes.length > 1 ? (
        <Tabs value={route.box} onValueChange={route.setBox}>
          <TabsList className="max-w-full overflow-x-auto">
            {route.boxes.map((box) => (
              <TabsTrigger key={box} value={box}>
                {BOX_LABEL[box]}
              </TabsTrigger>
            ))}
          </TabsList>
          {route.boxes.map((box) => (
            <TabsContent key={box} value={box}>
              <ComplaintsTab box={box} onOpen={route.openComplaint} />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <ComplaintsTab box="mine" onOpen={route.openComplaint} />
      )}
      {route.form.open && (
        <ComplaintFormDialog
          onClose={route.form.close}
          onSaved={(complaint) => {
            route.form.close();
            route.openComplaint(complaint.id);
          }}
        />
      )}
      <ComplaintDetailDrawer open={route.open} onClose={route.closeComplaint} />
    </div>
  );
}
