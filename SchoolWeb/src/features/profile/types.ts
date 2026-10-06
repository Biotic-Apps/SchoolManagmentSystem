export interface ProfileInput {
  name: string;
  email: string | null;
  phone: string | null;
}

export type NotificationCategory =
  | "ATTENDANCE"
  | "DIARY"
  | "ACTIVITY"
  | "CONSENT"
  | "NOTICE"
  | "MESSAGE"
  | "COMPLAINT"
  | "MEETING"
  | "HEALTH"
  | "PICKUP"
  | "LEAVE"
  | "APPROVAL";

/** GET/PUT /notifications/preferences — in-app is always on; HEALTH and PICKUP push can't be muted. */
export interface NotificationPreference {
  category: NotificationCategory;
  inApp: boolean;
  push: boolean;
}
