"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { useCan } from "@/features/auth/use-can";
import { NoticesFeed } from "./NoticesFeed";
import { NoticesManagePage } from "./NoticesManagePage";

export function NoticesRoute() {
  const can = useCan();
  if (can("notices.add")) return <NoticesManagePage />;
  return (
    <>
      <PageHeader title="Notices" description="Announcements from the school, newest first." />
      <NoticesFeed />
    </>
  );
}
