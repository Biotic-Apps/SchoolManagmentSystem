import { useReportUnsaved } from "@/components/shared/UnsavedChangesGuard";
import { useServerForm } from "@/lib/use-server-form";
import {
  notificationSettingsSchema,
  notificationSettingsToValues,
  toNotificationSettingsInput,
  type NotificationSettingsValues,
} from "./notification-schemas";
import { useSaveNotificationSettings } from "./settings-api";
import type { NotificationSettings } from "./types";

export function useNotificationSettingsForm(schoolId: string, settings: NotificationSettings) {
  const save = useSaveNotificationSettings(schoolId);
  const result = useServerForm<NotificationSettingsValues, NotificationSettings | null>({
    schema: notificationSettingsSchema,
    defaultValues: notificationSettingsToValues(settings),
    onSubmit: (values) => save.mutateAsync(toNotificationSettingsInput(values)),
    onSuccess: (saved, values) => result.form.reset(saved ? notificationSettingsToValues(saved) : values),
  });
  const dirty = result.form.formState.isDirty;
  useReportUnsaved(dirty);

  return { ...result, dirty, discard: () => result.form.reset() };
}
