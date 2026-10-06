"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useDiaryPage } from "../use-diary-page";
import { DiaryTab } from "./DiaryTab";
import { MissingTab } from "./MissingTab";
import { ModerationTab } from "./ModerationTab";

export function DiaryStaffPage() {
  const { tab, setTab, canModerate, canSeeMissing } = useDiaryPage();
  const hasTabs = canModerate || canSeeMissing;

  return (
    <>
      <PageHeader
        title="Daily Diary & Homework"
        description="What each section covered today, homework and attachments for parents."
      />
      {!hasTabs ? (
        <DiaryTab />
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="diary">Diary</TabsTrigger>
            {canModerate && <TabsTrigger value="moderation">Moderation</TabsTrigger>}
            {canSeeMissing && <TabsTrigger value="missing">Missing</TabsTrigger>}
          </TabsList>
          <TabsContent value="diary">
            <DiaryTab />
          </TabsContent>
          {canModerate && (
            <TabsContent value="moderation">
              <ModerationTab />
            </TabsContent>
          )}
          {canSeeMissing && (
            <TabsContent value="missing">
              <MissingTab />
            </TabsContent>
          )}
        </Tabs>
      )}
    </>
  );
}
