import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LandingContainer } from "./LandingContainer";
import { Reveal } from "./Reveal";

/** Closing banner: deep purple card with drifting glows and the two sign-in actions. */
export function CtaSection() {
  return (
    <section className="pb-20 sm:pb-28">
      <LandingContainer>
        <Reveal from="scale">
          <div className="relative isolate overflow-hidden rounded-[32px] bg-gradient-to-br from-[#2A1F6B] via-[#3B2D8F] to-[#5B4BC7] px-6 py-14 text-center shadow-raised sm:px-12 sm:py-20">
            <div aria-hidden className="bg-dot-grid absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
            <div aria-hidden className="animate-drift absolute -left-24 -top-24 -z-10 size-72 rounded-full bg-primary/50 blur-3xl" />
            <div aria-hidden className="animate-drift absolute -bottom-28 -right-16 -z-10 size-80 rounded-full bg-accent-pink/30 blur-3xl" style={{ animationDelay: "-8s" }} />
            <div aria-hidden className="animate-drift absolute left-1/2 top-1/3 -z-10 size-56 rounded-full bg-[#A78BFA]/30 blur-3xl" style={{ animationDelay: "-16s" }} />

            <div className="mx-auto flex max-w-2xl flex-col items-center gap-5">
              <h2 className="text-[30px] font-bold leading-[1.15] tracking-tight text-white sm:text-[44px]">
                Ready to open your school&apos;s portal?
              </h2>
              <p className="text-body text-white/75 sm:text-[18px] sm:leading-7">
                Sign in with the account your school gave you and pick up right where you left off.
              </p>
              <div className="mt-3 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="group w-full bg-white text-primary shadow-[0_8px_24px_-8px_rgb(0_0_0/0.4)] hover:bg-white hover:text-primary-hover sm:w-auto"
                >
                  <Link href="/login">
                    Sign in now
                    <ArrowRight className="transition-transform duration-(--dur-quick) group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="w-full text-white ring-1 ring-inset ring-white/25 hover:bg-white/10 hover:text-white sm:w-auto"
                >
                  <Link href="/forgot-password">Forgot password?</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </LandingContainer>
    </section>
  );
}
