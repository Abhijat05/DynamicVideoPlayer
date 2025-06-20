// Create a skeleton loading component
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/50 dark:bg-muted/20",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }