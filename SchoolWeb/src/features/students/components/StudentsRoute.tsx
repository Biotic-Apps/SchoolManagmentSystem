"use client";

import { useStudentsRoute } from "../use-students-route";
import { ChildProfilePage } from "./ChildProfilePage";
import { StudentsPage } from "./StudentsPage";

export function StudentsRoute() {
  const { view } = useStudentsRoute();
  return view === "child" ? <ChildProfilePage /> : <StudentsPage />;
}
