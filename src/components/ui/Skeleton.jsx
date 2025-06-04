import { cn } from '@/lib/utils'

const Skeleton = ({ className, ...props }) => {
  return (
    <div 
      className={cn(
        "animate-pulse rounded-md bg-muted/50",
        className
      )}
      {...props}
    />
  )
}

export default Skeleton