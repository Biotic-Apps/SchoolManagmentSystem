import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";
import { focusRing } from "./styles";

const buttonVariants = cva(
  // Press = 1px nudge via `translate` (never changes the box). Disabled/loading buttons ignore the pointer, so no press.
  "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-input font-medium " +
    "transition-[background-color,border-color,color,box-shadow,translate] duration-(--dur-quick) ease-standard " +
    "active:translate-y-px motion-reduce:active:translate-y-0 aria-disabled:active:translate-y-0 " +
    `disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-4 ${focusRing}`,
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary shadow-[0_1px_2px_rgb(123_104_238/0.25),inset_0_1px_0_rgb(255_255_255/0.12)] hover:bg-primary-hover hover:shadow-[0_3px_8px_-2px_rgb(123_104_238/0.35),inset_0_1px_0_rgb(255_255_255/0.12)] active:bg-primary-hover active:shadow-[0_1px_2px_rgb(123_104_238/0.25),inset_0_1px_0_rgb(255_255_255/0.12)]",
        secondary: "border border-border-strong bg-surface text-fg shadow-xs hover:border-primary/45 hover:bg-selected hover:text-on-selected hover:shadow-sm active:shadow-xs",
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
      {loading ? (
        <>
          {/* Label stays in the layout (and the accessible name) but hidden, so the width doesn't change. */}
          <span className="inline-flex items-center gap-2 opacity-0">{children}</span>
          <span className="absolute inset-0 grid place-items-center">
            <Spinner />
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
});
