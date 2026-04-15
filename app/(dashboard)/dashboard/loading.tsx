import { SkeletonCard, SkeletonTransactionRow } from "@/components/motion/ShimmerSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-white">
      {/* Header skeleton */}
      <div className="sticky top-0 z-40 bg-brand-white border-b border-brand-sand/20 px-4 sm:px-6 lg:px-8 py-6">
        <div className="h-8 w-48 bg-brand-sand rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-brand-sand rounded mt-2 animate-pulse" />
      </div>

      {/* Main content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Balance card skeleton */}
        <SkeletonCard />

        {/* Buttons skeleton */}
        <div className="grid grid-cols-2 gap-4">
          <div className="h-14 bg-brand-sand rounded-lg animate-pulse" />
          <div className="h-14 bg-brand-sand rounded-lg animate-pulse" />
        </div>

        {/* Transactions skeleton */}
        <div>
          <div className="h-6 w-40 bg-brand-sand rounded-lg animate-pulse mb-4" />
          <div className="space-y-2">
            <SkeletonTransactionRow />
            <SkeletonTransactionRow />
            <SkeletonTransactionRow />
          </div>
        </div>
      </main>
    </div>
  );
}
