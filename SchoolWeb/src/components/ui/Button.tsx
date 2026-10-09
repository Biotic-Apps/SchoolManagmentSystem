import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";
import { focusRing } from "./styles";

const buttonVariants = cva(
  `inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-input font-medium transition-[background-color,border-color,color,box-shadow,scale] duration-180 ease-standard active:scale-[0.97] motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-4 ${focusRing}`,
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary shadow-[0_1px_2px_rgb(11_127_116/0.25),inset_0_1px_0_rgb(255_255_255/0.12)] hover:bg-primary-hover active:bg-primary-hover",
        secondary: "border border-border-strong bg-surface text-fg shadow-xs hover:border-primary/45 hover:bg-selected hover:text-on-selected",
        ghost: "text-fg hover:bg-selected hover:text-on-selected",
        danger: "border border-error/30 bg-error-soft text-error hover:border-error/60 hover:bg-[#fbe1de]",
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
