"use client";

import { Bell, Mail, MessageSquareText, Phone } from "lucide-react";
import { FormProvider } from "react-hook-form";
import { FormAlert } from "@/components/shared/FormAlert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { NotificationSettings } from "../../types";
import { useNotificationSettingsForm } from "../../use-notification-settings-form";
import { ReadOnlyNotice } from "../ReadOnlyNotice";
import { SettingsFormActions } from "../SettingsFormActions";
import { CategoryDefaultsTable } from "./CategoryDefaultsTable";
import { ChannelCard } from "./ChannelCard";

interface NotificationSettingsFormProps {
  schoolId: string;
  settings: NotificationSettings;
  canEdit: boolean;
}

export function NotificationSettingsForm({ schoolId, settings, canEdit }: NotificationSettingsFormProps) {
  const { form, submit, submitting, formError, dirty, discard } = useNotificationSettingsForm(schoolId, settings);

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-6">
        {!canEdit && <ReadOnlyNotice />}
        <FormAlert message={formError} />
        <fieldset disabled={!canEdit} className="flex min-w-0 flex-col gap-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ChannelCard
              channel="email"
              icon={Mail}
              title="Email"
              description="Receipts, notices and reminders by email."
              switchLabel="Send by email"
              field={{ name: "email.fromName", label: "Sender name", maxLength: 60 }}
            />
            <ChannelCard
              channel="sms"
              icon={MessageSquareText}
              title="SMS"
              description="Short alerts to parents' and staff phones."
              switchLabel="Send by SMS"
              field={{ name: "sms.senderId", label: "Sender ID", maxLength: 20 }}
            />
            <ChannelCard
              channel="whatsapp"
              icon={Phone}
              title="WhatsApp"
              description="Alerts via WhatsApp Business API."
              switchLabel="Send by WhatsApp"
            />
            <ChannelCard
              channel="push"
              icon={Bell}
              title="Push"
              description="Notifications on the mobile app."
              switchLabel="Send push notifications"
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Channels per category</CardTitle>
              <CardDescription>
                Which channels each kind of notification uses, unless a person changes their own preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryDefaultsTable />
            </CardContent>
          </Card>
        </fieldset>
        {canEdit && <SettingsFormActions dirty={dirty} submitting={submitting} onDiscard={discard} />}
      </form>
    </FormProvider>
  );
}
