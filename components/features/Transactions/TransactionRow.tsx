"use client";

import { motion } from "framer-motion";
import { Transaction, TransactionType } from "@/lib/types";
import { formatCurrency, formatRelativeDate, getInitials } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { getTransactionStatusConfig, mapToUiStatus } from "@/lib/transactionStatus";
import { cn } from "@/lib/utils";

export interface TransactionRowProps {
  txn: Transaction;
  currentUserId?: string;
  currentUserEmail?: string;
  onClick: () => void;
  isLast?: boolean;
  variant?: "compact" | "full";
  animationDelay?: number;
}

export function TransactionRow({
  txn,
  currentUserId,
  currentUserEmail,
  onClick,
  isLast = false,
  variant = "full",
  animationDelay = 0,
}: TransactionRowProps) {
  const isTransfer = txn.type === TransactionType.TRANSFER;
  const isDeposit  = txn.type === TransactionType.DEPOSIT;

  // Dual-check: userId OR email fallback (handles ID format mismatches between API and Auth0)
  const isOutgoing = isTransfer && !!(currentUserId || currentUserEmail) && (
    txn.sourceAccount?.userId === currentUserId ||
    (currentUserEmail && txn.sourceAccount?.user?.email === currentUserEmail)
  );

  const contact = isOutgoing ? txn.destinationAccount?.user : txn.sourceAccount?.user;

  const showInitialsAvatar = isTransfer && !!contact;

  const avatarBg = isOutgoing
    ? "bg-red-50 text-red-500"
    : "bg-emerald-50 text-emerald-600";

  const iconName = isDeposit ? "south_west" : isOutgoing ? "north_east" : "south_west";

  const label = isDeposit
    ? "Depósito SEPA"
    : isOutgoing
      ? (contact ? `${contact.name} ${contact.surname}` : "Transferencia enviada")
      : (contact ? `${contact.name} ${contact.surname}` : "Transferencia recibida");

  const amountSign  = isOutgoing ? "−" : "+";
  const amountColor = isOutgoing
    ? "text-[var(--color-on-surface)]"
    : "text-[var(--color-primary)]";

  const uiStatus  = mapToUiStatus(txn.type, txn.status, !!isOutgoing);
  const statusCfg = getTransactionStatusConfig(uiStatus, !!isOutgoing);

  if (variant === "compact") {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: animationDelay, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "w-full text-left flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
          "hover:bg-[rgba(0,62,199,0.05)]",
          !isLast && "border-b border-[var(--color-outline-variant)]/12"
        )}
      >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className={cn("w-10 h-10 rounded-[13px] flex items-center justify-center", avatarBg)}>
                {showInitialsAvatar
                  ? <span className="font-manrope font-extrabold text-[13px]">
                      {getInitials(contact!.name, contact!.surname)}
                    </span>
                  : <Icon name={iconName} size={18} />
                }
              </div>
              <span className={cn(
                "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white",
                statusCfg.dotOverlayClass
              )} />
            </div>

            {/* Label + date */}
            <div className="flex-1 min-w-0">
              <p className="font-manrope font-semibold text-[var(--color-on-surface)] text-[13px] leading-tight truncate">
                {label}
              </p>
              <p className="text-[11px] text-[var(--color-on-surface-variant)]/50 font-inter mt-0.5">
                {formatRelativeDate(txn.createdAt)}
              </p>
            </div>

            {/* Amount + status badge */}
            <div className="text-right flex-shrink-0">
              <p className={cn("font-manrope font-bold text-[13px] tabular leading-tight", amountColor)}>
                {amountSign}{formatCurrency(parseFloat(txn.amount))}
              </p>
              <div className="flex justify-end mt-1">
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-[3px] rounded-full",
                  "text-[10px] font-inter font-semibold uppercase tracking-[0.08em]",
                  statusCfg.badgeClass
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", statusCfg.dotClass)} />
                  {statusCfg.label}
                </span>
              </div>
            </div>
      </motion.button>
    );
  }

  // variant === "full"
  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center justify-between pl-4 pr-8 py-4 rounded-2xl bg-[var(--color-surface-container-low)]/30 hover:bg-[rgba(0,62,199,0.07)] transition-colors text-left mb-2 border-b border-[rgba(0,0,0,0.05)]"
      whileHover={{ x: 4 }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Avatar */}
        <div className={cn("w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0", avatarBg)}>
          {showInitialsAvatar
            ? <span className="font-manrope font-extrabold text-[13px]">
                {getInitials(contact!.name, contact!.surname)}
              </span>
            : <Icon name={iconName} size={20} />
          }
        </div>

        {/* Label + date */}
        <div className="min-w-0 flex-1">
          <p className="font-manrope font-bold text-[var(--color-on-surface)] text-sm truncate">
            {label}
          </p>
          <p className="text-xs text-[var(--color-on-surface-variant)]/70 font-inter">
            {formatRelativeDate(txn.createdAt)}
          </p>
        </div>
      </div>

      {/* Amount + status (incoming only) */}
      <div className="text-right flex-shrink-0">
        <p className={cn("font-manrope font-bold text-sm tabular", amountColor)}>
          {amountSign}{formatCurrency(parseFloat(txn.amount))}
        </p>
        {!isOutgoing && (
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className={cn(
              "inline-flex items-center gap-1 px-2 py-[3px] rounded-full",
              "text-[10px] font-inter font-semibold uppercase tracking-[0.08em]",
              statusCfg.badgeClass
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", statusCfg.dotClass)} />
              {statusCfg.label}
            </span>
          </div>
        )}
      </div>
    </motion.button>
  );
}
