"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { UiTransactionStatus, getTransactionStatusConfig } from "@/lib/transactionStatus";
import { cn } from "@/lib/utils";

interface TransactionStatusSectionProps {
  uiStatus: UiTransactionStatus;
  isUserOrigin?: boolean;
}

const SUCCESS_HEX  = "#16a34a";
const ERROR_HEX    = "#ba1a1a";
const PENDING_HEX  = "#3b82f6";

export function TransactionStatusSection({ uiStatus, isUserOrigin }: TransactionStatusSectionProps) {
  const cfg = getTransactionStatusConfig(uiStatus, isUserOrigin);

  const isFailed = uiStatus === UiTransactionStatus.FAILED;
  const isCompleted =
    uiStatus === UiTransactionStatus.DEPOSIT_COMPLETED ||
    uiStatus === UiTransactionStatus.TRANSFER_COMPLETED;
  const isPending = !isFailed && !isCompleted;

  const isDeposit =
    uiStatus === UiTransactionStatus.DEPOSIT_RECEIVED ||
    uiStatus === UiTransactionStatus.DEPOSIT_COMPLETED;

  const stepLabels: [string, string] = isDeposit
    ? ["Recibido", "Acreditado"]
    : isUserOrigin
      ? ["Enviado", "Entregado"]
      : ["Iniciado", "Recibido"];

  // Container background tints for the hero card
  const heroBg = isFailed
    ? "rgba(186,26,26,0.05)"
    : isCompleted
      ? "rgba(22,163,74,0.06)"
      : "rgba(59,130,246,0.06)";
  const heroBorder = isFailed
    ? "rgba(186,26,26,0.15)"
    : isCompleted
      ? "rgba(22,163,74,0.18)"
      : "rgba(59,130,246,0.18)";

  // Final dot color
  const finalDotColor = isFailed ? ERROR_HEX : isCompleted ? SUCCESS_HEX : PENDING_HEX;
  // Connector colors
  const trackBg = "rgba(0,0,0,0.06)";
  const fillColor = isFailed ? ERROR_HEX : SUCCESS_HEX;

  return (
    <section
      className="rounded-[20px] overflow-hidden"
      style={{
        background: "var(--color-surface-container-lowest)",
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div
        className="px-5 py-2.5 flex items-center gap-2"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
      >
        <p className="font-inter font-bold text-[10px] uppercase tracking-[0.22em] text-[var(--color-on-surface-variant)]/45">
          Estado
        </p>
      </div>

      {/* Hero status card */}
      <div
        className="mx-4 mt-4 rounded-[14px] p-4 flex items-start gap-3"
        style={{ background: heroBg, border: `1px solid ${heroBorder}` }}
      >
        <div className="relative flex-shrink-0 w-10 h-10 flex items-center justify-center">
          {/* Pulse ring (only when pending) */}
          {isPending && (
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ background: PENDING_HEX, opacity: 0.18 }}
              animate={{ scale: [1, 1.6, 1.6], opacity: [0.22, 0, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", repeatDelay: 0.5 }}
            />
          )}
          <div
            className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: isFailed
                ? "rgba(186,26,26,0.10)"
                : isCompleted
                  ? "rgba(22,163,74,0.12)"
                  : "rgba(59,130,246,0.12)",
            }}
          >
            {cfg.icon === "sync" || (isPending && cfg.icon === "send") ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                className="flex items-center justify-center"
              >
                <Icon name={cfg.icon} size={18} className={cfg.iconClass} filled={cfg.iconFilled} />
              </motion.span>
            ) : (
              <Icon name={cfg.icon} size={18} className={cfg.iconClass} filled={cfg.iconFilled} />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className={cn("font-manrope font-bold text-[14px] leading-tight", cfg.iconClass)}>
            {cfg.label}
          </p>
          <p className="text-[12px] font-inter text-[var(--color-on-surface-variant)]/70 mt-1 leading-relaxed">
            {cfg.description}
          </p>
        </div>
      </div>

      {/* Progress timeline */}
      <div className="px-5 pt-4 pb-4">
        <div className="flex items-center gap-2">
          {/* Step 1: always done */}
          <StepDot state="done" color={isFailed ? ERROR_HEX : SUCCESS_HEX} />

          {/* Connector line */}
          <div
            className="flex-1 h-[3px] rounded-full overflow-hidden relative"
            style={{ background: trackBg }}
          >
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: fillColor }}
              initial={false}
              animate={{ width: isCompleted || isFailed ? "100%" : "55%" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
            {isPending && (
              <motion.div
                className="absolute inset-y-0 pointer-events-none"
                style={{
                  width: "30%",
                  background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%)`,
                }}
                animate={{ x: ["-50%", "250%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.4 }}
              />
            )}
          </div>

          {/* Step 2: depends on status */}
          <StepDot
            state={isFailed ? "failed" : isCompleted ? "done" : "active"}
            color={finalDotColor}
          />
        </div>

        <div className="flex items-center justify-between mt-2">
          <span
            className="text-[10.5px] font-inter font-semibold"
            style={{ color: isFailed ? ERROR_HEX : SUCCESS_HEX }}
          >
            {stepLabels[0]}
          </span>
          <span
            className={cn(
              "text-[10.5px] font-inter font-semibold",
              isPending && "animate-[pulse_2s_ease-in-out_infinite]"
            )}
            style={{ color: finalDotColor }}
          >
            {stepLabels[1]}
          </span>
        </div>
      </div>
    </section>
  );
}

interface StepDotProps {
  state: "done" | "active" | "failed";
  color: string;
}

function StepDot({ state, color }: StepDotProps) {
  if (state === "done") {
    return (
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: color }}
      >
        <Icon name="check" size={12} className="text-white" />
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: color }}
      >
        <Icon name="close" size={12} className="text-white" />
      </div>
    );
  }

  // active (pending)
  return (
    <div className="relative w-5 h-5 flex items-center justify-center flex-shrink-0">
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ background: color, opacity: 0.25 }}
        animate={{ scale: [1, 1.6, 1.6], opacity: [0.30, 0, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", repeatDelay: 0.4 }}
      />
      <span
        className="relative w-3 h-3 rounded-full border-2"
        style={{ borderColor: color, background: "white" }}
      />
    </div>
  );
}
