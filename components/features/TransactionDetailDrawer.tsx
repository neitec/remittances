"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Transaction, TransactionType } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { useMe } from "@/lib/hooks/queries/useMe";
import { useState } from "react";

interface TransactionDetailDrawerProps {
  transaction: Transaction | null;
  onClose: () => void;
}

function getInitials(name?: string, surname?: string): string {
  if (!name || !surname) return "??";
  return `${name[0]}${surname[0]}`.toUpperCase();
}

export function TransactionDetailDrawer({
  transaction: txn,
  onClose,
}: TransactionDetailDrawerProps) {
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

  const directionLabel = isOutgoing
    ? "Enviado"
    : isIncoming
      ? "Recibido"
      : "Depósito";

  const directionColor = isOutgoing
    ? "bg-[var(--color-error-fixed)] text-[var(--color-error)]"
    : "bg-emerald-50 text-emerald-600";

  const amountSign = isOutgoing ? "−" : "+";
  const amountColor = isOutgoing
    ? "text-[var(--color-on-surface)]"
    : "text-[var(--color-primary)]";

  const statusLabel =
    txn.status === "COMPLETED"
      ? "Completado"
      : txn.status === "FAILED"
        ? "Fallido"
        : "En proceso";

  const statusIcon =
    txn.status === "COMPLETED"
      ? "check_circle"
      : txn.status === "FAILED"
        ? "cancel"
        : "schedule";

  const statusColor =
    txn.status === "COMPLETED"
      ? "text-[var(--color-success-text)]"
      : txn.status === "FAILED"
        ? "text-[var(--color-error)]"
        : "text-[var(--color-warning)]";

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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />

          {/* Modal - Drawer from right */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[calc(100%-3rem)] md:w-96 bg-[var(--color-background)] z-50 overflow-y-auto shadow-xl pb-safe"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[var(--color-background)] z-10 flex items-center justify-between p-6 border-b border-[var(--color-outline-variant)]/10">
              <h3 className="text-xl font-manrope font-bold text-[var(--color-on-surface)]">
                Detalles
              </h3>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors"
              >
                <Icon name="close" size={24} />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Direction badge + Amount */}
              <div
                className={`border rounded-2xl p-6 text-center ${
                  isOutgoing
                    ? "bg-[var(--color-error-fixed)] border-[var(--color-error)]/20"
                    : "bg-emerald-50 border-emerald-200/50"
                }`}
              >
                <div className="flex justify-center mb-3">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-inter font-bold uppercase tracking-widest ${directionColor}`}
                  >
                    {isOutgoing ? (
                      <Icon name="north_east" size={12} />
                    ) : isIncoming ? (
                      <Icon name="south_west" size={12} />
                    ) : (
                      <Icon name="south_west" size={12} />
                    )}
                    {directionLabel}
                  </span>
                </div>

                <p className={`text-4xl font-manrope font-extrabold ${amountColor}`}>
                  {amountSign}
                  {formatCurrency(parseFloat(txn.amount))}
                </p>

                {txn.reference && (
                  <p className="text-sm text-[var(--color-on-surface-variant)] italic mt-3 font-inter">
                    "{txn.reference}"
                  </p>
                )}
              </div>

              {/* Status + Date */}
              <div className="flex gap-3">
                <div className="flex-1 bg-[var(--color-surface-container-low)] rounded-2xl p-4 border border-[var(--color-outline-variant)]/10">
                  <p className="text-xs text-[var(--color-on-surface-variant)] mb-2 font-inter font-bold uppercase tracking-widest">
                    Estado
                  </p>
                  <div className="flex items-center gap-2">
                    <Icon
                      name={statusIcon}
                      size={18}
                      className={statusColor}
                      filled={statusIcon === "check_circle"}
                    />
                    <p className="font-manrope font-bold text-[var(--color-on-surface)] text-sm">
                      {statusLabel}
                    </p>
                  </div>
                </div>

                <div className="flex-1 bg-[var(--color-surface-container-low)] rounded-2xl p-4 border border-[var(--color-outline-variant)]/10">
                  <p className="text-xs text-[var(--color-on-surface-variant)] mb-2 font-inter font-bold uppercase tracking-widest">
                    Fecha
                  </p>
                  <p className="font-manrope font-bold text-[var(--color-on-surface)] text-sm">
                    {formatDate(txn.createdAt)}
                  </p>
                </div>
              </div>

              {/* Contact (for transfers only) */}
              {isTransfer && contact && (
                <div className="bg-[var(--color-surface-container-low)] rounded-2xl p-4 border border-[var(--color-outline-variant)]/10">
                  <p className="text-xs text-[var(--color-on-surface-variant)] mb-3 font-inter font-bold uppercase tracking-widest">
                    {isOutgoing ? "Para" : "De"}
                  </p>

                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center font-manrope font-bold text-[var(--color-primary)] text-sm">
                      {getInitials(contact.name, contact.surname)}
                    </div>

                    {/* Contact info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-manrope font-bold text-[var(--color-on-surface)] text-sm">
                        {contact.name} {contact.surname}
                      </p>

                      {contact.alias && (
                        <p className="text-xs text-[var(--color-primary)] font-inter font-semibold mt-0.5">
                          @{contact.alias}
                        </p>
                      )}

                      <div className="text-xs text-[var(--color-on-surface-variant)]/70 mt-1 space-y-0.5 font-inter">
                        <p>{contact.email}</p>
                        <p>{contact.phone}</p>
                      </div>

                      {contact.country && (
                        <p className="text-xs text-[var(--color-on-surface-variant)] mt-2 flex items-center gap-1.5">
                          <CountryFlag country={contact.country} className="w-[16px] h-[12px] rounded-[2px] ring-1 ring-black/5 flex-shrink-0" />
                          {contact.country}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Account Balances (for transfers only) */}
              {isTransfer && (
                <div className="space-y-2">
                  {isOutgoing && sourceBalance && (
                    <div className="bg-[var(--color-surface-container-low)] rounded-2xl p-4 border border-[var(--color-outline-variant)]/10">
                      <p className="text-xs text-[var(--color-on-surface-variant)] mb-1 font-inter font-bold uppercase tracking-widest">
                        Tu saldo tras envío
                      </p>
                      <p className="font-manrope font-bold text-[var(--color-on-surface)] text-sm">
                        {formatCurrency(parseFloat(sourceBalance))} {txn.currency}
                      </p>
                    </div>
                  )}

                  {isIncoming && destBalance && (
                    <div className="bg-[var(--color-surface-container-low)] rounded-2xl p-4 border border-[var(--color-outline-variant)]/10">
                      <p className="text-xs text-[var(--color-on-surface-variant)] mb-1 font-inter font-bold uppercase tracking-widest">
                        Tu saldo tras recepción
                      </p>
                      <p className="font-manrope font-bold text-[var(--color-on-surface)] text-sm">
                        {formatCurrency(parseFloat(destBalance))} {txn.currency}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Deposit External Account (for deposits) */}
              {isDeposit && txn.externalAccount && (
                <div className="bg-[var(--color-surface-container-low)] rounded-2xl p-4 border border-[var(--color-outline-variant)]/10">
                  <p className="text-xs text-[var(--color-on-surface-variant)] mb-3 font-inter font-bold uppercase tracking-widest">
                    Origen
                  </p>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-[var(--color-on-surface-variant)] font-inter mb-1">
                        Banco
                      </p>
                      <p className="font-manrope font-bold text-[var(--color-on-surface)] text-sm">
                        {txn.externalAccount.bankName}
                      </p>
                    </div>

                    {txn.externalAccount.accountNumber && (
                      <div>
                        <p className="text-xs text-[var(--color-on-surface-variant)] font-inter mb-1">
                          Cuenta
                        </p>
                        <p className="font-manrope font-bold text-[var(--color-on-surface)] text-sm font-mono text-xs">
                          {txn.externalAccount.accountNumber}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Transaction ID */}
              <div className="bg-[var(--color-surface-container-low)] rounded-2xl p-4 border border-[var(--color-outline-variant)]/10">
                <p className="text-xs text-[var(--color-on-surface-variant)] mb-2 font-inter font-bold uppercase tracking-widest">
                  ID Transacción
                </p>

                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-mono text-[var(--color-on-surface)] break-all">
                    {txn.id.substring(0, 12)}...{txn.id.substring(txn.id.length - 8)}
                  </p>

                  <motion.button
                    onClick={handleCopyId}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-[var(--color-surface-container)] transition-colors"
                  >
                    <Icon
                      name={copiedId ? "check_circle" : "content_copy"}
                      size={16}
                      className={
                        copiedId
                          ? "text-[var(--color-success-text)]"
                          : "text-[var(--color-on-surface-variant)]"
                      }
                      filled={copiedId}
                    />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-[var(--color-background)] border-t border-[var(--color-outline-variant)]/10 p-6">
              <button
                onClick={onClose}
                className="w-full px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-manrope font-bold transition-all hover:opacity-90"
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
