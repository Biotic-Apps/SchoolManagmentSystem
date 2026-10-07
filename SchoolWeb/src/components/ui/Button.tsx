import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";
import { focusRing } from "./styles";

const buttonVariants = cva(
  `inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-input font-medium transition-colors disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-4 ${focusRing}`,
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary shadow-xs hover:bg-primary-hover active:bg-primary-hover",
        secondary: "border border-border-strong bg-surface text-fg hover:border-primary/50 hover:bg-selected hover:text-on-selected",
        ghost: "text-fg hover:bg-selected hover:text-on-selected",
        danger: "border border-error/30 bg-error-soft text-error hover:border-error/50",
      },
      size: {
        sm: "h-8 px-3 text-label",
        md: "h-10 px-4 text-label",
        lg: "h-12 px-5 text-body",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild, loading, disabled, children, type, ...props },
  ref,
) {
  if (asChild) {
    return (
      <Slot ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}>
        {children}
      </Slot>
    );
  }
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
});
