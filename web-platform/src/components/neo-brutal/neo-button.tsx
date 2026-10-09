"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type NeoButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | "onDrag"
  | "onDragEnd"
  | "onDragEnter"
  | "onDragExit"
  | "onDragLeave"
  | "onDragOver"
  | "onDragStart"
  | "onDrop"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "onTransitionEnd"
> & {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  onDrag?: never;
  onDragEnd?: never;
  onDragEnter?: never;
  onDragExit?: never;
  onDragLeave?: never;
  onDragOver?: never;
  onDragStart?: never;
  onDrop?: never;
  onAnimationStart?: never;
  onAnimationEnd?: never;
  onAnimationIteration?: never;
  onTransitionEnd?: never;
};

export const NeoButton = forwardRef<HTMLButtonElement, NeoButtonProps>(
  (
    { className, variant = "primary", size = "md", children, ...props },
    ref
  ) => {
    const variants = {
      primary: "bg-neo-yellow hover:bg-yellow-300",
      secondary: "bg-neo-blue hover:bg-teal-300",
      danger: "bg-neo-pink hover:bg-pink-300",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ x: 2, y: 2 }}
        className={cn(
          "neo-border neo-shadow font-bold tracking-wide uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current disabled:cursor-not-allowed disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

NeoButton.displayName = "NeoButton";
