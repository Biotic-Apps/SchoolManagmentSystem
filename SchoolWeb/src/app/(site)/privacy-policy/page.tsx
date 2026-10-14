import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/site/layout/PageHeader";
import { SUPPORT_EMAIL } from "@/lib/site/links";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy-policy" },
  description:
    "How eSchool handles student, guardian and staff data: who controls it, why it is held, who can see it, how long it is kept and how it is protected.",
};

const LAST_UPDATED = "14 October 2026";

const PROSE =
  "mt-10 space-y-12 [&_section]:scroll-mt-28 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight " +
  "[&_h3]:mt-6 [&_h3]:font-semibold [&_li]:leading-relaxed [&_p]:leading-relaxed [&_p]:text-muted";

const LIST = "mt-3 list-disc space-y-2 pl-5 text-muted";
const CODE = "rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[0.85em]";

function Term({ children }: { children: ReactNode }) {
  return <strong className="text-foreground">{children}</strong>;
}

function MailLink() {
  return (
    <a
      href={`mailto:${SUPPORT_EMAIL}`}
      className="break-all font-medium text-brand-600 underline-offset-4 hover:underline"
    >
      {SUPPORT_EMAIL}
    </a>
  );
}

/**
 * Plain-language privacy policy for eSchool. The school is the data controller
 * and Pixdevelop the processor; the cookie names match
 * `lib/auth-cookie-names.ts`. The `data-use`, `security` and `cookies` ids are
 * linked from the footer.
 */
