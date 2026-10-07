import { DEFAULT_TIMINGS, DEFAULT_WORKING_DAYS, STANDARD_CLASSES, STANDARD_SUBJECTS, defaultSessionDates, sessionNameFor } from "./presets";
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
      sectionsPerClass: "1",
      classes: STANDARD_CLASSES,
      subjects: STANDARD_SUBJECTS,
    },
  };
}
