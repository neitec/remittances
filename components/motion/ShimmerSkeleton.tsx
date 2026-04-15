import { cn } from "@/lib/utils";

interface ShimmerSkeletonProps {
  className?: string;
}

export function ShimmerSkeleton({ className = "" }: ShimmerSkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-brand-sand",
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <ShimmerSkeleton className="h-6 w-3/4" />
      <ShimmerSkeleton className="h-4 w-full" />
      <ShimmerSkeleton className="h-4 w-5/6" />
    </div>
  );
}

export function SkeletonText() {
  return <ShimmerSkeleton className="h-4 w-full" />;
}

export function SkeletonTransactionRow() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-4">
      <div className="flex items-center gap-3 flex-1">
        <ShimmerSkeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <ShimmerSkeleton className="h-4 w-24" />
          <ShimmerSkeleton className="h-3 w-32" />
        </div>
      </div>
      <ShimmerSkeleton className="h-5 w-20" />
    </div>
  );
}
