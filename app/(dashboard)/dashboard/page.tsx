"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Send, Plus, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { useAuth } from "@/lib/hooks/useAuth";
import { CountUp } from "@/components/motion/CountUp";
import { StaggerChildren, MotionItem } from "@/components/motion/StaggerChildren";
import { SkeletonCard, SkeletonTransactionRow } from "@/components/motion/ShimmerSkeleton";
import { formatCurrency, formatDate, formatRelativeDate } from "@/lib/format";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useState } from "react";

export default function DashboardPage() {
  const { data: dashboardData, isLoading, isError } = useAccounts();
  const { data: transactionsData } = useTransactions();
  const { user } = useAuth();
  const [showPhase2Hype, setShowPhase2Hype] = useState(false);

  // Get user's name from Auth0 or fallback to "Usuario"
  const userName = user?.name ? user.name.split(" ")[0] : "Usuario";

  if (isError) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-brand-coral/10 border border-brand-coral text-brand-coral rounded-lg p-4 sm:p-6">
          <p>Error al cargar los datos. Por favor, intenta más tarde.</p>
        </div>
      </div>
    );
  }

  const totalBalance = dashboardData?.totalBalance ?? 0;
  const accounts = dashboardData?.accounts ?? [];
  const transactions = transactionsData?.pages?.[0]?.transactions ?? [];
  const lastTransactions = transactions.slice(0, 5);

  return (
    <div className="min-h-screen bg-brand-white pb-4">
      {/* Header with greeting */}
      <motion.header
        className="sticky top-0 z-40 bg-brand-white border-b border-brand-sand/20 backdrop-blur-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy font-heading">
            Buenos días, {userName}
          </h1>
          <p className="text-brand-sand/80 mt-1 text-xs sm:text-sm">
            Gestiona tus remesas de forma segura
          </p>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl mx-auto lg:max-w-4xl">
        {/* Balance Card */}
        {isLoading ? (
          <SkeletonCard />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 sm:mb-8"
          >
            <Card className="bg-gradient-to-br from-brand-navy to-brand-navy/80 border-0 text-brand-white shadow-xl">
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-xs sm:text-sm font-medium text-brand-sand/80 uppercase tracking-wide">
                  Saldo Total EUR
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 sm:pb-6">
                <div className="text-3xl sm:text-5xl font-bold font-heading mb-2">
                  <CountUp to={totalBalance} currency="EUR" />
                </div>
                <p className="text-brand-sand/80 text-xs sm:text-sm">
                  Disponible para transferencias y más
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Action Buttons */}
        <motion.div
          className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Link href="/deposit" className="w-full">
            <Button className="w-full h-12 sm:h-14 bg-brand-coral hover:bg-brand-coral/90 text-brand-white font-bold rounded-lg flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Depositar</span>
            </Button>
          </Link>
          <Link href="/send" className="w-full">
            <Button className="w-full h-12 sm:h-14 bg-brand-turquoise hover:bg-brand-turquoise/90 text-brand-navy font-bold rounded-lg flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Enviar</span>
            </Button>
          </Link>
        </motion.div>

        {/* Last Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-brand-navy font-heading">
              Últimos Movimientos
            </h2>
            {lastTransactions.length > 0 && (
              <Link href="/transactions" className="text-brand-coral text-xs sm:text-sm font-medium hover:underline">
                Ver todo
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <SkeletonTransactionRow />
              <SkeletonTransactionRow />
              <SkeletonTransactionRow />
            </div>
          ) : lastTransactions.length > 0 ? (
            <Card className="bg-brand-white border border-brand-sand/20">
              {lastTransactions.map((txn, idx) => (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + idx * 0.05 }}
                >
                  <Link href={`/transactions?detail=${txn.id}`}>
                    <div className="flex items-center justify-between p-3 sm:p-4 border-b border-brand-sand/10 last:border-b-0 hover:bg-brand-sand/5 transition-colors cursor-pointer">
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
                      <p
                        className={`font-bold text-xs sm:text-sm flex-shrink-0 ${
                          txn.type === "TRANSFER"
                            ? "text-brand-navy"
                            : "text-brand-turquoise"
                        }`}
                      >
                        {txn.type === "TRANSFER" ? "-" : "+"}
                        {formatCurrency(parseFloat(txn.amount))}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </Card>
          ) : (
            <Card className="text-center py-8 sm:py-12 bg-brand-sand/30 border-brand-sand/40">
              <p className="text-brand-navy/90 text-sm">
                Aún no tienes movimientos. ¡Haz tu primer envío!
              </p>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
}
