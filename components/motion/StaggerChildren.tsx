"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StaggerChildrenProps {
  children: ReactNode;
  delay?: number;
  skipAnimation?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: delay,
    },
  }),
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export function StaggerChildren({
  children,
  delay = 0,
  skipAnimation = false,
}: StaggerChildrenProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial={skipAnimation ? "visible" : "hidden"}
      animate="visible"
      custom={delay}
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({ children }: { children: ReactNode }) {
  return (
    <motion.div variants={itemVariants}>
      {children}
    </motion.div>
  );
}
