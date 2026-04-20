"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

interface TopAppBarProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

export function TopAppBar({ title, onBack, rightAction, className }: TopAppBarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-6 lg:pl-[calc(208px+1.5rem)] lg:pr-6",
        className
      )}
      style={{
        background: "rgba(248, 249, 250, 0.7)",
        backdropFilter: "blur(48px)",
        WebkitBackdropFilter: "blur(48px)",
      }}
    >
      {/* Back button */}
      <button
        onClick={handleBack}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-container-low)] transition-colors"
        aria-label="Go back"
      >
        <Icon name="arrow_back" size={24} className="text-[var(--color-on-surface)]" />
      </button>

      {/* Title - centered */}
      <h1 className="absolute left-1/2 -translate-x-1/2 font-manrope font-bold text-lg text-[var(--color-on-surface)]">
        {title}
      </h1>

      {/* Right action */}
      <div className="w-10 h-10 flex items-center justify-center">
        {rightAction || <div />}
      </div>
    </div>
  );
}
