import type { Option } from "@/components/shared/OptionSelect";

export const QUESTION_TYPE_OPTIONS: Option[] = [
  { id: "MCQ", name: "Multiple Choice" },
  { id: "SHORT", name: "Short Answer" },
  { id: "LONG", name: "Long Answer" },
  { id: "TRUE_FALSE", name: "True / False" },
  { id: "FILL_BLANK", name: "Fill in the Blank" },
];

export const DIFFICULTY_OPTIONS: Option[] = [
  { id: "EASY", name: "Easy" },
  { id: "MEDIUM", name: "Medium" },
  { id: "HARD", name: "Hard" },
];

export const PAPER_STATUS_OPTIONS: Option[] = [
  { id: "DRAFT", name: "Draft" },
  { id: "PUBLISHED", name: "Published" },
];
