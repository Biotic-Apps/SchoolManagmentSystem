import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** Extra classes for the scroll box, e.g. a max height for a sticky header. */
  wrapperClassName?: string;
}

export function Table({ className, wrapperClassName, ...props }: TableProps) {
  return (
    <div className={cn("w-full overflow-x-auto", wrapperClassName)}>
      <table className={cn("w-full caption-bottom border-collapse text-label", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("border-b border-border bg-gradient-to-b from-[#F8F6FF] to-[#F3F0FF]", className)} {...props} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("border-b border-border/60 transition-colors duration-(--dur-quick) ease-standard hover:bg-selected/50", className)} {...props} />;
}

export function TableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn("h-11 whitespace-nowrap px-5 text-left align-middle text-[11.5px] font-semibold uppercase tracking-[0.06em] text-primary/60", className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-5 py-4 align-middle text-fg", className)} {...props} />;
}
