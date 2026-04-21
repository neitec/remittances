"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAccounts } from "@/lib/hooks/queries/useAccounts";
import { useMe } from "@/lib/hooks/queries/useMe";
import { DashboardSkeleton, SkeletonTransactionRow } from "@/components/motion/ShimmerSkeleton";
import { formatRelativeDate } from "@/lib/format";
import { useTransactions } from "@/lib/hooks/queries/useTransactions";
import { HeroBalanceCard } from "@/components/features/Dashboard/HeroBalanceCard";
import { AppHeader } from "@/components/nav/AppHeader";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.48, delay },
});

export default function DashboardPage() {
  const { data: dashboardData, isLoading } = useAccounts();
  const { data: transactionsData } = useTransactions();
  const { data: me } = useMe();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <AppHeader />
        <DashboardSkeleton />
      </div>
    );
  }

  const totalBalance = dashboardData?.totalBalance ?? 0;
  const allTransactions = transactionsData?.pages?.flatMap((p) => p.transactions) ?? [];
  // Sort by most recent first and get last 5
  const lastTransactions = allTransactions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">

      {/* ── Header ── */}
      <AppHeader />

      {/* ── Main content ── */}
      <main className="pt-[84px] pb-6 px-5 lg:pl-12 lg:pr-10">
        <div className="max-w-[1088px]">

        {/* Hero Balance Card — full width */}
        <motion.div {...fadeUp(0)} className="mb-7">
          <HeroBalanceCard balanceEur={totalBalance} isLoading={false} />
        </motion.div>

        {/*
          Desktop grid: left col (operations + accounts) | right col (activity)
          Mobile: single column stack
        */}
        <div className="flex flex-col gap-5 xl:grid xl:grid-cols-2 xl:gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-4">

            {/* Operaciones */}
            <motion.section {...fadeUp(0.08)}>
              <h2 className="font-inter font-semibold text-[10px] uppercase tracking-[0.22em] text-[var(--color-on-surface-variant)]/60 px-1 mb-3">
                Operaciones
              </h2>

              <div className="flex flex-col gap-[16px]">

                {/* DEPOSITAR — incoming funds */}
                <Link href="/deposit">
                  <motion.div
                    className="relative overflow-hidden rounded-[22px] cursor-pointer group"
                    style={{
                      background: "linear-gradient(135deg, rgba(5,150,105,0.07) 0%, rgba(16,185,129,0.03) 100%)",
                      border: "1px solid rgba(5,150,105,0.18)",
                    }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* RIGHT-TO-LEFT shimmer — suggests money arriving inward */}
                    <div className="absolute inset-0 translate-x-full group-hover:-translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-l from-transparent via-white/[0.08] to-transparent pointer-events-none" />
                    <div className="relative flex items-center gap-4 px-5 py-[13px]">
                      {/* Icon: pulses and nudges DOWN on hover (incoming, south_west direction) */}
                      <div className="relative flex-shrink-0">
                        <span className="absolute inset-0 rounded-full scale-100 opacity-0 group-hover:scale-[1.45] group-hover:opacity-100 transition-all duration-500 ease-out" style={{ background: "rgba(5,150,105,0.14)" }} />
                        <div
                          className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-[1.06] group-hover:translate-y-[2px]"
                          style={{ background: "#059669", boxShadow: "0 4px 14px rgba(5,150,105,0.30)" }}
                        >
                          <Icon name="south_west" size={22} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-manrope font-bold text-[15px] text-[var(--color-on-surface)] leading-tight">Deposita</p>
                        <p className="text-[12px] font-inter mt-0.5" style={{ color: "rgba(5,150,105,0.65)" }}>Fondos vía SEPA</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>

                {/* TRANSFIERE — outgoing funds */}
                <Link href="/send">
                  <motion.div
                    className="relative overflow-hidden rounded-[22px] cursor-pointer group"
                    style={{
                      background: "linear-gradient(135deg, rgba(188,72,0,0.07) 0%, rgba(188,72,0,0.03) 100%)",
                      border: "1px solid rgba(188,72,0,0.16)",
                    }}
                    initial="rest"
                    whileHover="hover"
                    whileTap={{ scale: 0.99 }}
                    variants={{ rest: { y: 0 }, hover: { y: -2 } }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* LEFT-TO-RIGHT shimmer */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none" />
                    {/* Atmospheric hover field — same cohesive logic as transfer card */}
                    <motion.div
                      variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 pointer-events-none overflow-hidden rounded-[22px]"
                    >
                      <div className="absolute inset-0" style={{ background: "linear-gradient(130deg, rgba(188,72,0,0.06) 0%, rgba(200,80,10,0.03) 50%, rgba(188,72,0,0.05) 100%)" }} />
                      <motion.div
                        animate={{ x: [0, 10, -5, 0], y: [0, -7, 9, 0] }}
                        transition={{ duration: 8, repeat: Infinity }}
                        className="absolute -top-16 -left-8 w-[320px] h-[220px] rounded-full"
                        style={{ background: "radial-gradient(ellipse at 38% 38%, rgba(188,72,0,0.12) 0%, rgba(188,72,0,0.04) 45%, transparent 70%)" }}
                      />
                      <motion.div
                        animate={{ x: [0, -10, 8, 0], y: [0, 9, -6, 0] }}
                        transition={{ duration: 10, repeat: Infinity, delay: 1.5 }}
                        className="absolute -bottom-16 -right-8 w-[300px] h-[200px] rounded-full"
                        style={{ background: "radial-gradient(ellipse at 62% 62%, rgba(188,72,0,0.11) 0%, rgba(200,60,0,0.04) 45%, transparent 70%)" }}
                      />
                    </motion.div>
                    <div className="relative flex items-center gap-4 px-5 py-[13px]">
                      <div className="relative flex-shrink-0">
                        <span className="absolute inset-0 rounded-full scale-100 opacity-0 group-hover:scale-[1.45] group-hover:opacity-100 transition-all duration-500 ease-out" style={{ background: "rgba(188,72,0,0.12)" }} />
                        <div
                          className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-[1.06] group-hover:-translate-y-[2px] group-hover:translate-x-[1px]"
                          style={{ background: "#bc4800", boxShadow: "0 4px 14px rgba(188,72,0,0.28)" }}
                        >
                          <Icon name="north_east" size={22} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-manrope font-bold text-[15px] text-[var(--color-on-surface)] leading-tight">Transfiere</p>
                        <p className="text-[12px] font-inter mt-0.5" style={{ color: "rgba(188,72,0,0.55)" }}>A otro usuario o retira a una cuenta bancaria</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>

                {/* RETIRAR — disabled */}
                <div
                  className="relative overflow-hidden rounded-[22px] opacity-38 pointer-events-none select-none"
                  style={{
                    background: "rgba(0,0,0,0.018)",
                    border: "1.5px dashed rgba(0,0,0,0.10)",
                  }}
                >
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-outline-variant)]/25 flex items-center justify-center flex-shrink-0">
                      <Icon name="lock" size={20} className="text-[var(--color-on-surface-variant)]/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-manrope font-bold text-[15px] text-[var(--color-on-surface)] leading-tight">Retirar</p>
                      <p className="text-[12px] font-inter text-[var(--color-on-surface-variant)]/45 mt-0.5">Disponible próximamente</p>
                    </div>
                    <span
                      className="text-[10px] font-inter font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ background: "var(--color-primary-fixed)", color: "var(--color-primary)" }}
                    >
                      Próximamente
                    </span>
                  </div>
                </div>

              </div>
            </motion.section>

            {/* Mis Cuentas */}
            <motion.section {...fadeUp(0.14)}>
              <Link href="/accounts">
                <div
                  className="flex items-center gap-4 p-4 rounded-[1.6rem] card-lift cursor-pointer group"
                  style={{
                    background: "var(--color-surface-container-lowest)",
                    border: "1px solid rgba(0,0,0,0.05)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--color-primary-fixed)" }}
                  >
                    <Icon
                      name="account_balance"
                      size={22}
                      className="text-[var(--color-primary)]"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-manrope font-bold text-[var(--color-on-surface)] text-[14px]">
                      Mis Cuentas
                    </p>
                    <p className="text-[12px] text-[var(--color-on-surface-variant)]/55 font-inter mt-0.5">
                      IBAN y alias configurados
                    </p>
                  </div>
                  <Icon
                    name="chevron_right"
                    size={18}
                    className="text-[var(--color-on-surface-variant)]/30 group-hover:text-[var(--color-on-surface-variant)]/60 group-hover:translate-x-0.5 transition-all"
                  />
                </div>
              </Link>
            </motion.section>
          </div>

          {/* ── RIGHT COLUMN: Actividad reciente ── */}
          <motion.section {...fadeUp(0.11)} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-inter font-semibold text-[10px] uppercase tracking-[0.22em] text-[var(--color-on-surface-variant)]/60">
                Actividad reciente
              </h2>
              <Link
                href="/transactions"
                className="text-[12px] font-inter font-semibold text-[var(--color-primary)] hover:opacity-70 transition-opacity"
              >
                Ver todo →
              </Link>
            </div>

            {/* Transactions container */}
            <div
              className="rounded-[1.6rem] overflow-hidden"
              style={{
                background: "var(--color-surface-container-lowest)",
                border: "1px solid rgba(0,0,0,0.05)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
              }}
            >
              {isLoading ? (
                <div className="divide-y divide-[var(--color-outline-variant)]/15">
                  <div className="p-4"><SkeletonTransactionRow /></div>
                  <div className="p-4"><SkeletonTransactionRow /></div>
                  <div className="p-4"><SkeletonTransactionRow /></div>
                </div>
              ) : lastTransactions.length > 0 ? (
                <div>
                  {lastTransactions.map((txn, idx) => {
                    const isDeposit = txn.type === "DEPOSIT";
                    const isTransfer = txn.type === "TRANSFER";
                    const isOutgoing = isTransfer && me && txn.sourceAccount?.userId === me.id;
                    const isCompleted = txn.status === "COMPLETED";

                    const iconName = isOutgoing ? "north_east" : "south_west";
                    const iconBg = isOutgoing
                      ? "bg-[var(--color-tertiary-fixed)] text-[var(--color-tertiary)]"
                      : "bg-emerald-50 text-emerald-600";

                    const amountSign = isOutgoing ? "−" : "+";
                    const amountColor = isOutgoing
                      ? "text-[var(--color-on-surface)]"
                      : "text-[var(--color-primary)]";

                    return (
                      <motion.div
                        key={txn.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.38,
                          delay: 0.22 + idx * 0.055,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        <Link href={`/transactions?detail=${txn.id}`}>
                          <div
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                              "hover:bg-[rgba(0,62,199,0.05)]",
                              idx < lastTransactions.length - 1 &&
                                "border-b border-[var(--color-outline-variant)]/12"
                            )}
                          >
                            {/* Type icon with status badge */}
                            <div className="relative flex-shrink-0">
                              <div className={cn("w-10 h-10 rounded-[13px] flex items-center justify-center", iconBg)}>
                                <Icon name={iconName} size={18} />
                              </div>
                              <span
                                className={cn(
                                  "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full",
                                  "border-2 border-white",
                                  isCompleted ? "bg-emerald-400" : "bg-amber-400"
                                )}
                              />
                            </div>

                            {/* Label + date */}
                            <div className="flex-1 min-w-0">
                              <p className="font-manrope font-semibold text-[var(--color-on-surface)] text-[13px] leading-tight">
                                {isDeposit
                                  ? "Depósito SEPA"
                                  : isOutgoing
                                    ? "Transferencia enviada"
                                    : "Transferencia recibida"}
                              </p>
                              <p className="text-[11px] text-[var(--color-on-surface-variant)]/50 font-inter mt-0.5">
                                {formatRelativeDate(txn.createdAt)}
                              </p>
                            </div>

                            {/* Amount + status */}
                            <div className="text-right flex-shrink-0">
                              <p
                                className={cn(
                                  "font-manrope font-bold text-[13px] tabular leading-tight",
                                  amountColor
                                )}
                              >
                                {amountSign}
                                {parseFloat(txn.amount).toLocaleString("de-DE", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}{" "}€
                              </p>
                              <div className="flex justify-end mt-1">
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-inter font-semibold uppercase tracking-[0.08em]",
                                    isCompleted
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "bg-amber-50 text-amber-500"
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                      isCompleted ? "bg-emerald-500" : "bg-amber-400"
                                    )}
                                  />
                                  {isCompleted ? "Completado" : "Pendiente"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 px-6 text-center">
                  <div
                    className="w-14 h-14 rounded-[18px] mx-auto mb-4 flex items-center justify-center"
                    style={{ background: "var(--color-surface-container-low)" }}
                  >
                    <Icon
                      name="receipt_long"
                      size={24}
                      className="text-[var(--color-on-surface-variant)]/40"
                    />
                  </div>
                  <p className="font-manrope font-semibold text-[var(--color-on-surface)] text-[14px] mb-1">
                    Sin movimientos aún
                  </p>
                  <p className="text-[13px] text-[var(--color-on-surface-variant)]/55 font-inter">
                    Haz tu primer envío para empezar.
                  </p>
                </div>
              )}
            </div>
          </motion.section>

        </div>
        </div>
      </main>
    </div>
  );
}
