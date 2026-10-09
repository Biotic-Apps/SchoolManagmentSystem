import Link from "next/link";

export function AuthFooterLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="self-center text-label font-medium text-primary underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}
