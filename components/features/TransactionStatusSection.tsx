"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { UiTransactionStatus, getTransactionStatusConfig } from "@/lib/transactionStatus";
import { cn } from "@/lib/utils";

interface TransactionStatusSectionProps {
  uiStatus: UiTransactionStatus;
  isUserOrigin?: boolean;
}

export function TransactionStatusSection({ uiStatus, isUserOrigin }: TransactionStatusSectionProps) {
  const cfg      = getTransactionStatusConfig(uiStatus, isUserOrigin);
  const isFailed = uiStatus === UiTransactionStatus.FAILED;

  const isDeposit    = uiStatus === UiTransactionStatus.DEPOSIT_RECEIVED || uiStatus === UiTransactionStatus.DEPOSIT_COMPLETED;
  const isCompleted  = uiStatus === UiTransactionStatus.DEPOSIT_COMPLETED || uiStatus === UiTransactionStatus.TRANSFER_COMPLETED;

  const steps: { shortLabel: string; done: boolean; active: boolean }[] = isDeposit
    ? [
        { shortLabel: 'Recibido',   done: isCompleted,  active: !isCompleted },
        { shortLabel: 'Completado', done: isCompleted,  active: false        },
      ]
    : isUserOrigin
    ? [
        { shortLabel: 'Enviado',    done: isCompleted,  active: !isCompleted },
        { shortLabel: 'Completado', done: isCompleted,  active: false        },
      ]
    : [
        { shortLabel: 'Recibido',   done: isCompleted,  active: !isCompleted },
        { shortLabel: 'Completado', done: isCompleted,  active: false        },
      ];

  return (
    <div className="bg-[var(--color-surface-container-low)] rounded-2xl p-4 border border-[var(--color-outline-variant)]/10 space-y-4">
      <p className="text-xs text-[var(--color-on-surface-variant)] font-inter font-bold uppercase tracking-widest">
        Estado
      </p>

      {!isFailed && (
        <div className="flex items-center gap-0 max-w-[240px] mx-auto w-full">
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;

            return (
              <div key={idx} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="relative flex items-center justify-center">
                    {step.active && cfg.isPulse && (
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
                        step.done
                          ? "bg-[var(--color-success-text)] border-[var(--color-success-text)]"
                          : step.active
                            ? cn("border-current", cfg.iconClass, cfg.dotClass)
                            : "bg-transparent border-[var(--color-outline-variant)]/40"
                      )}
                    />
                  </div>
                  <p
                    className={cn(
                      "text-[9px] font-inter font-semibold tracking-wide text-center leading-tight w-[52px]",
                      step.done
                        ? "text-[var(--color-success-text)]"
                        : step.active
                          ? cfg.iconClass
                          : "text-[var(--color-on-surface-variant)]/40"
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
                      animate={{ width: step.done ? "100%" : "0%" }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Status card */}
      <div
        className={cn(
          "rounded-xl p-3 flex items-start gap-3",
          isFailed
            ? "bg-[var(--color-error-container)]/40"
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
        </div>
      </div>
    </div>
  );
}
