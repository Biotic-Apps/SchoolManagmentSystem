import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { MessagesRoute } from "@/features/messages/components/MessagesRoute";

export const metadata: Metadata = { title: "Messages" };

export default function Page() {
  return (
    <ModuleGuard moduleId="messages">
      <MessagesRoute />
    </ModuleGuard>
  );
}
