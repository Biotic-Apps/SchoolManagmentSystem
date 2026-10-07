"use client";

import { CalendarPlus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useCan } from "@/features/auth/use-can";
import { useDialogState } from "@/lib/use-dialog-state";
import { FollowUpsTab } from "./FollowUpsTab";
import { MeetingsListTab } from "./MeetingsListTab";
import { MySlotsTab } from "./MySlotsTab";
import { RequestMeetingDialog } from "./RequestMeetingDialog";

export function StaffMeetings() {
  const request = useDialogState<true>();
  const canRequest = useCan()("meetings.add");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Meetings & Appointments"
        description="Parent meetings, the slots parents can book, and the follow-ups you agreed on."
        actions={
          canRequest && (
            <Button onClick={() => request.show(true)}>
              <CalendarPlus />
              Request meeting
            </Button>
          )
        }
      />
      <Tabs defaultValue="upcoming">
        <TabsList className="max-w-full overflow-x-auto">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="slots">My slots</TabsTrigger>
          <TabsTrigger value="follow-ups">Follow-ups</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <MeetingsListTab box="upcoming" />
        </TabsContent>
        <TabsContent value="past">
          <MeetingsListTab box="past" />
        </TabsContent>
        <TabsContent value="slots">
          <MySlotsTab />
        </TabsContent>
        <TabsContent value="follow-ups">
          <FollowUpsTab />
        </TabsContent>
      </Tabs>
      {request.open && <RequestMeetingDialog onClose={request.close} />}
    </div>
  );
}
