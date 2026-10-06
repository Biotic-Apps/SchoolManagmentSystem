"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ChildLeavePanel } from "@/features/attendance/components/ChildLeavePanel";
import { NoChildState } from "@/features/auth/components/NoChildState";
import { useActiveChild, useIsParent } from "@/features/auth/use-active-child";
import { NoticesFeed } from "@/features/notices/components/NoticesFeed";
import { ChildEarlyLeavePanel } from "@/features/pickup/components/ChildEarlyLeavePanel";
import { Inbox } from "./Inbox";

export function MessagesRoute() {
  return useIsParent() ? <ParentMessages /> : <StaffMessages />;
}

function StaffMessages() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Messages" description="Conversations with parents about their children." />
      <Inbox />
    </div>
  );
}

function ParentMessages() {
  const child = useActiveChild();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Messages, Notices & Requests"
        description="Talk to your child's teachers, read school notices and send leave or early-leave requests."
      />
      {!child ? (
        <NoChildState description="Messages and notices appear once the school verifies your link to a child." />
      ) : (
        <Tabs defaultValue="messages">
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="notices">Notices</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>
          <TabsContent value="messages">
            <Inbox key={child.id} />
          </TabsContent>
          <TabsContent value="notices">
            <NoticesFeed />
          </TabsContent>
          <TabsContent value="requests" className="flex flex-col gap-6">
            <ChildLeavePanel />
            <ChildEarlyLeavePanel />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
