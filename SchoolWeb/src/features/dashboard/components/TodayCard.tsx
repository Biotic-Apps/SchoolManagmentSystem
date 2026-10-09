import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { IconTile } from "@/components/shared/IconTile";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface TodayCardProps {
  title: string;
  /** "Open" link to the module; omitted when the role can't open it. */
  href?: string | null;
  linkLabel?: string;
  icon?: LucideIcon;
  children: ReactNode;
}

/** Dashboard card (fills its grid cell, so cards in a row match) with a title, an optional link to the full screen and its content. */
export function TodayCard({ title, href, linkLabel = "Open", icon, children }: TodayCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {icon && <IconTile icon={icon} size="sm" />}
          <CardTitle className="truncate">{title}</CardTitle>
        </div>
        {href && (
          <Button asChild variant="ghost" size="sm" className="-mr-2 text-primary">
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
