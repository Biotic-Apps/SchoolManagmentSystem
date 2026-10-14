export interface FaqItem {
  question: string;
  answer: string;
}

/** Questions schools and parents ask most often, shown in the home page FAQ. */
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Who can sign in?",
    answer:
      "Only accounts your school creates. There is no public sign-up. Admins, teachers, accountants, parents and students each get their own portal and only see what their role allows.",
  },
  {
    question: "How do parents sign in?",
    answer:
      "Parents sign in with their child's admission number and the password the school gives them. They can also get a one-time code by email instead of typing a password.",
  },
  {
    question: "Does the Android app work without internet?",
    answer:
      "Yes. Teachers can mark attendance and write the diary with no connection. Everything is saved on the phone and syncs by itself as soon as the internet is back.",
  },
  {
    question: "Can we run more than one branch?",
    answer:
      "Yes. Each branch keeps its own classes, staff, fees and reports, while the owner can switch between branches and see the totals in one place.",
  },
  {
    question: "Can we import our existing data?",
    answer:
      "Yes. Students, staff and fee records can be imported from Excel sheets, so you don't have to type everything again.",
  },
  {
    question: "Is our data safe?",
    answer:
      "Every role has its own permissions, accounts can turn on 2-step sign-in, backups are encrypted, and an audit history records who changed what and when.",
  },
  {
    question: "Can we print report cards and fee challans?",
    answer: "Yes. Report cards, fee challans, receipts and most reports can be downloaded as PDF and printed in one click.",
  },
  {
    question: "I forgot my password. What now?",
    answer:
      "Use \"Forgot password?\" on the sign-in page and we'll email you a reset link or code. No email on file? Ask your school admin to reset it.",
  },
];
