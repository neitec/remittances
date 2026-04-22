"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { TransactionStatus, TransactionType } from "@/lib/types";
import { getTransactionStatusConfig } from "@/lib/transactionStatus";
import { cn } from "@/lib/utils";

interface TransactionStatusSectionProps {
  status: TransactionStatus;
  type: TransactionType;
}

export function TransactionStatusSection({ status, type }: TransactionStatusSectionProps) {
  const cfg = getTransactionStatusConfig(status, type);
  const isFailed = status === TransactionStatus.FAILED;

  const isDeposit = type === TransactionType.DEPOSIT;
  const steps: { key: TransactionStatus; shortLabel: string }[] = isDeposit
    ? [
        { key: TransactionStatus.FUNDS_RECEIVED, shortLabel: "Recibido" },
        { key: TransactionStatus.IN_PROGRESS, shortLabel: "Procesando" },
        { key: TransactionStatus.COMPLETED, shortLabel: "Completado" },
      ]
    : [
        { key: TransactionStatus.PAYMENT_SUBMITTED, shortLabel: "Enviado" },
        { key: TransactionStatus.IN_PROGRESS, shortLabel: "Procesando" },
        { key: TransactionStatus.COMPLETED, shortLabel: "Completado" },
      ];

  const statusOrder: TransactionStatus[] = isDeposit
    ? [
        TransactionStatus.FUNDS_RECEIVED,
        TransactionStatus.IN_REVIEW,
        TransactionStatus.IN_PROGRESS,
        TransactionStatus.COMPLETED,
      ]
    : [
        TransactionStatus.PAYMENT_SUBMITTED,
        TransactionStatus.IN_REVIEW,
        TransactionStatus.IN_PROGRESS,
        TransactionStatus.COMPLETED,
      ];

  const currentIdx = statusOrder.indexOf(status);

  function getStepState(stepKey: TransactionStatus): "done" | "active" | "pending" {
    if (isFailed) {
      const stepIdx = statusOrder.indexOf(stepKey);
      if (stepIdx < currentIdx) return "done";
      if (stepIdx === currentIdx) return "active";
      return "pending";
    }
    const stepIdx = statusOrder.indexOf(stepKey);
    if (stepIdx < currentIdx) return "done";
    if (stepIdx === currentIdx) return "active";
    return "pending";
  }

  return (
    <div className="bg-[var(--color-surface-container-low)] rounded-2xl p-4 border border-[var(--color-outline-variant)]/10 space-y-4">
      <p className="text-xs text-[var(--color-on-surface-variant)] font-inter font-bold uppercase tracking-widest">
        Estado
      </p>

      {!isFailed && (
        <div className="flex items-center gap-0">
          {steps.map((step, idx) => {
            const state = getStepState(step.key);
            const isLast = idx === steps.length - 1;

            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="relative flex items-center justify-center">
                    {state === "active" && cfg.isPulse && (
                      <span
                        className={cn(
                          "absolute w-5 h-5 rounded-full animate-pulse-ring opacity-50",
                          cfg.dotClass
                        )}
                      />
                    )}
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full border-2 transition-all duration-500 relative z-10",
                        state === "done"
                          ? "bg-[var(--color-success-text)] border-[var(--color-success-text)]"
                          : state === "active"
                            ? cn("border-current", cfg.iconClass, cfg.dotClass)
                            : "bg-transparent border-[var(--color-outline-variant)]/40"
                      )}
                    />
                  </div>
                  <p
                    className={cn(
                      "text-[9px] font-inter font-semibold tracking-wide text-center leading-tight",
                      state === "pending"
                        ? "text-[var(--color-on-surface-variant)]/40"
                        : state === "done"
                          ? "text-[var(--color-success-text)]"
                          : cfg.iconClass
                    )}
                  >
                    {step.shortLabel}
                  </p>
                </div>

                {!isLast && (
                  <div className="flex-1 h-[2px] mx-1 rounded-full overflow-hidden bg-[var(--color-outline-variant)]/20">
                    <motion.div
                      className="h-full rounded-full bg-[var(--color-success-text)]"
                      initial={{ width: "0%" }}
                      animate={{ width: state === "done" ? "100%" : "0%" }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div
        className={cn(
          "rounded-xl p-3 flex items-start gap-3",
          isFailed
            ? "bg-[var(--color-error-container)]/40"
            : status === TransactionStatus.IN_REVIEW
              ? "bg-amber-50"
              : cfg.isPulse
                ? "bg-[var(--color-primary-fixed)]/50"
                : "bg-[var(--color-success-bg)]"
        )}
      >
        <div className="relative flex-shrink-0 flex items-center justify-center mt-0.5">
          {cfg.isPulse && (
            <motion.span
              className={cn("absolute w-7 h-7 rounded-full", cfg.dotClass, "opacity-20")}
              animate={{ scale: [1, 1.8, 1.8], opacity: [0.2, 0, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", repeatDelay: 0.6 }}
            />
          )}
          {cfg.icon === "sync" ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="relative z-10"
            >
              <Icon name="sync" size={20} className={cfg.iconClass} />
            </motion.span>
          ) : (
            <Icon
              name={cfg.icon}
              size={20}
              className={cn(cfg.iconClass, "relative z-10", cfg.isPulse && "animate-glow-pulse")}
              filled={cfg.iconFilled}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={cn("font-manrope font-bold text-sm", cfg.iconClass)}>
            {cfg.label}
          </p>
          <p className="text-xs text-[var(--color-on-surface-variant)] font-inter mt-0.5 leading-relaxed">
            {cfg.description}
          </p>

          {status === TransactionStatus.IN_REVIEW && (
            <div className="mt-2 flex items-center gap-1.5">
              <Icon name="verified_user" size={11} className="text-amber-500 flex-shrink-0" />
              <p className="text-[10px] font-inter text-amber-600 font-semibold">
                Verificación de cumplimiento normativo
              </p>
            </div>
          )}
        </div>
      </div>

      {status === TransactionStatus.IN_REVIEW && (
        <p className="text-[10px] font-inter text-[var(--color-on-surface-variant)]/55 text-center">
          La revisión suele resolverse en menos de 24 horas hábiles.
        </p>
      )}
    </div>
  );
}
