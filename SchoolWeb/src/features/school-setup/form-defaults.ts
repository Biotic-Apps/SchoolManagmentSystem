import { DEFAULT_BELL, DEFAULT_FRIDAY } from "@/features/timetable/bell-generator";
import { defaultClassRows, defaultSubjectNames } from "./class-rows";
import { DEFAULT_TIMINGS, DEFAULT_WORKING_DAYS, defaultSessionDates, sessionNameFor } from "./presets";
import type { SetupFormValues } from "./schemas";

export function setupFormDefaults(): SetupFormValues {
  const { startDate, endDate } = defaultSessionDates();
  return {
    school: { code: "", name: "", phone: "", email: "", website: "", address: "" },
    branch: {
      name: "Main Branch",
      code: "MAIN",
      phone: "",
      email: "",
      address: "",
      ...DEFAULT_TIMINGS,
      workingDays: DEFAULT_WORKING_DAYS,
    },
    principal: { name: "", email: "", phone: "", generatePassword: true, password: "" },
    academics: {
      createSession: true,
      sessionName: sessionNameFor(startDate, endDate),
      startDate,
      endDate,
      classes: defaultClassRows(),
      subjectNames: defaultSubjectNames(),
    },
    bell: { ...DEFAULT_BELL, shortFriday: true, friday: { ...DEFAULT_FRIDAY } },
  };
}
