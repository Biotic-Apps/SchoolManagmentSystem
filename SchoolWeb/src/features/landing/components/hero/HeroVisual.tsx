import { CheckCircle2, MessageCircle, Wallet } from "lucide-react";
import { DashboardMockup } from "./DashboardMockup";
import { FloatingCard } from "./FloatingCard";

/** Dashboard mockup with a gentle 3D tilt on desktop, framed by floating notification cards. */
export function HeroVisual() {
  return (
    <div
      className="animate-rise-in relative mx-auto w-full max-w-[600px] pb-8 lg:max-w-none lg:pb-0 lg:[perspective:1800px]"
      style={{ animationDelay: "250ms", animationDuration: "900ms" }}
    >
      <div
        aria-hidden
        className="absolute inset-6 -z-10 rounded-[32px] bg-gradient-to-br from-primary/35 via-[#a78bfa]/25 to-accent-pink/25 blur-3xl"
      />
      <div className="transition-transform duration-700 ease-out lg:[transform:rotateY(-9deg)_rotateX(5deg)] lg:hover:[transform:rotateY(-4deg)_rotateX(2deg)]">
        <DashboardMockup />
      </div>

      <FloatingCard
        icon={CheckCircle2}
        iconClassName="bg-selected text-primary"
        title="Attendance marked"
        detail="Class 5-A · 32/34 present"
        className="-bottom-1 left-3 sm:-left-6 sm:-bottom-6 lg:-left-10"
      />
      <FloatingCard
        icon={Wallet}
        iconClassName="bg-[#FFE4E8] text-accent-pink"
        title="Fee received"
        detail="Rs 4,500 · Ayesha Khan"
        className="-right-4 -top-6 hidden sm:block lg:-right-6"
        delayed
      />
      <FloatingCard
        icon={MessageCircle}
        iconClassName="bg-[#E0F2FE] text-accent-cyan"
        title="New message from parent"
        detail="&ldquo;Ali will be a little late today&rdquo;"
        className="-right-8 bottom-[-28px] hidden lg:block"
      />
    </div>
  );
}
