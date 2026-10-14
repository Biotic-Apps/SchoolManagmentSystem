import { MapPin } from "lucide-react";
import { AppLogo } from "@/components/shared/AppLogo";
import { FooterLinkColumn, type FooterLink } from "./FooterLinkColumn";
import { LandingContainer } from "./LandingContainer";

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Roles", href: "#roles" },
      { label: "Mobile app", href: "#mobile-app" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "FAQ", href: "#faq" },
      { label: "Security", href: "#security" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Forgot password", href: "/forgot-password" },
    ],
  },
];

/** Deep purple page footer: brand + tagline, link columns, copyright row. */
export function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative isolate overflow-hidden bg-[linear-gradient(160deg,#2A1F6B_0%,#3B2D8F_55%,#5B4BC7_100%)] text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-drift absolute -left-24 -top-24 size-72 rounded-full bg-[#7B68EE]/40 blur-3xl" />
        <div className="animate-drift absolute -bottom-32 right-[-6rem] size-80 rounded-full bg-[#FB7185]/20 blur-3xl [animation-delay:-8s]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      </div>

      <LandingContainer className="pb-8 pt-16 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <AppLogo showName={false} />
              <span className="text-card-title font-semibold">eSchool</span>
            </div>
            <p className="mt-4 text-label text-white/70">
              One connected home for admissions, attendance, fees, exams and parents — on the web and on every phone.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <FooterLinkColumn key={col.title} title={col.title} links={col.links} />
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/15 pt-6 text-caption text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} eSchool. All rights reserved.</p>
          <p className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5" aria-hidden />
            Built for schools in Pakistan
          </p>
        </div>
      </LandingContainer>
    </footer>
  );
}
