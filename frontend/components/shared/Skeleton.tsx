import { cn } from "@/lib/utils/cn";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-forge bg-[var(--surface-raised)] border border-[var(--border-subtle)]", className)}
      {...props}
    />
  );
}
