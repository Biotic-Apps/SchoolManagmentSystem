"use client";

import { School } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { OptionSelect } from "@/components/shared/OptionSelect";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useSettingsRoute } from "../use-settings-route";
import { BackupsTab } from "./backups/BackupsTab";
import { ImportsTab } from "./imports/ImportsTab";
import { NotificationsTab } from "./notifications/NotificationsTab";
import { PoliciesTab } from "./policies/PoliciesTab";
import { SchoolBrandingTab } from "./school/SchoolBrandingTab";
import { SmsGatewayTab } from "./sms-gateway/SmsGatewayTab";
import { SupportTab } from "./support/SupportTab";

// Form tabs stay mounted so switching tabs never drops unsaved edits.
const KEEP_MOUNTED = "data-[state=inactive]:hidden";

export function SettingsRoute() {
  const route = useSettingsRoute();
  const { school } = route;
  const schoolId = school.schoolId;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings & Backups"
        description={
          route.canEdit
            ? "School branding, notifications, policies, support tools, backups and data import."
            : "Your school's settings. Only a super admin can change them."
        }
        actions={
          school.showPicker && (
            <OptionSelect
              label="School"
              options={school.options}
              value={schoolId}
              onChange={school.setSchoolId}
              className="md:w-64"
            />
          )
        }
      />
      {school.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : !schoolId ? (
        <Card>
          <EmptyState icon={School} title="No school in your scope" description="Settings are kept per school." />
        </Card>
      ) : (
        <Tabs value={route.tab} onValueChange={route.setTab}>
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="school">School & branding</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            {route.showSupport && <TabsTrigger value="support">Support</TabsTrigger>}
            {route.showBackups && <TabsTrigger value="backups">Backups</TabsTrigger>}
            {route.showImports && <TabsTrigger value="imports">Data import</TabsTrigger>}
            {route.showSmsGateway && <TabsTrigger value="sms-gateway">SMS Gateway</TabsTrigger>}
          </TabsList>
          <TabsContent value="school" forceMount className={KEEP_MOUNTED}>
            <SchoolBrandingTab schoolId={schoolId} canEdit={route.canEdit} />
          </TabsContent>
          <TabsContent value="notifications" forceMount className={KEEP_MOUNTED}>
            <NotificationsTab schoolId={schoolId} canEdit={route.canEdit} />
          </TabsContent>
          <TabsContent value="policies" forceMount className={KEEP_MOUNTED}>
            <PoliciesTab schoolId={schoolId} canEdit={route.canEdit} />
          </TabsContent>
          {route.showSupport && (
            <TabsContent value="support">
              <SupportTab schoolId={schoolId} canEdit={route.canEdit} showHealth={route.isSuperAdmin} />
            </TabsContent>
          )}
          {route.showBackups && (
            <TabsContent value="backups">
              <BackupsTab />
            </TabsContent>
          )}
          {route.showImports && (
            <TabsContent value="imports">
              <ImportsTab schoolId={schoolId} />
            </TabsContent>
          )}
          {route.showSmsGateway && (
            <TabsContent value="sms-gateway">
              <SmsGatewayTab schoolId={schoolId} />
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}
