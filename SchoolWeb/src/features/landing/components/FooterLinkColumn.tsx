import Link from "next/link";

export interface FooterLink {
  label: string;
  href: string;
}

/** One titled column of footer links; in-page anchors use <a>, routes use next/link. */
export function FooterLinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  const linkClass =
    "rounded-sm text-label text-white/70 outline-none transition-colors duration-(--dur-quick) hover:text-white focus-visible:ring-2 focus-visible:ring-white/50";
  return (
    <div>
      <h3 className="text-caption font-semibold uppercase tracking-[0.12em] text-white/50">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            {link.href.startsWith("#") ? (
              <a href={link.href} className={linkClass}>
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className={linkClass}>
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
