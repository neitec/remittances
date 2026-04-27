"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/format";

interface TransferProcessingScreenProps {
  amount: number;
  recipientName: string;
  recipientIdentifier: string;
  senderName: string;
  onComplete: () => void;
}

type Phase = "init" | "routing" | "pending" | "completed";

const PARTICLES = [
  { left: "8%",  top: "22%", delay: "0s",   dur: "5.2s", size: "1.5px" },
  { left: "20%", top: "68%", delay: "1.6s", dur: "4.8s", size: "2px"   },
  { left: "38%", top: "15%", delay: "3.1s", dur: "5.6s", size: "1.5px" },
  { left: "55%", top: "78%", delay: "0.9s", dur: "5.0s", size: "2px"   },
  { left: "72%", top: "30%", delay: "2.4s", dur: "4.5s", size: "1.5px" },
  { left: "85%", top: "60%", delay: "1.2s", dur: "5.8s", size: "2px"   },
  { left: "14%", top: "45%", delay: "4.0s", dur: "4.9s", size: "1.5px" },
  { left: "64%", top: "82%", delay: "0.5s", dur: "5.3s", size: "2px"   },
  { left: "91%", top: "18%", delay: "2.8s", dur: "4.7s", size: "1.5px" },
  { left: "47%", top: "50%", delay: "3.6s", dur: "5.1s", size: "2px"   },
];

const DOT_DELAYS = [0, 0.38, 0.76];

