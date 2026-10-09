/** Which sign-in hints the login page shows; the API accepts any identifier either way. */
export type LoginRole = "staff" | "parent";

export const LOGIN_ROLE_OPTIONS = [
  { id: "staff", name: "Staff" },
  { id: "parent", name: "Parent" },
];
