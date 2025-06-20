// Create a custom scroll area component with custom styling
import * as React from "react";
import { cn } from "@/lib/utils";

const ScrollArea = React.forwardRef(
  ({ className, children, orientation = "vertical", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-auto",
          orientation === "vertical" && "h-full w-full",
          orientation === "horizontal" && "h-auto w-full",
          className
        )}
        {...props}
      >
        <div className="h-full min-w-full">{children}</div>
      </div>
    );
  }
);

ScrollArea.displayName = "ScrollArea";

const ScrollBar = React.forwardRef(
  ({ className, orientation = "vertical", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex touch-none select-none transition-colors",
          orientation === "vertical" &&
            "h-full w-2.5 border-l border-l-transparent p-[1px]",
          orientation === "horizontal" &&
            "h-2.5 border-t border-t-transparent p-[1px]",
          className
        )}
        {...props}
      >
        <div className="relative flex-1 rounded-full bg-muted" />
      </div>
    );
  }
);

ScrollBar.displayName = "ScrollBar";

export { ScrollArea, ScrollBar };