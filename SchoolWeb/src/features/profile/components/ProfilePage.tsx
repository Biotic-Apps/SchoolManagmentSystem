"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { useIsParent } from "@/features/auth/use-active-child";
import { ContactChangeCard } from "./ContactChangeCard";
import { DeviceSessionsCard } from "./DeviceSessionsCard";
import { LinkChildCard } from "./LinkChildCard";
import { NotificationPreferencesCard } from "./NotificationPreferencesCard";
import { PasswordCard } from "./PasswordCard";
import { ProfileDetailsCard } from "./ProfileDetailsCard";
import { RolesCard } from "./RolesCard";
import { TwoFactorCard } from "./TwoFactorCard";

export function ProfilePage() {
  const isParent = useIsParent();
  return (
    <>
      <PageHeader title="Profile & Security" description="Your contact details, password, two-step sign-in and signed-in devices." />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileDetailsCard />
        <PasswordCard />
      </div>
      <TwoFactorCard />
      {isParent && (
        <div className="grid gap-6 lg:grid-cols-2">
          <LinkChildCard />
          <ContactChangeCard />
        </div>
      )}
      <NotificationPreferencesCard />
      <DeviceSessionsCard />
      <RolesCard />
    </>
  );
}
