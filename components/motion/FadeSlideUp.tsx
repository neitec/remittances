"use client";

import { motion, MotionProps } from "framer-motion";
import { ReactNode } from "react";

interface FadeSlideUpProps extends MotionProps {
  children: ReactNode;
  delay?: number;
}

export function FadeSlideUp({
  children,
  delay = 0,
  ...props
}: FadeSlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
