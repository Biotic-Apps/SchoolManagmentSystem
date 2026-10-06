// Mirrors passwordRule in lib/validation.ts; the API may additionally refuse common passwords.
export const PASSWORD_HINTS = [
  { id: "length", label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { id: "letter", label: "At least one letter", test: (value: string) => /[A-Za-z]/.test(value) },
  { id: "digit", label: "At least one digit", test: (value: string) => /[0-9]/.test(value) },
] as const;
