"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useTransactions } from "@/lib/hooks/queries/useTransactions";
import { useMe } from "@/lib/hooks/queries/useMe";
import { TransactionType } from "@/lib/api";
import { formatCurrency, formatRelativeDate } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { StaggerChildren, MotionItem } from "@/components/motion/StaggerChildren";
import { TransactionsSkeleton, SkeletonTransactionRow } from "@/components/motion/ShimmerSkeleton";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/nav/AppHeader";
import { TransactionDetailDrawer } from "@/components/features/TransactionDetailDrawer";
import { cn } from "@/lib/utils";

type FilterType = TransactionType | "all" | "withdrawal";

const FILTER_TABS: { label: string; value: FilterType; icon: string; disabled?: boolean }[] = [
  { label: "Todas",      value: "all",                   icon: "format_list_bulleted" },
  { label: "Depósitos",  value: TransactionType.DEPOSIT,  icon: "south_west" },
  { label: "Envíos",     value: TransactionType.TRANSFER, icon: "north_east" },
  { label: "Retiradas",  value: "withdrawal",             icon: "account_balance", disabled: true },
];

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const { data: me } = useMe();
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedTxn, setSelectedTxn] = useState<string | null>(searchParams.get("detail"));
  const [currentPage, setCurrentPage] = useState(0);
  const openedWithDetail = useRef(!!searchParams.get("detail"));
  const apiFilter = filterType === "all" || filterType === "withdrawal" ? "all" : filterType;
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useTransactions({
    type: apiFilter,
  });

  const allTransactions = data?.pages.flatMap((p) => p.transactions) ?? [];

  const transactions = filterType === "all" || filterType === "withdrawal"
    ? allTransactions
    : allTransactions.filter(t => t.type === filterType);

  // Pagination: 10 items per page
  const ITEMS_PER_PAGE = 10;
  const startIdx = currentPage * ITEMS_PER_PAGE;
  const paginatedTransactions = transactions.slice(0, startIdx + ITEMS_PER_PAGE);
  const hasMoreItems = transactions.length > startIdx + ITEMS_PER_PAGE;
  const shouldShowLoadMore = hasMoreItems || hasNextPage;

  const detailTxn = selectedTxn ? allTransactions.find(t => t.id === selectedTxn) : null;

  // Reset pagination when changing filter
  const handleFilterChange = (newFilter: FilterType) => {
    setFilterType(newFilter);
    setCurrentPage(0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <AppHeader />
        <TransactionsSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-32 lg:pb-0">
      {/* Header */}
      <AppHeader />

      <motion.div
        className="pt-[84px] px-5 py-6 lg:pl-12 lg:pr-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-[900px]">
        {/* ── Filter bar ── */}
        <div
          className="flex items-center gap-1 mb-7 p-1 rounded-[14px] w-fit"
          style={{
            background: "var(--color-surface-container-low)",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = filterType === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => !tab.disabled && handleFilterChange(tab.value)}
                disabled={tab.disabled}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-inter font-medium transition-all duration-150 select-none",
                  isActive
                    ? "text-white shadow-sm"
                    : tab.disabled
                    ? "text-[var(--color-on-surface-variant)]/30 cursor-not-allowed"
                    : "text-[var(--color-on-surface-variant)]/70 hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]"
                )}
                style={isActive ? {
                  background: "var(--color-primary)",
                  boxShadow: "0 2px 8px rgba(0,62,199,0.25)",
                } : {}}
              >
                <Icon
                  name={tab.icon}
                  size={14}
                  className={cn(
                    isActive ? "text-white" : tab.disabled ? "opacity-30" : "text-[var(--color-on-surface-variant)]/60"
                  )}
                />
                {tab.label}
                {tab.disabled && (
                  <span
                    className="text-[9px] font-inter font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full ml-0.5"
                    style={{
                      background: "var(--color-primary-fixed)",
                      color: "var(--color-primary)",
                      opacity: 0.7,
                    }}
                  >
                    Pronto
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Content ── */}
        <div>
          {filterType === "withdrawal" ? (
            <div className="py-16 text-center">
              <div
                className="w-14 h-14 rounded-[18px] mx-auto mb-4 flex items-center justify-center"
                style={{ background: "var(--color-surface-container-low)" }}
              >
                <Icon name="account_balance" size={24} className="text-[var(--color-on-surface-variant)]/40" />
              </div>
              <p className="font-manrope font-semibold text-[var(--color-on-surface)] text-[14px] mb-1">
                Retiradas disponibles próximamente
              </p>
              <p className="text-[13px] text-[var(--color-on-surface-variant)]/55 font-inter">
                Podrás retirar fondos a tu cuenta bancaria en pesos dominicanos.
              </p>
            </div>
          ) : (
            <div>
              {[filterType].map((val) => (
                <div key={val}>
              {isLoading ? (
                <div className="space-y-2">
                  <SkeletonTransactionRow />
                  <SkeletonTransactionRow />
                  <SkeletonTransactionRow />
                </div>
              ) : transactions.length > 0 ? (
                <>
                  <StaggerChildren skipAnimation={openedWithDetail.current}>
                    {paginatedTransactions.map((txn) => {
                      const isTransfer = txn.type === TransactionType.TRANSFER;
                      const isOutgoing = isTransfer && me && txn.sourceAccount?.userId === me.id;
                      const isIncoming = isTransfer && !isOutgoing;

                      const contact = isOutgoing
                        ? txn.destinationAccount?.user?.name
                        : isIncoming
                          ? txn.sourceAccount?.user?.name
                          : null;

                      const label = isOutgoing
                        ? contact
                          ? `Enviado a ${contact}`
                          : "Transferencia enviada"
                        : isIncoming
                          ? contact
                            ? `Recibido de ${contact}`
                            : "Transferencia recibida"
                          : "Depósito";

                      const iconName = isOutgoing ? "north_east" : "south_west";
                      const iconBg = isOutgoing
                        ? "bg-[var(--color-tertiary-fixed)] text-[var(--color-tertiary)]"
                        : "bg-emerald-50 text-emerald-600";

                      const amountSign = isOutgoing ? "−" : "+";
                      const amountColor = isOutgoing
                        ? "text-[var(--color-on-surface)]"
                        : "text-[var(--color-primary)]";

                      return (
                        <MotionItem key={txn.id}>
                          <motion.button
                            onClick={() => setSelectedTxn(txn.id)}
                            className="w-full flex items-center justify-between pl-4 pr-8 py-4 rounded-2xl bg-[var(--color-surface-container-low)]/30 hover:bg-[rgba(0,62,199,0.07)] transition-colors text-left mb-2 border-b border-[rgba(0,0,0,0.05)]"
                            whileHover={{ x: 4 }}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div
                                className={`flex items-center justify-center w-10 h-10 rounded-[13px] flex-shrink-0 ${iconBg}`}
                              >
                                <Icon name={iconName} size={20} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-manrope font-bold text-[var(--color-on-surface)] text-sm truncate">
                                  {label}
                                </p>
                                <p className="text-xs text-[var(--color-on-surface-variant)]/70 font-inter">
                                  {formatRelativeDate(txn.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p
                                className={`font-manrope font-bold text-sm tabular ${amountColor}`}
                              >
                                {amountSign}
                                {formatCurrency(parseFloat(txn.amount))}
                              </p>
                              <p className="text-xs text-[var(--color-on-surface-variant)]/60 font-inter flex items-center justify-end gap-1 mt-1">
                                {txn.status === "COMPLETED" ? (
                                  <>
                                    <Icon name="check_circle" size={14} className="text-[var(--color-success-text)]" filled />
                                  </>
                                ) : (
                                  <>
                                    <Icon name="schedule" size={14} className="text-[var(--color-warning)]" />
                                  </>
                                )}
                              </p>
                            </div>
                          </motion.button>
                        </MotionItem>
                      );
                    })}
                  </StaggerChildren>

                  {shouldShowLoadMore && (
                    <motion.button
                      onClick={() => {
                        if (hasMoreItems) {
                          setCurrentPage(currentPage + 1);
                        } else if (hasNextPage) {
                          fetchNextPage();
                        }
                      }}
                      disabled={isFetchingNextPage}
                      className="w-full mt-6 p-3 border border-[var(--color-outline-variant)]/20 rounded-xl text-[var(--color-on-surface)] font-manrope font-bold hover:bg-[var(--color-surface-container-low)] transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {isFetchingNextPage ? (
                        <>
                          <Icon name="hourglass_empty" size={18} className="animate-spin" />
                          Cargando...
                        </>
                      ) : (
                        "Cargar Más"
                      )}
                    </motion.button>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Icon name="inbox" size={48} className="text-[var(--color-on-surface-variant)]/30 mx-auto mb-3" />
                  <p className="text-[var(--color-on-surface-variant)]/70 text-sm font-inter">No hay transacciones</p>
                </div>
              )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transaction Detail Drawer */}
        <TransactionDetailDrawer transaction={detailTxn || null} onClose={() => setSelectedTxn(null)} />
        </div>
      </motion.div>
    </div>
  );
}
