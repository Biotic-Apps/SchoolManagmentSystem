import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface TodayCardProps {
  title: string;
  /** "Open" link to the module; omitted when the role can't open it. */
  href?: string | null;
  linkLabel?: string;
  children: ReactNode;
}

/** Dashboard card with a title, an optional link to the full screen and its content. */
export function TodayCard({ title, href, linkLabel = "Open", children }: TodayCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle>{title}</CardTitle>
        {href && (
          <Button asChild variant="ghost" size="sm">
            <Link href={href}>
              {linkLabel}
              <ArrowRight />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1">{children}</CardContent>
    </Card>
  );
}
