"use client";

import { useEffect, useState } from "react";

interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  currency?: "EUR" | "USD" | "GBP";
  className?: string;
}

export function CountUp({
  from = 0,
  to,
  duration = 800,
  currency = "EUR",
  className = "",
}: CountUpProps) {
  const [displayValue, setDisplayValue] = useState(from);

  useEffect(() => {
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Cubic ease-out: 1 - (1-t)^3
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [from, to, duration]);

  const formatted = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(displayValue);

  return <span className={className}>{formatted}</span>;
}
