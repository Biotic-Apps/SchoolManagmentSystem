import { BookOpenCheck, BellRing, LockKeyhole, WifiOff, type LucideIcon } from "lucide-react";
import { Reveal } from "../Reveal";

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: WifiOff, title: "Mark attendance even offline", text: "No signal in the classroom? It saves on the phone and syncs automatically when you are back online." },
  { icon: BookOpenCheck, title: "Diary & homework on the go", text: "Teachers post the daily diary and homework in seconds, right from class." },
  { icon: BellRing, title: "Parents get everything instantly", text: "Results, fee challans and school messages reach parents the moment they are published." },
  { icon: LockKeyhole, title: "App lock & secure sign-in", text: "PIN or fingerprint lock keeps student data safe even if a phone is shared." },
];

/** Four icon rows describing the Android app, staggered on reveal. */
export function MobileFeatureList() {
  return (
    <ul className="flex flex-col gap-5">
      {FEATURES.map(({ icon: Icon, title, text }, i) => (
        <Reveal key={title} as="li" delay={100 + i * 90} from="left" className="flex gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-tile bg-white/10 text-white ring-1 ring-inset ring-white/15">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-body font-semibold text-white">{title}</p>
            <p className="mt-0.5 text-label text-white/70">{text}</p>
          </div>
        </Reveal>
      ))}
    </ul>
  );
}
