"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

interface SlideToActionProps {
  onConfirm: () => void;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function SlideToAction({
  onConfirm,
  label = "DESLIZA PARA CONFIRMAR",
  disabled = false,
  loading = false,
}: SlideToActionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const thumbX = useMotionValue(0);
  const fillWidth = useTransform(thumbX, (x) => {
    if (containerWidth === 0) return 0;
    const thumbWidth = 56; // w-14 = 56px
    const maxDrag = containerWidth - thumbWidth - 12; // p-1.5 = 6px padding
    return (x / maxDrag) * 100;
  });

  useEffect(() => {
    if (!containerRef.current) return;
    setContainerWidth(containerRef.current.offsetWidth);

    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDragEnd = (info: any) => {
    const thumbWidth = 56;
    const maxDrag = containerWidth - thumbWidth - 12;
    const threshold = maxDrag * 0.8;

    // Use info.offset.x which is relative drag distance, not absolute screen coordinate
    const dragDistance = info.offset.x;

    if (dragDistance >= threshold && !disabled && !loading) {
      // Confirm action
      onConfirm();
      // Reset after short delay
      setTimeout(() => {
        animate(thumbX, 0, { type: "spring", stiffness: 300, damping: 30 });
      }, 500);
    } else {
      // Spring back
      animate(thumbX, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  };

  const thumbWidth = 56;
  const maxDrag = containerWidth > 0 ? containerWidth - thumbWidth - 12 : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "h-16 rounded-full p-1.5 relative overflow-hidden",
        "bg-[var(--color-surface-container-highest)]",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      {/* Fill background */}
      <motion.div
        className="absolute inset-0 bg-[var(--color-primary)] rounded-full"
        style={{
          width: fillWidth,
          opacity: 0.2,
        }}
      />

      {/* Thumb */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{
          x: thumbX,
        }}
        className={cn(
          "absolute left-1.5 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full",
          "bg-[var(--color-primary)] text-white",
          "flex items-center justify-center cursor-grab active:cursor-grabbing",
          "shadow-lg transition-shadow",
          loading && "opacity-60"
        )}
      >
        <Icon name="chevron_right" size={24} />
      </motion.div>

      {/* Label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="font-inter font-bold text-[11px] uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">
          {loading ? "Procesando..." : label}
        </span>
      </div>
    </div>
  );
}
