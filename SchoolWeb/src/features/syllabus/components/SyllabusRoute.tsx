"use client";

import { useSyllabusView } from "../use-syllabus-page";
import { ChildSyllabusView } from "./ChildSyllabusView";
import { SyllabusPage } from "./SyllabusPage";

export function SyllabusRoute() {
  return useSyllabusView() === "child" ? <ChildSyllabusView /> : <SyllabusPage />;
}
