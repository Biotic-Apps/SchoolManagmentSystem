import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/** Primary "Sign in" link; the arrow nudges right on hover. */
export function SignInButton({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Button asChild className={cn("group", className)}>
      <Link href="/login" onClick={onClick}>
        Sign in
        <ArrowRight className="transition-transform duration-(--dur-quick) ease-standard group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0" />
      </Link>
    </Button>
  );
}
