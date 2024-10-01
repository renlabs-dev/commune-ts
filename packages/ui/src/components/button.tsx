import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@commune-ts/ui";

const buttonVariants = cva(
  "focus-visible:ring-ring inline-flex items-center justify-center whitespace-nowrap text-sm font-medium backdrop-blur-md transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        base: "border border-white/20 bg-[#898989]/5 text-white hover:border-green-500 hover:bg-green-500/15 hover:text-green-500 active:bg-green-500/40",
        green:
          "border border-green-500/50 bg-green-500/10 text-green-500 hover:border-green-500/70 hover:bg-green-500/15 active:bg-green-500/40",
        red: "border border-red-500/50 bg-red-500/10 text-red-500 hover:border-red-500/70 hover:bg-red-500/15 active:bg-red-500/40",
        amber:
          "border border-amber-500/50 bg-amber-500/10 text-amber-500 hover:border-amber-500/70 hover:bg-amber-500/15 active:bg-amber-500/40",
        purple:
          "border border-purple-500/50 bg-purple-500/10 text-purple-500 hover:border-purple-500/70 hover:bg-purple-500/15 active:bg-purple-500/40",
        cyan: "border border-cyan-500/50 bg-cyan-500/10 text-cyan-500 hover:border-cyan-500/70 hover:bg-cyan-500/15 active:bg-cyan-500/40",
        link: "underline-offset-4 hover:underline",
      },
      size: {
        icon: "p-2",
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 py-2",
        lg: "h-10 px-6",
        xl: "font-lg h-10 px-10",
      },
    },
    defaultVariants: {
      variant: "base",
      size: "md",
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
