"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Transaction, TransactionType } from "@/lib/api";
import { formatCurrency, formatDate, getInitials, getCountryEmoji } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { useMe } from "@/lib/hooks/queries/useMe";
import { TransactionStatusSection } from "@/components/features/TransactionStatusSection";
import { UiTransactionStatus, mapToUiStatus } from "@/lib/transactionStatus";
import { cn } from "@/lib/utils";

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export function TransactionDetailModal({
  transaction: txn,
  onClose,
}: TransactionDetailModalProps) {
  const { data: me } = useMe();

  if (!txn) return null;

  const isTransfer = txn.type === TransactionType.TRANSFER;
  const isDeposit  = txn.type === TransactionType.DEPOSIT;

  // Dual-check: userId match OR email match as fallback (handles ID format mismatches)
  const isOutgoing = isTransfer && me && (
    txn.sourceAccount?.userId === me.id ||
    txn.sourceAccount?.user?.email === me.email
  );
  const isIncoming = isTransfer && !isOutgoing;

  const contact = isOutgoing ? txn.destinationAccount?.user : txn.sourceAccount?.user;

  const directionLabel = isOutgoing ? "Enviado" : isIncoming ? "Recibido" : "Depósito SEPA";
  const uiStatus       = mapToUiStatus(txn.type, txn.status, !!isOutgoing);
  const isCompleted    = uiStatus === UiTransactionStatus.DEPOSIT_COMPLETED || uiStatus === UiTransactionStatus.TRANSFER_COMPLETED;
  const accentColor    = isOutgoing ? "var(--color-tertiary)" : isIncoming ? "#059669" : "var(--color-primary)";
  const amountSign     = isOutgoing ? "−" : "+";

  const amountColor = isOutgoing
    ? "text-[var(--color-on-surface)]"
    : "text-[var(--color-primary)]";

  const chipBg = isOutgoing
    ? "bg-red-50 text-red-600"
    : isIncoming
      ? "bg-[var(--color-success-bg)] text-[var(--color-success-text)]"
      : "bg-[var(--color-primary-fixed)] text-[var(--color-primary)]";

  const chipIcon = isOutgoing ? "north_east" : "south_west";

  return (
    <AnimatePresence>
      {txn && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-[6px] z-50"
          />

          {/* Card modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className={cn(
              "fixed z-50 inset-x-0 mx-auto",
              "bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2",
              "w-full max-w-[560px]",
              "bg-[var(--color-surface-container-lowest)]",
              "rounded-t-[28px] sm:rounded-[28px]",
              "shadow-[0_24px_60px_rgba(0,0,0,0.18),0_4px_16px_rgba(0,0,0,0.06)]",
              "overflow-hidden",
              "max-h-[92dvh] flex flex-col",
              "pb-[env(safe-area-inset-bottom)]"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Directional accent bar */}
            <div className="h-[3px] w-full flex-shrink-0" style={{ background: accentColor }} />

            {/* Drag handle (mobile only) */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-9 h-1 rounded-full bg-[var(--color-outline-variant)]/40" />
            </div>

            {/* Mini header */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2 flex-shrink-0 sm:pt-5">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                  "text-[11px] font-inter font-bold uppercase tracking-widest",
                  chipBg
                )}
              >
                <Icon name={chipIcon} size={12} />
                {directionLabel}
              </span>

              <button
                onClick={onClose}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  "bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)]",
                  "text-[var(--color-on-surface-variant)] transition-colors"
                )}
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-6 pb-5 space-y-3">
              {/* Amount hero */}
              <div className={cn("text-center pt-4 pb-5 rounded-2xl", isCompleted && "bg-[var(--color-success-bg)]/60")}>
                <p
                  className={cn(
                    "font-manrope font-extrabold leading-none tracking-tight",
                    "text-[clamp(44px,10vw,56px)]",
                    amountColor
                  )}
                >
                  {amountSign}
                  {formatCurrency(parseFloat(txn.amount))}
                </p>
                <p className="mt-1 text-[11px] font-inter font-bold uppercase tracking-[0.14em] text-[var(--color-on-surface-variant)]/45">
                  {txn.currency}
                </p>

                {txn.reference && (
                  <p className="mt-3 text-sm font-inter italic text-[var(--color-on-surface-variant)]">
                    "{txn.reference}"
                  </p>
                )}

                <p className="mt-2 text-xs font-inter text-[var(--color-on-surface-variant)]/60">
                  {formatDate(txn.createdAt)}
                </p>
              </div>

              {/* Contact card (transfers) */}
              {isTransfer && contact && (
                <div
                  className={cn(
                    "rounded-2xl p-4 border border-[var(--color-outline-variant)]/10",
                    "bg-[var(--color-surface-container-low)]"
                  )}
                >
                  <p className="text-[10px] font-inter font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]/60 mb-3">
                    {isOutgoing ? "Para" : "De"}
                  </p>

                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center",
                        "font-manrope font-extrabold text-base",
                        "bg-[var(--color-primary-fixed)] text-[var(--color-primary)]",
                        "ring-2 ring-[var(--color-primary)]/10"
                      )}
                    >
                      {getInitials(contact.name, contact.surname)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-manrope font-bold text-[var(--color-on-surface)] text-[15px] leading-tight truncate">
                        {contact.name} {contact.surname}
                      </p>

                      {contact.alias && (
                        <p className="text-xs font-inter font-semibold text-[var(--color-primary)] mt-0.5">
                          @{contact.alias}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                        {contact.email && (
                          <span className="text-[11px] font-inter text-[var(--color-on-surface-variant)]/65 truncate">
                            {contact.email}
                          </span>
                        )}
                        {contact.country && (
                          <span className="text-[11px] font-inter text-[var(--color-on-surface-variant)]/65">
                            {getCountryEmoji(contact.country)} {contact.country}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Deposit origin card */}
              {isDeposit && txn.externalAccount && (
                <div
                  className={cn(
                    "rounded-2xl p-4 border border-[var(--color-outline-variant)]/10",
                    "bg-[var(--color-surface-container-low)]"
                  )}
                >
                  <p className="text-[10px] font-inter font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]/60 mb-3">
                    Origen
                  </p>

                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-[13px] flex-shrink-0 flex items-center justify-center",
                        "bg-[var(--color-primary-fixed)]"
                      )}
                    >
                      <Icon name="account_balance" size={20} className="text-[var(--color-primary)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-manrope font-bold text-[var(--color-on-surface)] text-sm leading-tight">
                        {txn.externalAccount.bankName}
                      </p>
                      {txn.externalAccount.accountNumber && (
                        <p className="text-xs font-mono text-[var(--color-on-surface-variant)]/65 mt-0.5">
                          {txn.externalAccount.accountNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Status section */}
              <TransactionStatusSection
                uiStatus={uiStatus}
                isUserOrigin={isDeposit ? undefined : !!isOutgoing}
              />

              {/* Metadata list */}
              <div
                className={cn(
                  "rounded-2xl border border-[var(--color-outline-variant)]/10",
                  "bg-[var(--color-surface-container-low)]",
                  "divide-y divide-[var(--color-outline-variant)]/10"
                )}
              >
                <div className="flex items-center justify-between px-4 py-3.5">
                  <p className="text-[11px] font-inter text-[var(--color-on-surface-variant)]/60">
                    Fecha
                  </p>
                  <p className="text-sm font-manrope font-bold text-[var(--color-on-surface)]">
                    {formatDate(txn.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Sticky footer */}
            <div
              className={cn(
                "flex-shrink-0 px-6 py-4 border-t border-[var(--color-outline-variant)]/10",
                "bg-[var(--color-surface-container-lowest)]"
              )}
            >
              <button
                onClick={onClose}
                className={cn(
                  "w-full py-3.5 rounded-xl",
                  "bg-[var(--color-primary)] text-white",
                  "font-manrope font-bold text-[15px]",
                  "hover:opacity-90 transition-opacity"
                )}
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
