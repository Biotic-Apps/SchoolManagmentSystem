import { LogIn, Mail } from "lucide-react";
import { Button } from "@/components/site/ui/Button";
import { Reveal } from "@/components/site/motion/Reveal";
import { AnimatedHeading } from "@/components/site/motion/AnimatedHeading";
import { Aurora } from "@/components/site/motion/Aurora";
import { SIGN_IN_URL } from "@/lib/site/links";
import { CTA_COPY } from "@/lib/site/content";

/** Closing call to action, wearing the same gradient as the app's sign-in panel. */
export function CtaBand() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="gradient-panel absolute inset-0" />
      <Aurora variant="panel" />
      <div aria-hidden className="doc-pattern absolute inset-0" />

      <div className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:px-8 sm:py-28">
        <AnimatedHeading
          text={CTA_COPY.title}
          className="text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.7rem]"
        />

        <Reveal delay={0.3}>
          <p className="mx-auto mt-5 max-w-xl text-pretty leading-relaxed text-white/80">
            {CTA_COPY.body}
          </p>
        </Reveal>

        <Reveal delay={0.38}>
          <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button href={SIGN_IN_URL} variant="onDark" size="lg">
              <LogIn className="size-4" strokeWidth={2.2} />
              {CTA_COPY.signIn}
            </Button>
            <Button href="/contact" size="lg" variant="outlineOnDark">
              <Mail className="size-4" strokeWidth={2.2} />
              {CTA_COPY.contact}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
