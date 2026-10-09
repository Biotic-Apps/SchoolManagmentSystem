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
  return <thead className={cn("border-b border-border bg-[#f7fbfa]", className)} {...props} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("border-b border-border/70 transition-colors duration-100 hover:bg-[#f3faf8]", className)} {...props} />;
}

export function TableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn("h-11 whitespace-nowrap px-4 text-left align-middle text-[12px] font-semibold uppercase tracking-[0.04em] text-fg-muted", className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3.5 align-middle text-fg", className)} {...props} />;
}