export function TransferProcessingScreen({
  amount,
  recipientName,
  recipientIdentifier,
  senderName,
  onComplete,
}: TransferProcessingScreenProps) {
  const [phase, setPhase] = useState<Phase>("init");
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("routing"), 350);
    const t2 = setTimeout(() => setPhase("pending"), 1900);
    const t3 = setTimeout(() => {
      setPhase("completed");
      setTimeout(() => onComplete(), 800);
    }, 2600);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [onComplete]);

  const senderInitial = senderName[0]?.toUpperCase() ?? "E";
  const recipientInitial = recipientName[0]?.toUpperCase() ?? "?";
  const isRouting = phase === "routing";
  const isPending = phase === "pending";
  const isCompleted = phase === "completed";
  const lineVisible = isRouting || isPending || isCompleted;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ background: "linear-gradient(145deg, #001462 0%, #001e78 50%, #0a1870 100%)" }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Ambient orbs */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "460px", height: "460px",
          top: "-120px", left: "-100px",
          background: "radial-gradient(circle, rgba(100,168,255,0.13) 0%, transparent 70%)",
        }}
        animate={{ x: [0, 24, 8, 0], y: [0, 18, 32, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "380px", height: "380px",
          bottom: "-90px", right: "-80px",
          background: "radial-gradient(circle, rgba(0,48,190,0.35) 0%, transparent 68%)",
        }}
        animate={{ x: [0, -18, -32, 0], y: [0, -14, -26, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      {isCompleted && (
        <motion.div
          className="absolute rounded-full pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            width: "300px", height: "300px",
            top: "50%", right: "10%",
            transform: "translateY(-50%)",
            background: "radial-gradient(circle, rgba(16,185,129,0.14) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              width: p.size, height: p.size,
              background: "rgba(255,255,255,0.70)",
              left: p.left, top: p.top,
              animation: `transfer-flow ${p.dur} ease-in-out ${p.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* Top label */}
      <motion.p
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.2 }}
        className="absolute top-10 text-white/30 text-[10px] font-inter tracking-[0.22em] uppercase"
      >
        Transferencia on-chain · Remita GCS
      </motion.p>

      {/* Amount */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-14"
      >
        <p className="text-white/35 text-[10px] font-inter tracking-[0.22em] uppercase mb-2">
          Monto transferido
        </p>
        <p
          className="text-white font-manrope font-extrabold leading-none"
          style={{ fontSize: "clamp(40px, 8vw, 56px)", letterSpacing: "-0.03em" }}
        >
          {formatCurrency(amount)}
        </p>
      </motion.div>

      {/* ── Flow nodes + connection ── */}
      <div className="w-full max-w-[520px] flex items-center mb-12">

        {/* Sender node */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-3 flex-shrink-0 w-[100px]"
        >
          <div className="relative">
            {/* Outer pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: "1.5px solid rgba(100,168,255,0.45)" }}
              animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", repeatDelay: 0.8 }}
            />
            <div
              className="w-[60px] h-[60px] rounded-full flex items-center justify-center font-manrope font-bold text-white text-[20px] relative z-10"
              style={{
                background: "linear-gradient(135deg, #003ec7, #0052ff)",
                boxShadow: "0 0 0 3px rgba(0,82,255,0.22), 0 4px 20px rgba(0,82,255,0.40)",
              }}
            >
              {senderInitial}
            </div>
          </div>
          <div className="text-center">
            <p className="text-white/85 font-manrope font-bold text-[12px] leading-tight">{senderName}</p>
            <p className="text-white/35 font-inter text-[10px] mt-0.5 uppercase tracking-[0.1em]">Mi Wallet</p>
          </div>
        </motion.div>

        {/* ── Animated connection track ── */}
        <div className="flex-1 relative flex items-center px-3 h-[60px]">
          {/* Base track — always visible, faint */}
          <div
            className="absolute left-3 right-3 h-[1.5px] rounded-full"
            style={{ background: "rgba(255,255,255,0.07)" }}
          />

          {/* Filled progress line */}
          <AnimatePresence>
            {lineVisible && (
              <motion.div
                className="absolute left-3 h-[1.5px] rounded-full"
                style={{
                  background: isCompleted
                    ? "linear-gradient(90deg, rgba(0,82,255,0.9), rgba(16,185,129,0.9))"
                    : "linear-gradient(90deg, rgba(0,82,255,0.8), rgba(100,180,255,0.5))",
                  filter: "blur(0.4px)",
                }}
                initial={{ width: "0%" }}
                animate={{ width: "calc(100% - 24px)" }}
                transition={{ duration: 1.1, ease: [0.25, 0.1, 0.25, 1] }}
              />
            )}
          </AnimatePresence>

          {/* Glow trail on top of line */}
          {lineVisible && (
            <motion.div
              className="absolute left-3 h-[4px] rounded-full"
              style={{
                background: isCompleted
                  ? "linear-gradient(90deg, transparent, rgba(16,185,129,0.3), transparent)"
                  : "linear-gradient(90deg, transparent, rgba(100,180,255,0.3), transparent)",
                filter: "blur(3px)",
                width: "calc(100% - 24px)",
              }}
            />
          )}

          {/* Traveling dots — animate left 4% → 96% along the track */}
          {lineVisible && !isCompleted && DOT_DELAYS.map((delay, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: i === 0 ? "7px" : "5px",
                height: i === 0 ? "7px" : "5px",
                top: "50%",
                marginTop: i === 0 ? "-3.5px" : "-2.5px",
                background: "white",
                boxShadow: `0 0 ${i === 0 ? 8 : 5}px ${i === 0 ? 3 : 2}px rgba(140,210,255,${i === 0 ? 0.85 : 0.5})`,
              }}
              animate={{ left: ["4%", "94%", "4%"] }}
              transition={{
                duration: 1.5,
                delay,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}

          {/* Completion burst when done */}
          {isCompleted && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: "6px", height: "6px",
                    background: "rgba(16,185,129,0.9)",
                    boxShadow: "0 0 8px 2px rgba(16,185,129,0.5)",
                    left: `${25 + i * 25}%`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: [0, 1, 0.6] }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* Recipient node */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-3 flex-shrink-0 w-[100px]"
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                border: isCompleted
                  ? "1.5px solid rgba(16,185,129,0.45)"
                  : "1.5px solid rgba(255,255,255,0.10)",
              }}
              animate={isCompleted
                ? { scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }
                : { scale: 1, opacity: 0.5 }
              }
              transition={isCompleted
                ? { duration: 0.9, ease: "easeOut" }
                : {}
              }
            />
            <motion.div
              className="w-[60px] h-[60px] rounded-full flex items-center justify-center font-manrope font-bold text-white text-[20px] relative z-10"
              animate={{
                background: isCompleted
                  ? ["linear-gradient(135deg, #1a2a6e, #2a3a9e)", "linear-gradient(135deg, #059669, #10b981)"]
                  : "linear-gradient(135deg, #1a2a6e, #2a3a9e)",
                boxShadow: isCompleted
                  ? ["0 0 0 3px rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.3)", "0 0 0 3px rgba(16,185,129,0.25), 0 4px 20px rgba(16,185,129,0.40)"]
                  : "0 0 0 3px rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.3)",
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {recipientInitial}
            </motion.div>
          </div>
          <div className="text-center">
            <p className="text-white/85 font-manrope font-bold text-[12px] leading-tight truncate max-w-[90px]">{recipientName}</p>
            <p className="text-white/35 font-inter text-[10px] mt-0.5 truncate max-w-[90px]">{recipientIdentifier}</p>
          </div>
        </motion.div>
      </div>

      {/* ── Status badge ── */}
      <AnimatePresence mode="wait">
        {isPending && !isCompleted && (
          <motion.div
            key="pending"
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.94 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-full"
            style={{
              background: "rgba(245,158,11,0.14)",
              border: "1px solid rgba(245,158,11,0.32)",
            }}
          >
            <motion.span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: "#f59e0b" }}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <span
              className="font-inter font-semibold text-[11px] uppercase tracking-[0.14em]"
              style={{ color: "#f59e0b" }}
            >
              Transacción pendiente
            </span>
          </motion.div>
        )}

        {isCompleted && (
          <motion.div
            key="completed"
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-3"
          >
            <div
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-full"
              style={{
                background: "rgba(16,185,129,0.14)",
                border: "1px solid rgba(16,185,129,0.35)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: "#10b981" }}
              />
              <span
                className="font-inter font-semibold text-[11px] uppercase tracking-[0.14em]"
                style={{ color: "#10b981" }}
              >
                Transacción procesada
              </span>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/25 font-inter text-[11px]"
            >
              Redirigiendo al inicio...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
