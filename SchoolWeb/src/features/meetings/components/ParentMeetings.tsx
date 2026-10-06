"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { NoChildState } from "@/features/auth/components/NoChildState";
import { useActiveChild } from "@/features/auth/use-active-child";
import { BookMeetingTab } from "./BookMeetingTab";
import { ParentMeetingList } from "./ParentMeetingList";

export function ParentMeetings() {
  const child = useActiveChild();
  const [tab, setTab] = useState("book");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Meetings & Appointments"
        description="Book a time with your child's teachers and see what was discussed."
      />
      {!child ? (
        <NoChildState description="You can book meetings once the school verifies your link to a child." />
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="book">Book</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          <TabsContent value="book">
            <BookMeetingTab key={child.id} child={child} onBooked={() => setTab("upcoming")} />
          </TabsContent>
          <TabsContent value="upcoming">
            <ParentMeetingList box="upcoming" />
          </TabsContent>
          <TabsContent value="past">
            <ParentMeetingList box="past" />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
