import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

const SIZE_CLASS = { sm: "size-8 text-caption", md: "size-10 text-label", lg: "size-16 text-card-title" };

interface PersonAvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}

/** Photo when available, otherwise initials (students, staff, guardians). */
export function PersonAvatar({ name, photoUrl, size = "sm", className }: PersonAvatarProps) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full bg-selected font-semibold text-on-selected",
        SIZE_CLASS[size],
        className,
      )}
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- signed storage URLs, not optimizable
        <img src={photoUrl} alt="" className="size-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
