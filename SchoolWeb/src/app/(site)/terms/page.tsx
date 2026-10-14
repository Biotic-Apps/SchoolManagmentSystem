import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/layout/PageHeader";
import { SUPPORT_EMAIL } from "@/lib/site/links";

export const metadata: Metadata = {
  title: "Terms of Service",
  alternates: { canonical: "/terms" },
  description:
    "The terms under which schools, their staff and parents use eSchool, the school management system by Pixdevelop.",
};

const LAST_UPDATED = "14 October 2026";

const PROSE =
  "mt-10 space-y-12 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight " +
  "[&_li]:leading-relaxed [&_p]:leading-relaxed [&_p]:text-muted";

const LIST = "mt-3 list-disc space-y-2 pl-5 text-muted";
const LINK = "break-all font-medium text-brand-600 underline-offset-4 hover:underline";

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        body="The agreement for using eSchool: who is responsible for what, how accounts work, what is expected of everyone who signs in, and how use can end."
      />

      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="text-sm text-faint">Last updated: {LAST_UPDATED}</p>

        <div className={PROSE}>
          <section>
            <h2>1. About these terms</h2>
            <p className="mt-3">
              eSchool is a school management system, made up of a web portal and an Android app,
              built and provided by Pixdevelop (&ldquo;we&rdquo;, &ldquo;us&rdquo;). These terms
              apply to everyone who signs in to eSchool: the school, its staff, and the parents and
              guardians the school gives accounts to. By signing in you accept them. If you do not
              accept them, do not use eSchool.
            </p>
            <p className="mt-3">
              The arrangement between Pixdevelop and each school, including the service it
              receives and any fees, is agreed directly with that school. Where that agreement
              differs from these terms, the agreement with the school applies.
            </p>
          </section>

          <section>
            <h2>2. Roles and responsibilities</h2>
            <ul className={LIST}>
              <li>
                <strong className="text-foreground">The school</strong> owns and controls the
                records it keeps in eSchool. It decides who gets an account, which role each
                person has, and what is recorded, and it is responsible for having the right to
                hold that information.
              </li>
              <li>
                <strong className="text-foreground">Pixdevelop</strong> provides and maintains the
                software, and handles school data only to provide eSchool to the school, on its
                instructions, as described in our{" "}
                <Link href="/privacy-policy" className={LINK}>
                  Privacy Policy
                </Link>
                .
              </li>
            </ul>
          </section>

          <section>
            <h2>3. Accounts and access</h2>
            <p className="mt-3">
              Accounts are created by the school. Staff roles are Super admin, Principal, Head
              teacher, Coordinator, Teacher and Accountant, and each role sees only what it needs.
              Parents sign in with their child&apos;s admission number and a password, or with a
              one-time code sent to their email, and see only their own children&apos;s records.
              Students do not have accounts.
            </p>
            <p className="mt-3">
              You are responsible for keeping your password and sign-in codes to yourself and for
              what is done under your account. If you think someone else has used it, tell your
              school&apos;s office straight away so your access can be reset.
            </p>
          </section>

          <section>
            <h2>4. Acceptable use</h2>
            <p className="mt-3">When using eSchool you agree not to:</p>
            <ul className={LIST}>
              <li>look at, copy or share records you have no need to see for your role;</li>
              <li>enter information you know to be false, or alter records without authority;</li>
              <li>share your account, or use someone else&apos;s;</li>
              <li>try to get around access controls, test the system&apos;s security without our written permission, or disrupt the service;</li>
              <li>use eSchool, or the messages it sends, to harass anyone or to send unrelated advertising;</li>
              <li>copy, resell or reverse-engineer the software.</li>
            </ul>
            <p className="mt-3">
              A school may suspend an account that breaks these rules, and we may suspend access
              where it is needed to protect the service or other users.
            </p>
          </section>

          <section>
            <h2>5. Children&apos;s information</h2>
            <p className="mt-3">
              Much of what eSchool holds is about children. Everyone with access must treat it as
              confidential and use it only for the school&apos;s purposes. Pixdevelop handles it
              only on the school&apos;s instructions and never uses it for its own purposes.
            </p>
          </section>

          <section>
            <h2>6. Availability, backups and changes</h2>
            <p className="mt-3">
              We work to keep eSchool available and its data safe, and backups are encrypted. The
              service may occasionally be unavailable for maintenance or for reasons outside our
              control. We improve eSchool over time and may change or retire features; we will
              tell schools in advance about changes that significantly affect how they use it.
            </p>
          </section>

          <section>
            <h2>7. Intellectual property</h2>
            <p className="mt-3">
              The eSchool software, design and name belong to Pixdevelop. The records a school
              enters belong to that school. Using eSchool does not transfer ownership of either.
            </p>
          </section>

          <section>
            <h2>8. Liability</h2>
            <p className="mt-3">
              eSchool is a tool that helps a school keep its records. The school remains
              responsible for the decisions it makes with them, such as results, fees and
              admissions, and for checking what it publishes to parents. To the extent the law
              allows, Pixdevelop is not liable for indirect or consequential loss arising from use
              of eSchool, and any liability to a school is limited as set out in its agreement
              with us.
            </p>
          </section>

          <section>
            <h2>9. Ending use</h2>
            <p className="mt-3">
              A school can close any account at any time, and your access ends when the school
              closes your account or stops using eSchool. When a school stops using eSchool, we
              return or delete its data as agreed with the school.
            </p>
          </section>

          <section>
            <h2>10. Governing law</h2>
            <p className="mt-3">
              These terms are governed by the laws of Pakistan, and any dispute will be dealt with
              by the courts of Pakistan.
            </p>
          </section>

          <section>
            <h2>11. Changes and contact</h2>
            <p className="mt-3">
              We may update these terms; when we do, we will change the date at the top of this
              page and tell schools about significant changes. Questions can be sent to{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className={LINK}>
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
