"use client";

import { AcademicsFields } from "./AcademicsFields";
import { PrincipalFields } from "./PrincipalFields";

export function PeopleStep() {
  return (
    <div className="flex flex-col gap-6">
      <PrincipalFields />
      <AcademicsFields />
    </div>
  );
}
