import { SkeletonCard } from "@/components/motion/ShimmerSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-white px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md mx-auto">
        <SkeletonCard />
      </div>
    </div>
  );
}
