import { SkeletonCard } from "@/components/motion/ShimmerSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-white px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex justify-between items-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="w-8 h-8 rounded-full bg-brand-sand animate-pulse" />
          ))}
        </div>
        <SkeletonCard />
      </div>
    </div>
  );
}
