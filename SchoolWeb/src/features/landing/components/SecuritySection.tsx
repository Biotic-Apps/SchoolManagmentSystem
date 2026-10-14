import { ClockAlert, DatabaseBackup, History, KeyRound, ShieldHalf, UserCheck } from "lucide-react";
import { LandingContainer } from "./LandingContainer";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";
import { SecurityCard } from "./security/SecurityCard";
import { ShieldVisual } from "./security/ShieldVisual";

const ITEMS = [
  { icon: ShieldHalf, title: "Role-based permissions", text: "Deny by default — every role sees only what it is allowed to." },
  { icon: KeyRound, title: "Two-step verification", text: "Authenticator app (TOTP) or email codes protect every sign-in." },
  { icon: DatabaseBackup, title: "Encrypted backups", text: "Backups are encrypted and checked with a test restore." },
  { icon: History, title: "Full audit history", text: "Every change is recorded with who did it and when." },
  { icon: UserCheck, title: "Registered accounts only", text: "Only accounts your school has registered can sign in." },
  { icon: ClockAlert, title: "Auto sign-out", text: "Idle sessions sign out automatically on shared devices." },
];

/** Light section listing the security guarantees, with a pulsing shield visual. */
export function SecuritySection() {
  return (
    <section id="security" className="relative overflow-hidden bg-white py-20 sm:py-28">
      <div aria-hidden className="bg-dot-grid pointer-events-none absolute inset-x-0 top-0 h-80 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <LandingContainer className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <SectionHeader
            align="left"
            eyebrow="Security"
            title={<>Safe <span className="text-gradient">by design</span></>}
            description="Student records, fees and results are sensitive. eSchool protects them at every step — from sign-in to backup."
          />
          <Reveal from="scale" delay={150}>
            <ShieldVisual />
          </Reveal>
        </div>
        <ul className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, i) => (
            <SecurityCard key={item.title} {...item} delay={i * 80} />
          ))}
        </ul>
      </LandingContainer>
    </section>
  );
}
