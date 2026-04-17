import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "bg-white/70 backdrop-blur-[24px] border border-white/40 rounded-2xl p-6",
        "shadow-[0_4px_20px_rgba(0,0,0,0.03)]",
        className
      )}
    >
      {children}
    </div>
  );
}