export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        body="Who is responsible for the records in eSchool, what is held and why, who can see it, how long it is kept and how it is protected."
      />

      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="text-sm text-faint">Last updated: {LAST_UPDATED}</p>

        <div className={PROSE}>
          <section>
            <h2>1. Who is responsible for your data</h2>
            <p className="mt-3">
              eSchool is a school management system made up of a web portal and an Android app. It
              is built and provided by Pixdevelop (&ldquo;we&rdquo;, &ldquo;us&rdquo;).
            </p>
            <p className="mt-3">
              <Term>Your school is the data controller.</Term> The school decides which records it
              keeps in eSchool, which of its staff may see them and how long they are kept. If you
              are a parent, guardian or member of staff, the school that gave you your account is
              responsible for your information and for the information about the children in its
              care.
            </p>
            <p className="mt-3">
              <Term>Pixdevelop is the processor and service provider.</Term> We run the software
              and look after the systems it runs on. We handle school data only to provide eSchool
              to that school, on its instructions. We do not use school data for our own purposes,
              and we never sell it or use it for advertising.
            </p>
            <p className="mt-3">
              For this website itself, including its contact form, Pixdevelop is the controller.
            </p>
          </section>

          <section>
            <h2>2. What eSchool holds</h2>
            <p className="mt-3">What a school records depends on the modules it uses. Typically:</p>
            <ul className={LIST}>
              <li>
                <Term>Student records</Term>: name, admission number, class and section, date of
                birth, photograph and enrolment details.
              </li>
              <li>
                <Term>Guardian records</Term>: names, relationship to the student, phone numbers,
                email addresses and home address.
              </li>
              <li>
                <Term>Staff records</Term>: name, role, branch, contact details and, where the
                school uses them, employment and payroll details.
              </li>
              <li>
                <Term>Attendance</Term>: daily attendance for students and staff, including scan
                times where the school uses QR attendance.
              </li>
              <li>
                <Term>Results</Term>: marks, grades, report cards and exam schedules.
              </li>
              <li>
                <Term>Fees</Term>: fee structures, challans, payments received, discounts and
                balances.
              </li>
              <li>
                <Term>Health records</Term>: allergies, medical notes and incidents the school
                chooses to record.
              </li>
              <li>
                <Term>Messages</Term>: notices, homework, messages between the school and
                families, and the SMS, WhatsApp or email notifications the school sends.
              </li>
              <li>
                <Term>Audit logs</Term>: who signed in, and who created, changed or deleted a
                record, and when.
              </li>
            </ul>
            <p className="mt-4">
              Through the contact form on this website we also receive the name, email address,
              school name and message you send us.
            </p>
          </section>

          <section id="data-use">
            <h2>3. Why it is held</h2>
            <ul className={LIST}>
              <li>To run the school day to day: admissions, classes, attendance, results and fees.</li>
              <li>
                To keep parents informed about their own child&apos;s attendance, results, fees and
                homework.
              </li>
              <li>
                To help keep children safe, for example by recording health needs and who may
                collect a child.
              </li>
              <li>
                To keep the system secure and show who did what, through sign-in records and audit
                logs.
              </li>
              <li>To reply to enquiries sent through this website.</li>
            </ul>
            <p className="mt-4">
              The school, as controller, decides the purposes for its records. These are normally
              its duty to educate and care for its students and its arrangement with parents.
            </p>
          </section>

          <section>
            <h2>4. Who can see it</h2>
            <p className="mt-3">
              Access in eSchool is based on roles, and the school assigns them. Each person sees
              only what their role needs:
            </p>
            <ul className={LIST}>
              <li>
                <Term>Super admin and Principal</Term>: the school&apos;s records across the
                branches they are responsible for.
              </li>
              <li>
                <Term>Head teacher and Coordinator</Term>: the classes, sections and staff they
                oversee.
              </li>
              <li>
                <Term>Teacher</Term>: the students in the classes they teach, including attendance,
                results, homework and messages.
              </li>
              <li>
                <Term>Accountant</Term>: fees, payments and other financial records.
              </li>
              <li>
                <Term>Parent</Term>: only their own children&apos;s records. Students do not have
                accounts of their own.
              </li>
            </ul>
            <p className="mt-4">
              A small number of Pixdevelop staff can reach the systems to keep eSchool running,
              fix faults or restore a backup, and only when that is needed. We share data with
              others only where the school asks us to (for example, the SMS or WhatsApp provider
              that delivers its notifications), with the hosting provider the school uses, or
              where Pakistani law requires it.
            </p>
          </section>

          <section>
            <h2>5. How long it is kept</h2>
            <p className="mt-3">
              The school decides how long its records are kept and can delete them. Records stay
              in eSchool while the school uses it. When a school stops using eSchool, we return or
              delete its data as agreed with the school, and backups that contain it expire on
              their normal cycle afterwards. Contact-form enquiries are kept while we are in
              conversation with you and deleted when they are no longer needed.
            </p>
          </section>

          <section id="security">
            <h2>6. Backups and security</h2>
            <ul className={LIST}>
              <li>
                eSchool is hosted by the school&apos;s provider, and all traffic is encrypted in
                transit (HTTPS).
              </li>
              <li>Backups are encrypted.</li>
              <li>Passwords are never stored in readable form; only a one-way hash is kept.</li>
              <li>
                Parents sign in with their child&apos;s admission number and a password, or with a
                one-time code sent to their email.
              </li>
              <li>
                Every sign-in and every change to a record is written to an audit log the school
                can review.
              </li>
            </ul>
            <p className="mt-4">
              No system is perfectly secure. If we become aware of a breach affecting a
              school&apos;s data, we will tell that school without undue delay so it can act.
            </p>
          </section>

          <section id="cookies">
            <h2>7. Cookies</h2>
            <p className="mt-3">
              When you sign in, eSchool sets only strictly necessary cookies:{" "}
              <code className={CODE}>es_session</code> and <code className={CODE}>es_rt</code>{" "}
              keep you signed in, and <code className={CODE}>es_csrf</code> protects your account
              against forged requests. They are not used for tracking or advertising, and signing
              out removes them.
            </p>
            <p className="mt-3">This marketing site sets no cookies of its own.</p>
          </section>

          <section>
            <h2>8. Children&apos;s data</h2>
            <p className="mt-3">
              Most records in eSchool are about children. Children do not sign in to eSchool and
              we do not collect data from them directly. Their data is entered by the school and
              handled only on the school&apos;s instructions, for the school&apos;s purposes. We
              never use it to profile children, to advertise to them or for any purpose of our own.
            </p>
          </section>

          <section>
            <h2>9. Your rights</h2>
            <p className="mt-3">
              Parents, guardians and staff can ask to see the information held about them or their
              child, to have it corrected, or to have it deleted when the school no longer needs
              it. Because the school controls these records, please make your request to the
              school&apos;s office. If a request reaches us, we will pass it to the school and help
              it respond.
            </p>
            <p className="mt-3">
              For an enquiry you sent through this website, write to us at <MailLink /> and we
              will deal with your request directly.
            </p>
          </section>

          <section>
            <h2>10. Governing law</h2>
            <p className="mt-3">
              This policy is governed by the laws of Pakistan, and we handle data in line with the
              Pakistani laws that apply to it.
            </p>
          </section>

          <section>
            <h2>11. Changes and contact</h2>
            <p className="mt-3">
              If we change this policy, we will update the date at the top of this page and tell
              schools about significant changes. Questions about this policy can be sent to{" "}
              <MailLink />.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
