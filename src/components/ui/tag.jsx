// Create a new Tag component
import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const tagVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary hover:bg-primary/20",
        youtube: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        vimeo: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        direct: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        unknown: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Tag({ className, variant, children, ...props }) {
  return (
    <div className={cn(tagVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}