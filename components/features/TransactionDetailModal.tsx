"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Transaction, TransactionType, TransactionStatus } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { useMe } from "@/lib/hooks/queries/useMe";
import { useState } from "react";
import { TransactionStatusSection } from "@/components/features/TransactionStatusSection";
import { normalizeStatus } from "@/lib/transactionStatus";
import { cn } from "@/lib/utils";

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

function getInitials(name?: string, surname?: string): string {
  if (!name || !surname) return "??";
  return `${name[0]}${surname[0]}`.toUpperCase();
}

function getCountryEmoji(country?: string): string {
  if (!country || country.length !== 2) return "🌍";
  const codePoints = country
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 8 },
};

export function TransactionDetailModal({
  transaction: txn,
  onClose,
}: TransactionDetailModalProps) {
  const { data: me } = useMe();
  const [copiedId, setCopiedId] = useState(false);

  if (!txn) return null;

  const isTransfer = txn.type === TransactionType.TRANSFER;
  const isOutgoing = isTransfer && me && txn.sourceAccount?.userId === me.id;
  const isIncoming = isTransfer && !isOutgoing;
  const isDeposit = txn.type === TransactionType.DEPOSIT;

  const contact = isOutgoing ? txn.destinationAccount?.user : txn.sourceAccount?.user;
  const sourceBalance = txn.sourceAccount?.balance;
  const destBalance = txn.destinationAccount?.balance;
  const postBalance = isOutgoing ? sourceBalance : destBalance;

  const directionLabel = isOutgoing ? "Enviado" : isIncoming ? "Recibido" : "Depósito";
  const amountSign = isOutgoing ? "−" : "+";

  const amountColor = isOutgoing
    ? "text-[var(--color-on-surface)]"
    : "text-[var(--color-primary)]";

  const chipBg = isOutgoing
    ? "bg-[var(--color-error-fixed)] text-[var(--color-error)]"
    : "bg-[var(--color-success-bg)] text-[var(--color-success-text)]";

  const chipIcon = isOutgoing ? "north_east" : "south_west";

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(txn.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <AnimatePresence>
      {txn && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-[6px] z-50"
          />

          {/* Card modal */}
          <motion.div
            key="modal"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", damping: 28, stiffness: 320, mass: 0.85 }}
            className={cn(
              "fixed z-50 inset-x-0 mx-auto",
              "bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2",
              "w-full max-w-[440px]",
              "bg-[var(--color-surface-container-lowest)]",
              "rounded-t-[28px] sm:rounded-[28px]",
              "shadow-[0_24px_60px_rgba(0,0,0,0.18),0_4px_16px_rgba(0,0,0,0.06)]",
              "overflow-hidden",
              "max-h-[92dvh] flex flex-col",
              "pb-[env(safe-area-inset-bottom)]"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle (mobile only) */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-9 h-1 rounded-full bg-[var(--color-outline-variant)]/40" />
            </div>

            {/* Mini header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0 sm:pt-5">
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

              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  "bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)]",
                  "text-[var(--color-on-surface-variant)] transition-colors"
                )}
              >
                <Icon name="close" size={18} />
              </motion.button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-5 pb-5 space-y-3">
              {/* Amount hero */}
              <div className="text-center pt-4 pb-5">
                <p
                  className={cn(
                    "font-manrope font-extrabold leading-none tracking-tight",
                    "text-[clamp(40px,10vw,52px)]",
                    amountColor
                  )}
                >
                  {amountSign}
                  {formatCurrency(parseFloat(txn.amount))}
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
                status={normalizeStatus(txn.status)}
                type={txn.type}
              />

              {/* Metadata list */}
              <div
                className={cn(
                  "rounded-2xl border border-[var(--color-outline-variant)]/10",
                  "bg-[var(--color-surface-container-low)]",
                  "divide-y divide-[var(--color-outline-variant)]/10"
                )}
              >
                {/* Date row */}
                <div className="flex items-center justify-between px-4 py-3.5">
                  <p className="text-[11px] font-inter text-[var(--color-on-surface-variant)]/60">
                    Fecha
                  </p>
                  <p className="text-sm font-manrope font-bold text-[var(--color-on-surface)]">
                    {formatDate(txn.createdAt)}
                  </p>
                </div>

                {/* Post-balance row (transfers) */}
                {isTransfer && postBalance && (
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <p className="text-[11px] font-inter text-[var(--color-on-surface-variant)]/60">
                      {isOutgoing ? "Saldo tras envío" : "Saldo tras recepción"}
                    </p>
                    <p className="text-sm font-manrope font-bold text-[var(--color-on-surface)]">
                      {formatCurrency(parseFloat(postBalance))}
                    </p>
                  </div>
                )}

                {/* ID row */}
                <div className="flex items-center justify-between px-4 py-3.5">
                  <p className="text-[11px] font-inter text-[var(--color-on-surface-variant)]/60">
                    ID
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono text-[var(--color-on-surface-variant)]">
                      {txn.id.substring(0, 8)}…{txn.id.substring(txn.id.length - 6)}
                    </p>
                    <motion.button
                      onClick={handleCopyId}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 rounded-md hover:bg-[var(--color-surface-container)] transition-colors"
                    >
                      <Icon
                        name={copiedId ? "check_circle" : "content_copy"}
                        size={15}
                        className={copiedId
                          ? "text-[var(--color-success-text)]"
                          : "text-[var(--color-on-surface-variant)]/50"
                        }
                        filled={copiedId}
                      />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky footer */}
            <div
              className={cn(
                "flex-shrink-0 px-5 py-4 border-t border-[var(--color-outline-variant)]/10",
                "bg-[var(--color-surface-container-lowest)]"
              )}
            >
              <motion.button
                onClick={onClose}
                whileHover={{ opacity: 0.88 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full py-3.5 rounded-xl",
                  "bg-[var(--color-primary)] text-white",
                  "font-manrope font-bold text-[15px]",
                  "transition-opacity"
                )}
              >
                Cerrar
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
