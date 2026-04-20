"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTransactions } from "@/lib/hooks/queries/useTransactions";
import { TransactionType } from "@/lib/api";
import { formatCurrency, formatDate, formatRelativeDate } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { StaggerChildren, MotionItem } from "@/components/motion/StaggerChildren";
import { TransactionsSkeleton, SkeletonTransactionRow } from "@/components/motion/ShimmerSkeleton";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/nav/AppHeader";
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
                    {paginatedTransactions.map((txn) => (
                      <MotionItem key={txn.id}>
                        <motion.button
                          onClick={() => setSelectedTxn(txn.id)}
                          className="w-full flex items-center justify-between pl-4 pr-8 py-4 rounded-2xl bg-[var(--color-surface-container-low)]/30 hover:bg-[rgba(0,62,199,0.07)] transition-colors text-left mb-2 border-b border-[rgba(0,0,0,0.05)]"
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className={`flex items-center justify-center w-10 h-10 rounded-[13px] flex-shrink-0 ${
                                txn.type === "TRANSFER"
                                  ? "bg-[var(--color-tertiary-fixed)] text-[var(--color-tertiary)]"
                                  : "bg-emerald-50 text-emerald-600"
                              }`}
                            >
                              <Icon
                                name={txn.type === "TRANSFER" ? "north_east" : "south_west"}
                                size={20}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-manrope font-bold text-[var(--color-on-surface)] text-sm truncate">
                                {txn.type === "TRANSFER" ? "Transferencia" : txn.type === "DEPOSIT" ? "Depósito" : "Transacción"}
                              </p>
                              <p className="text-xs text-[var(--color-on-surface-variant)]/70 font-inter">
                                {formatRelativeDate(txn.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p
                              className={`font-manrope font-bold text-sm tabular ${
                                txn.type === "TRANSFER"
                                  ? "text-[var(--color-on-surface)]"
                                  : "text-[var(--color-primary)]"
                              }`}
                            >
                              {txn.type === "TRANSFER" ? "−" : "+"}
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
                    ))}
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

        {/* Transaction Detail Modal */}
        <AnimatePresence>
          {detailTxn && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedTxn(null)}
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
                <div className="sticky top-0 bg-[var(--color-background)] z-10 flex items-center justify-between p-6 border-b border-[var(--color-outline-variant)]/10">
                  <h3 className="text-xl font-manrope font-bold text-[var(--color-on-surface)]">
                    Detalles
                  </h3>
                  <motion.button
                    onClick={() => setSelectedTxn(null)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors"
                  >
                    <Icon name="close" size={24} />
                  </motion.button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Monto Principal */}
                  <div className={`border rounded-2xl p-6 text-center ${
                    detailTxn.type === "TRANSFER"
                      ? "bg-[var(--color-error-fixed)] border-[var(--color-error)]/20"
                      : "bg-[var(--color-success-fixed)] border-[var(--color-success)]/20"
                  }`}>
                    <p className="text-xs text-[var(--color-on-surface-variant)] mb-2 font-inter font-bold uppercase tracking-widest">Cantidad</p>
                    <p className={`text-4xl font-manrope font-extrabold ${
                      detailTxn.type === "TRANSFER"
                        ? "text-[var(--color-error)]"
                        : "text-[var(--color-success)]"
                    }`}>
                      {detailTxn.type === "TRANSFER" ? "-" : "+"}
                      {formatCurrency(parseFloat(detailTxn.amount))}
                    </p>
                    <p className="text-xs text-[var(--color-on-surface)] mt-2 font-inter font-bold">
                      {detailTxn.type === "TRANSFER" ? "Enviado" : "Depositado"}
                    </p>
                  </div>

                  {/* Tipo & Estado */}
                  <div className="flex gap-3">
                    <div className="flex-1 bg-[var(--color-surface-container-low)] rounded-2xl p-4 border border-[var(--color-outline-variant)]/10">
                      <p className="text-xs text-[var(--color-on-surface-variant)] mb-1 font-inter font-bold uppercase tracking-widest">Tipo</p>
                      <p className="font-manrope font-bold text-[var(--color-on-surface)] text-sm">
                        {detailTxn.type === "TRANSFER" ? "Transferencia" : "Depósito"}
                      </p>
                    </div>
                    <div className="flex-1 bg-[var(--color-surface-container-low)] rounded-2xl p-4 border border-[var(--color-outline-variant)]/10">
                      <p className="text-xs text-[var(--color-on-surface-variant)] mb-1 font-inter font-bold uppercase tracking-widest">Estado</p>
                      <div className="flex items-center gap-1">
                        {detailTxn.status === "COMPLETED" ? (
                          <>
                            <Icon name="check_circle" size={16} className="text-[var(--color-success-text)]" filled />
                            <p className="font-manrope font-bold text-[var(--color-on-surface)] text-sm">Completado</p>
                          </>
                        ) : (
                          <>
                            <Icon name="schedule" size={16} className="text-[var(--color-warning)]" />
                            <p className="font-manrope font-bold text-[var(--color-on-surface)] text-sm">Pendiente</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contacto */}
                  <div className="bg-[var(--color-surface-container-low)] rounded-2xl p-4 border border-[var(--color-outline-variant)]/10">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                        <Icon name="person" size={20} className="text-[var(--color-primary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[var(--color-on-surface-variant)] font-inter font-bold uppercase tracking-widest mb-0.5">
                          {detailTxn.type === "TRANSFER" ? "Enviado a" : "Origen de"}
                        </p>
                        <p className="font-manrope font-bold text-[var(--color-on-surface)] truncate">
                          {detailTxn.type === "TRANSFER"
                            ? "Transferencia enviada"
                            : (detailTxn.externalAccount?.bankName ?? "Depósito SEPA")}
                        </p>
                        {detailTxn.type === "DEPOSIT" && detailTxn.externalAccount?.accountNumber && (
                          <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5 truncate">
                            {detailTxn.externalAccount.accountNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fechas */}
                  <div className="space-y-3">
                    <div className="bg-[var(--color-surface-container-low)] rounded-2xl p-4 border border-[var(--color-outline-variant)]/10 flex items-start gap-3">
                      <Icon name="calendar_today" size={20} className="text-[var(--color-on-surface-variant)] flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[var(--color-on-surface-variant)] font-inter font-bold uppercase tracking-widest mb-0.5">Fecha de envío</p>
                        <p className="font-manrope font-bold text-[var(--color-on-surface)] text-sm">{formatDate(detailTxn.createdAt)}</p>
                      </div>
                    </div>
                    {detailTxn.status === "COMPLETED" && (
                      <div className="bg-[var(--color-surface-container-low)] rounded-2xl p-4 border border-[var(--color-outline-variant)]/10 flex items-start gap-3">
                        <Icon name="check_circle" size={20} className="text-[var(--color-success)] flex-shrink-0 mt-0.5" filled />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[var(--color-on-surface-variant)] font-inter font-bold uppercase tracking-widest mb-0.5">Estado</p>
                          <p className="font-manrope font-bold text-[var(--color-on-surface)] text-sm">Completado</p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                <div className="sticky bottom-0 bg-[var(--color-background)] border-t border-[var(--color-outline-variant)]/10 p-6">
                  <button
                    onClick={() => setSelectedTxn(null)}
                    className="w-full px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-manrope font-bold transition-all hover:opacity-90"
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
