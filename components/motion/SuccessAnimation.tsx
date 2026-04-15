"use client";

import { motion } from "framer-motion";

interface SuccessAnimationProps {
  show: boolean;
}

// Predefined confetti positions (no Math.random in render to avoid hydration issues)
const confettiPieces = [
  { x: 100, y: -200, rotate: 360 },
  { x: -100, y: -180, rotate: -360 },
  { x: 150, y: -160, rotate: 360 },
  { x: -150, y: -140, rotate: -360 },
  { x: 80, y: -190, rotate: 360 },
  { x: -80, y: -170, rotate: -360 },
];

const confettiColors = [
  "#2EC4B6", // turquoise
  "#E8A838", // gold
  "#FF6B6B", // coral
  "#1A3A5C", // navy
  "#FAFAF7", // white
  "#F0EDE8", // sand
];

export function SuccessAnimation({ show }: SuccessAnimationProps) {
  if (!show) return null;

  return (
    <motion.div
      className="relative w-32 h-32 mx-auto"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
    >
      {/* Checkmark circle background */}
      <motion.svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Outer circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="#2EC4B6"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        />

        {/* Checkmark polyline */}
        <motion.polyline
          points="30,50 45,65 75,35"
          fill="none"
          stroke="#2EC4B6"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        />
      </motion.svg>

      {/* Confetti pieces */}
      {confettiPieces.map((piece, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: confettiColors[i % confettiColors.length],
            left: "50%",
            top: "50%",
            marginLeft: "-4px",
            marginTop: "-4px",
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: piece.x,
            y: piece.y,
            opacity: 0,
            rotate: piece.rotate,
          }}
          transition={{
            duration: 1.5 + (i % 3) * 0.2,
            ease: "easeOut",
            delay: 0.3,
          }}
        />
      ))}
    </motion.div>
  );
}
