"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { DeviceSessionsCard } from "./DeviceSessionsCard";
import { PasswordCard } from "./PasswordCard";
import { ProfileDetailsCard } from "./ProfileDetailsCard";
import { RolesCard } from "./RolesCard";

export function ProfilePage() {
  return (
    <>
      <PageHeader title="Profile & Security" description="Your contact details, password and signed-in devices." />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileDetailsCard />
        <PasswordCard />
      </div>
      <DeviceSessionsCard />
      <RolesCard />
    </>
  );
}
