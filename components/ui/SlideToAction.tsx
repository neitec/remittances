"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

interface SlideToActionProps {
  onConfirm: () => void;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
}

const THUMB_SIZE = 52;
const PADDING = 6;

export function SlideToAction({
  onConfirm,
  label = "DESLIZA PARA CONFIRMAR",
  disabled = false,
  loading = false,
}: SlideToActionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const thumbX = useMotionValue(0);

  const maxDrag = containerWidth > 0 ? containerWidth - THUMB_SIZE - PADDING * 2 : 0;

  // Fill width: grows from thumb+padding → full container
  const fillWidth = useTransform(thumbX, (x) => {
    if (containerWidth === 0) return THUMB_SIZE + PADDING * 2;
    const max = containerWidth - THUMB_SIZE - PADDING * 2;
    const p = Math.min(1, Math.max(0, x / (max > 0 ? max : 1)));
    return THUMB_SIZE + PADDING * 2 + p * (containerWidth - THUMB_SIZE - PADDING * 2);
  });

  // Label opacity: fades as thumb slides past 42% of track
  const labelOpacity = useTransform(thumbX, (x) => {
    const max = containerWidth > 0 ? containerWidth - THUMB_SIZE - PADDING * 2 : 1;
    const p = Math.min(1, Math.max(0, x / max));
    return Math.max(0, 1 - p / 0.42);
  });

  useEffect(() => {
    if (!containerRef.current) return;
    setContainerWidth(containerRef.current.offsetWidth);
    const handleResize = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDragEnd = (info: any) => {
    const threshold = maxDrag * 0.8;
    if (info.offset.x >= threshold && !disabled && !loading) {
      // Snap thumb to end, show burst, then fire onConfirm
      animate(thumbX, maxDrag, { type: "spring", stiffness: 400, damping: 35 });
      setConfirmed(true);
      setTimeout(() => {
        onConfirm();
        setTimeout(() => {
          setConfirmed(false);
          animate(thumbX, 0, { type: "spring", stiffness: 280, damping: 28 });
        }, 700);
      }, 380);
    } else {
      animate(thumbX, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  };

  return (
    <div className="relative">
      {/* Orange radial burst — expands behind the pill on confirm */}
      <AnimatePresence>
        {confirmed && (
          <motion.div
            key="burst"
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at center, rgba(188,72,0,0.40) 0%, rgba(188,72,0,0.14) 48%, transparent 72%)",
              zIndex: 0,
            }}
            initial={{ scale: 0.9, opacity: 1 }}
            animate={{ scale: 2.8, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </AnimatePresence>

      {/* Pill container */}
      <div
        ref={containerRef}
        className={cn(
          "relative h-[64px] rounded-full overflow-hidden select-none",
          disabled && "opacity-45 pointer-events-none"
        )}
        style={{
          background: "rgba(0,62,199,0.12)",
          boxShadow:
            "inset 0 2px 7px rgba(0,62,199,0.10), inset 0 1px 2px rgba(0,62,199,0.07)",
          zIndex: 1,
        }}
      >
        {/* Warm fill that grows as thumb slides */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: fillWidth,
            background:
              "linear-gradient(90deg, rgba(188,72,0,0.14) 0%, rgba(188,72,0,0.04) 100%)",
          }}
        />

        {/* Label — fades as thumb slides */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            opacity: labelOpacity,
            paddingLeft: THUMB_SIZE + PADDING * 2 + 8,
          }}
        >
          <span className="font-inter font-bold text-[10.5px] uppercase tracking-[0.24em] text-[var(--color-on-surface-variant)]/45">
            {loading ? "Procesando..." : label}
          </span>
        </motion.div>

        {/* Draggable thumb — starts at left: PADDING, x offset via motion value */}
        <motion.div
          drag={loading ? false : "x"}
          dragConstraints={{ left: 0, right: maxDrag }}
          dragElastic={0.06}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 1.05 }}
          className="absolute top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing z-10"
          style={{ x: thumbX, left: PADDING }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              background:
                "linear-gradient(145deg, #d05200 0%, #e06000 55%, #bc4800 100%)",
              boxShadow:
                "0 5px 18px rgba(188,72,0,0.50), 0 2px 5px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.22)",
            }}
          >
            <Icon name="chevron_right" size={22} className="text-white" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
