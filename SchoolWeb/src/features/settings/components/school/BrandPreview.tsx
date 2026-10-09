import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { BrandMark } from "@/features/branding/components/BrandMark";
import { brandStyle } from "@/features/branding/brand-style";
import { cn } from "@/lib/cn";

interface BrandPreviewProps {
  color: string;
  passes: boolean;
  name: string;
  logoUrl: string | null;
  className?: string;
}

const PILL = "inline-flex h-8 items-center rounded-input px-3 text-label font-medium";

/** Mini login card and top bar drawn with the chosen colour; only this area overrides --primary. */
export function BrandPreview({ color, passes, name, logoUrl, className }: BrandPreviewProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <CardDescription>
          {passes ? "How the login screen and top bar will look." : "Showing the default colour until your colour passes the contrast check."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4" style={brandStyle(color)}>
        <div aria-hidden className="rounded-card bg-background p-4">
          <div className="flex flex-col gap-3 rounded-card border border-border bg-surface shadow-card p-4">
            <BrandMark name={name} logoUrl={logoUrl} subtitle="Sign in to continue" />
            <div className="h-9 rounded-input border border-border bg-surface" />
            <div className="h-9 rounded-input border border-border bg-surface" />
            <span className={cn(PILL, "h-9 justify-center bg-primary text-on-primary")}>Sign in</span>
          </div>
        </div>
        <div aria-hidden className="flex flex-col gap-3 rounded-card border border-border bg-surface shadow-card p-3">
          <BrandMark name={name} logoUrl={logoUrl} />
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn(PILL, "bg-primary/10 text-primary")}>Dashboard</span>
            <span className={cn(PILL, "text-fg-muted")}>Students</span>
            <span className={cn(PILL, "ml-auto bg-primary text-on-primary")}>Save</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
