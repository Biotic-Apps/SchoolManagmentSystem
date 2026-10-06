import { PersonAvatar } from "./PersonAvatar";

interface PersonCellProps {
  name: string;
  caption?: string | null;
  photoUrl?: string | null;
}

/** Table cell: avatar, name and a muted second line. */
export function PersonCell({ name, caption, photoUrl }: PersonCellProps) {
  return (
    <span className="flex items-center gap-3">
      <PersonAvatar name={name} photoUrl={photoUrl} />
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{name}</span>
        {caption && <span className="truncate text-caption text-fg-muted">{caption}</span>}
      </span>
    </span>
  );
}
