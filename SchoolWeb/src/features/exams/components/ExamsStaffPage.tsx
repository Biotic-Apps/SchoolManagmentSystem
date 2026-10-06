"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useExamsPage } from "../use-exams-page";
import { GradingTab } from "./grading/GradingTab";
import { ExamsTab } from "./list/ExamsTab";
import { PromotionsTab } from "./promotions/PromotionsTab";

export function ExamsStaffPage() {
  const page = useExamsPage();

  return (
    <>
      <PageHeader
        title="Exams & Results"
        description="Exams, date sheets, marks, results and report cards."
      />
      <Tabs value={page.tab} onValueChange={page.setTab}>
        <TabsList className="max-w-full overflow-x-auto">
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="grading">Grading schemes</TabsTrigger>
          {page.canPromote && <TabsTrigger value="promotions">Promotions</TabsTrigger>}
        </TabsList>
        <TabsContent value="exams">
          <ExamsTab />
        </TabsContent>
        <TabsContent value="grading">
          <GradingTab />
        </TabsContent>
        {page.canPromote && (
          <TabsContent value="promotions">
            <PromotionsTab />
          </TabsContent>
        )}
      </Tabs>
    </>
  );
}
