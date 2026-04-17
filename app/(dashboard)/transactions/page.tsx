"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { TransactionType } from "@/lib/api";
import { formatCurrency, formatDate, formatRelativeDate } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { StaggerChildren, MotionItem } from "@/components/motion/StaggerChildren";
import { SkeletonTransactionRow } from "@/components/motion/ShimmerSkeleton";
import { useSearchParams } from "next/navigation";

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  const [selectedTxn, setSelectedTxn] = useState<string | null>(searchParams.get("detail"));
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useTransactions({
    type: filterType,
  });

  const allTransactions = data?.pages.flatMap((p) => p.transactions) ?? [];

  // Filter transactions by selected type (frontend validation)
  const transactions = filterType === "all"
    ? allTransactions
    : allTransactions.filter(t => t.type === filterType);

  const detailTxn = selectedTxn ? allTransactions.find(t => t.id === selectedTxn) : null;

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-32">
      {/* TopAppBar */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center gap-4 px-6 bg-[rgba(248,249,250,0.7)] backdrop-blur-[48px]"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex-1 text-center">
          <p className="font-manrope font-bold text-lg text-[var(--color-on-surface)]">
            Historial
          </p>
        </div>
      </motion.header>

      <motion.div
        className="pt-24 px-6 py-6 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Tabs
          value={filterType}
          onValueChange={(val) => setFilterType(val as TransactionType | "all")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 bg-[var(--color-surface-container-low)]/50 border border-[var(--color-outline-variant)]/20 mb-6 rounded-xl">
            <TabsTrigger value="all" className="text-xs sm:text-sm data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-white">
              Todas
            </TabsTrigger>
            <TabsTrigger value={TransactionType.DEPOSIT} className="text-xs sm:text-sm data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-white">
              Depósitos
            </TabsTrigger>
            <TabsTrigger value={TransactionType.TRANSFER} className="text-xs sm:text-sm data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-white">
              Envíos
            </TabsTrigger>
          </TabsList>

          {Object.values({
            all: "all",
            deposit: TransactionType.DEPOSIT,
            transfer: TransactionType.TRANSFER,
          }).map((val) => (
            <TabsContent key={val} value={val}>
              {isLoading ? (
                <div className="space-y-2">
                  <SkeletonTransactionRow />
                  <SkeletonTransactionRow />
                  <SkeletonTransactionRow />
                </div>
              ) : transactions.length > 0 ? (
                <>
                  <StaggerChildren>
                    {transactions.map((txn) => (
                      <MotionItem key={txn.id}>
                        <motion.button
                          onClick={() => setSelectedTxn(txn.id)}
                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--color-surface-container-low)]/30 hover:bg-[var(--color-surface-container-low)] transition-colors text-left mb-2"
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 ${
                                txn.type === "TRANSFER"
                                  ? "bg-[var(--color-error)]/10"
                                  : "bg-[var(--color-success)]/10"
                              }`}
                            >
                              {txn.type === "TRANSFER" ? (
                                <Icon name="trending_flat" size={20} className="text-[var(--color-error)]" filled />
                              ) : (
                                <Icon name="trending_flat" size={20} className="text-[var(--color-success)]" />
                              )}
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
                              className={`font-manrope font-bold text-sm ${
                                txn.type === "TRANSFER"
                                  ? "text-[var(--color-error)]"
                                  : "text-[var(--color-success)]"
                              }`}
                            >
                              {txn.type === "TRANSFER" ? "-" : "+"}
                              {formatCurrency(parseFloat(txn.amount))}
                            </p>
                            <p className="text-xs text-[var(--color-on-surface-variant)]/60 font-inter flex items-center justify-end gap-1 mt-1">
                              {txn.status === "COMPLETED" ? (
                                <>
                                  <Icon name="check_circle" size={14} className="text-[var(--color-success)]" filled />
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

                  {hasNextPage && (
                    <motion.button
                      onClick={() => fetchNextPage()}
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
            </TabsContent>
          ))}
        </Tabs>

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
                className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-[var(--color-background)] z-50 overflow-y-auto shadow-xl"
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
                            <Icon name="check_circle" size={16} className="text-[var(--color-success)]" filled />
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
                          {detailTxn.type === "TRANSFER" ? "Beneficiario" : "Transferencia bancaria SEPA entrante"}
                        </p>
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
      </motion.div>
    </div>
  );
}
