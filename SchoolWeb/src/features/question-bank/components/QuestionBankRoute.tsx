"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { QuestionsPage } from "./QuestionsPage";
import { PaperGeneratorPage } from "./PaperGeneratorPage";

type QuestionBankTab = "questions" | "papers";

export function QuestionBankRoute() {
  const [tab, setTab] = useState<QuestionBankTab>("questions");

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(v) => setTab(v as QuestionBankTab)}>
        <TabsList>
          <TabsTrigger value="questions">Question Bank</TabsTrigger>
          <TabsTrigger value="papers">Paper Generator</TabsTrigger>
        </TabsList>
      </Tabs>
      {tab === "questions" && <QuestionsPage />}
      {tab === "papers" && <PaperGeneratorPage />}
    </div>
  );
}
