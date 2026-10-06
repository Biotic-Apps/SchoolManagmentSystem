"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { useIsParent } from "@/features/auth/use-active-child";
import { ActivitiesPage } from "./ActivitiesPage";
import { ChildActivitiesSection } from "./ChildActivitiesSection";

export function ActivitiesRoute() {
  if (!useIsParent()) return <ActivitiesPage />;
  return (
    <>
      <PageHeader title="Activities & Events" description="Upcoming events, trips and competitions for your child." />
      <ChildActivitiesSection showHeading={false} />
    </>
  );
}
