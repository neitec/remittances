"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { TransactionType } from "@/lib/api";
import { formatCurrency, formatDate, formatRelativeDate } from "@/lib/format";
import { ArrowDownLeft, ArrowUpRight, Loader2, X, Calendar, CheckCircle2, Clock, FileText, User } from "lucide-react";
import { StaggerChildren, MotionItem } from "@/components/motion/StaggerChildren";
import { SkeletonTransactionRow } from "@/components/motion/ShimmerSkeleton";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  const [selectedTxn, setSelectedTxn] = useState<string | null>(searchParams.get("detail"));
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useTransactions({
    type: filterType,
  });

  const transactions = data?.pages.flatMap((p) => p.transactions) ?? [];
  const detailTxn = selectedTxn ? transactions.find(t => t.id === selectedTxn) : null;

  return (
    <div className="min-h-screen bg-brand-white pb-4">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-40 bg-brand-white border-b border-brand-sand/20 backdrop-blur-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy font-heading">
            Historial
          </h1>
          <p className="text-brand-sand/80 mt-1 text-xs sm:text-sm">
            Tus transacciones y movimientos
          </p>
        </div>
      </motion.header>

      <motion.div
        className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Tabs
          value={filterType}
          onValueChange={(val) => setFilterType(val as TransactionType | "all")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 bg-brand-sand/30 border border-brand-sand/20 mb-6">
            <TabsTrigger value="all" className="text-xs sm:text-sm data-[state=active]:bg-brand-turquoise">
              Todas
            </TabsTrigger>
            <TabsTrigger value={TransactionType.DEPOSIT} className="text-xs sm:text-sm data-[state=active]:bg-brand-turquoise">
              Depósitos
            </TabsTrigger>
            <TabsTrigger value={TransactionType.TRANSFER} className="text-xs sm:text-sm data-[state=active]:bg-brand-turquoise">
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
                          className="w-full flex items-center justify-between p-3 sm:p-4 border-b border-brand-sand/10 last:border-b-0 hover:bg-brand-sand/5 transition-colors text-left"
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div
                              className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0 ${
                                txn.type === "TRANSFER"
                                  ? "bg-brand-coral/20"
                                  : "bg-brand-turquoise/20"
                              }`}
                            >
                              {txn.type === "TRANSFER" ? (
                                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-brand-coral" />
                              ) : (
                                <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5 text-brand-turquoise" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-brand-navy text-xs sm:text-sm truncate">
                                {txn.type === "TRANSFER" ? "Transferencia" : txn.type === "DEPOSIT" ? "Depósito" : "Transacción"}
                              </p>
                              <p className="text-xs text-brand-sand/80">
                                {formatRelativeDate(txn.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p
                              className={`font-bold text-xs sm:text-sm ${
                                txn.type === "TRANSFER"
                                  ? "text-brand-navy"
                                  : "text-brand-turquoise"
                              }`}
                            >
                              {txn.type === "TRANSFER" ? "-" : "+"}
                              {formatCurrency(parseFloat(txn.amount))}
                            </p>
                            <p className="text-xs text-brand-sand/60">
                              {txn.status === "COMPLETED" ? "✓" : "⏳"}
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
                      className="w-full mt-6 p-3 border border-brand-sand/20 rounded-lg text-brand-navy font-semibold hover:bg-brand-sand/5 transition-colors disabled:opacity-50 text-xs sm:text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {isFetchingNextPage ? (
                        <>
                          <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
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
                  <p className="text-brand-sand/70 text-sm">No hay transacciones</p>
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
                className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-brand-white z-50 overflow-y-auto shadow-xl"
              >
                <div className="sticky top-0 bg-brand-white z-10 flex items-center justify-between p-4 sm:p-6 border-b border-brand-sand/20">
                  <h3 className="text-lg sm:text-xl font-bold text-brand-navy font-heading">
                    Detalles de la transacción
                  </h3>
                  <motion.button
                    onClick={() => setSelectedTxn(null)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-brand-sand/70 hover:text-brand-navy transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <div className="p-4 sm:p-6 space-y-4">
                  {/* Monto Principal */}
                  <div className="bg-brand-coral/12 border-2 border-brand-coral/30 rounded-lg p-5 text-center">
                    <p className="text-xs text-brand-sand/70 mb-2 font-medium">Cantidad</p>
                    <p className="text-3xl font-bold text-brand-coral">
                      {detailTxn.type === "TRANSFER" ? "-" : "+"}
                      {formatCurrency(parseFloat(detailTxn.amount))}
                    </p>
                    <p className="text-xs text-brand-navy mt-2 font-medium">
                      {detailTxn.type === "TRANSFER" ? "Enviado" : "Depositado"}
                    </p>
                  </div>

                  {/* Tipo & Estado */}
                  <div className="flex gap-3">
                    <div className="flex-1 bg-brand-sand/8 rounded-lg p-3 border border-brand-sand/20">
                      <p className="text-xs text-brand-sand/80 mb-1 font-semibold">Tipo</p>
                      <p className="font-bold text-brand-navy text-sm">
                        {detailTxn.type === "TRANSFER" ? "Transferencia" : "Depósito"}
                      </p>
                    </div>
                    <div className="flex-1 bg-brand-sand/8 rounded-lg p-3 border border-brand-sand/20">
                      <p className="text-xs text-brand-sand/80 mb-1 font-semibold">Estado</p>
                      <div className="flex items-center gap-1">
                        {detailTxn.status === "completed" ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-brand-coral" />
                            <p className="font-bold text-brand-navy text-sm">Completado</p>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 text-brand-gold" />
                            <p className="font-bold text-brand-navy text-sm">Pendiente</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contacto */}
                  <div className="bg-brand-sand/8 rounded-lg p-4 border border-brand-sand/20">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-coral/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-brand-coral" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-brand-sand/80 font-semibold mb-0.5">
                          {detailTxn.type === "TRANSFER" ? "Enviado a" : "Origen de"}
                        </p>
                        <p className="font-bold text-brand-navy truncate">
                          {detailTxn.type === "TRANSFER" ? "Beneficiario" : "Depósito"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fechas */}
                  <div className="space-y-3">
                    <div className="bg-brand-sand/8 rounded-lg p-3 border border-brand-sand/20 flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-brand-sand/80 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-brand-sand/80 font-semibold mb-0.5">Fecha de envío</p>
                        <p className="font-bold text-brand-navy text-sm">{formatDate(detailTxn.createdAt)}</p>
                      </div>
                    </div>
                    {detailTxn.status === "COMPLETED" && (
                      <div className="bg-brand-sand/8 rounded-lg p-3 border border-brand-sand/20 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-brand-coral flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-brand-sand/80 font-semibold mb-0.5">Estado</p>
                          <p className="font-bold text-brand-navy text-sm">Completado</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ID de Transacción */}
                  <div className="space-y-3">
                    <div className="bg-brand-sand/8 rounded-lg p-3 border border-brand-sand/20">
                      <div className="flex items-start gap-2 mb-2">
                        <FileText className="w-5 h-5 text-brand-sand/80 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-brand-sand/80 font-semibold">ID Transacción</p>
                      </div>
                      <p className="font-mono text-xs text-brand-navy break-all ml-7 bg-brand-white border border-brand-sand/15 p-2 rounded">
                        {detailTxn.id}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-brand-white border-t border-brand-sand/20 p-4 sm:p-6">
                  <Button
                    onClick={() => setSelectedTxn(null)}
                    className="w-full bg-brand-coral hover:bg-brand-coral/90 text-white font-bold py-3"
                  >
                    Cerrar
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
