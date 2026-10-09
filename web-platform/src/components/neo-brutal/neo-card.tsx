import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

export function NeoCard({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("neo-card", className)} {...props}>
      {children}
    </div>
  );
}

export function NeoInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "neo-border w-full bg-white px-4 py-3 text-lg font-medium outline-none focus-visible:ring-2 focus-visible:ring-neo-yellow disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
