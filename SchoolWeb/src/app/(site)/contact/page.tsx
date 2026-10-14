import type { Metadata } from "next";
import { LogIn, Mail, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/site/layout/PageHeader";
import { ContactForm } from "@/components/site/sections/ContactForm";
import { Reveal } from "@/components/site/motion/Reveal";
import { Button } from "@/components/site/ui/Button";
import { SIGN_IN_URL, SUPPORT_EMAIL } from "@/lib/site/links";

export const metadata: Metadata = {
  title: "Contact",
  alternates: { canonical: "/contact" },
  description:
    "Bring eSchool to your school. Tell us about your campuses and students and we will set up your branches, classes, staff and parent accounts.",
};

const ICON_TILE =
  "grid size-10 place-items-center rounded-[0.65rem] bg-brand-50 text-brand-600";

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Bring eSchool to your school"
        body="Tell us how many campuses and students you have and what you use today. We will set up your branches, classes, staff and parent accounts with you."
      />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
          <Reveal>
            <div id="form">
              <ContactForm />
            </div>
          </Reveal>

          <div className="space-y-8">
            <Reveal delay={0.1}>
              <div className="card-surface p-6">
                <span className={ICON_TILE}>
                  <Mail className="size-[1.1rem]" strokeWidth={2} />
                </span>
                <h2 className="mt-4 font-semibold tracking-tight">Email us directly</h2>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">
                  Prefer your own mail client? Write to us and mention your school&apos;s name and
                  city.
                </p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="mt-3 inline-block break-all text-sm font-medium text-brand-600 underline-offset-4 hover:underline"
                >
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="card-surface p-6">
                <span className={ICON_TILE}>
                  <LogIn className="size-[1.1rem]" strokeWidth={2} />
                </span>
                <h2 className="mt-4 font-semibold tracking-tight">Already using eSchool?</h2>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">
                  Staff sign in with the account their school gave them. Parents sign in with
                  their child&apos;s admission number and password, or with a code sent to their
                  email. Forgotten details are reset by your school&apos;s office.
                </p>
                <Button href={SIGN_IN_URL} className="mt-4">
                  <LogIn className="size-4" strokeWidth={2.2} />
                  Sign in
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.26}>
              <div className="flex gap-3 rounded-card border border-brand-100 bg-brand-50 p-4">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" strokeWidth={2.2} />
                <p className="text-[0.85rem] leading-relaxed text-muted">
                  Please do not send passwords or student records through this form. If you need
                  to share data, we will arrange a secure route first.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </>
  );
}
