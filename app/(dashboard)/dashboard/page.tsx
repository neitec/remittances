"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { useAuth } from "@/lib/hooks/useAuth";
import { SkeletonCard, SkeletonTransactionRow } from "@/components/motion/ShimmerSkeleton";
import { formatCurrency, formatRelativeDate } from "@/lib/format";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { HeroBalanceCard } from "@/components/features/Dashboard/HeroBalanceCard";
import { Icon } from "@/components/ui/Icon";

export default function DashboardPage() {
  const { data: dashboardData, isLoading, isError } = useAccounts();
  const { data: transactionsData } = useTransactions();
  const { user } = useAuth();

  const userName = user?.name ? user.name.split(" ")[0] : "Usuario";
  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  if (isError) {
    return (
      <div className="pt-24 px-6">
        <div className="bg-[var(--color-error)]/10 border border-[var(--color-error)] text-[var(--color-error)] rounded-2xl p-6">
          <p className="font-inter">Error al cargar los datos. Por favor, intenta más tarde.</p>
        </div>
      </div>
    );
  }

  const totalBalance = dashboardData?.totalBalance ?? 0;
  const transactions = transactionsData?.pages?.[0]?.transactions ?? [];
  const lastTransactions = transactions.slice(0, 5);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* G1: Dashboard Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 lg:left-64 z-40 h-16 flex items-center justify-between px-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          background: "rgba(248, 249, 250, 0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Left: Avatar + Greeting */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] border-2 border-[#0052FF] flex items-center justify-center text-white font-manrope font-bold text-sm">
            {initials}
          </div>
          <div>
            <p className="text-sm font-manrope font-bold text-[var(--color-on-surface)]">
              Hola, {userName}
            </p>
            <p className="text-xs font-inter font-bold uppercase text-[var(--color-primary)] tracking-widest">
              MEMBER
            </p>
          </div>
        </div>

        {/* Center: Logo (absolute centered) */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <p className="font-manrope font-extrabold text-xl text-[var(--color-on-surface)]">
            Remita
          </p>
        </div>

        {/* Right: QR Icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--color-primary-fixed)" }}>
          <Icon
            name="qr_code_2"
            size={20}
            className="text-[var(--color-on-surface)]"
          />
        </div>
      </motion.header>

      {/* Main content */}
      <main className="px-6 pt-24 pb-32 space-y-6 max-w-2xl mx-auto">
        {/* Hero Balance Card */}
        {isLoading ? (
          <SkeletonCard />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <HeroBalanceCard balanceEur={totalBalance} isLoading={isLoading} />
          </motion.div>
        )}

        {/* D1: Movimientos Section with Slider Visuals */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-3"
        >
          <h2 className="font-inter font-bold text-[11px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
            MOVIMIENTOS
          </h2>

          {/* DEPOSITA - Thumb on left */}
          <Link href="/deposit">
            <div className="h-16 bg-[var(--color-surface-container-low)] rounded-3xl flex items-center px-4 cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden group">
              {/* Thumb on left */}
              <div className="absolute left-2 w-14 h-14 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow">
                <Icon name="trending_flat" size={20} className="text-white" />
              </div>
              {/* Label centered */}
              <div className="flex-1 text-center">
                <p className="text-sm font-inter font-bold uppercase tracking-[0.1em]" style={{ color: "#70747C" }}>
                  DEPOSITA
                </p>
              </div>
            </div>
          </Link>

          {/* TRANSFIERE - Thumb on right */}
          <Link href="/send">
            <div className="h-16 bg-[var(--color-surface-container-low)] rounded-3xl flex items-center px-4 cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden group">
              {/* Glow on right */}
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-[var(--color-primary)]/10 rounded-l-3xl" />
              {/* Label centered */}
              <div className="flex-1 text-center">
                <p className="text-sm font-inter font-bold uppercase tracking-[0.1em]" style={{ color: "#70747C" }}>
                  TRANSFIERE
                </p>
              </div>
              {/* Thumb on right */}
              <div className="absolute right-2 w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[var(--color-primary)] shadow-lg group-hover:shadow-xl transition-shadow border border-[var(--color-surface-container-highest)]">
                <Icon name="trending_flat" size={20} className="text-[var(--color-primary)] rotate-180" />
              </div>
            </div>
          </Link>

          {/* RETIRA - Disabled */}
          <div className="h-16 border-2 border-[var(--color-primary)]/20 bg-[var(--color-surface-container-low)]/50 rounded-3xl flex items-center justify-between px-4 opacity-60 pointer-events-none">
            <p className="text-sm font-inter font-bold uppercase tracking-[0.1em]" style={{ color: "#70747C" }}>
              RETIRA
            </p>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase" style={{ background: "var(--color-primary-fixed)", color: "var(--color-primary)" }}>
              PRÓXIMAMENTE
            </span>
          </div>
        </motion.section>

        {/* D2 + D3: Actividad Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="font-inter font-bold text-[11px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
            ACTIVIDAD
          </h2>

          {isLoading ? (
            <div className="space-y-2">
              <SkeletonTransactionRow />
              <SkeletonTransactionRow />
              <SkeletonTransactionRow />
            </div>
          ) : lastTransactions.length > 0 ? (
            <div className="space-y-1">
              {lastTransactions.map((txn, idx) => (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + idx * 0.05 }}
                >
                  <Link href={`/transactions?detail=${txn.id}`}>
                    <div
                      className="p-4 rounded-[2rem] bg-[var(--color-surface-container-low)]/50 hover:bg-[var(--color-surface-container-low)] transition-colors cursor-pointer active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* D2: Avatar con icono person en primary */}
                          <div className="flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0 bg-white shadow-sm">
                            <Icon
                              name="person"
                              size={24}
                              className="text-[var(--color-primary)]"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            {/* D2: Font manrope bold */}
                            <p className="font-manrope font-bold text-[var(--color-on-surface)] text-sm truncate">
                              {txn.type === "TRANSFER"
                                ? "Transferencia"
                                : txn.type === "DEPOSIT"
                                ? "Depósito"
                                : "Transacción"}
                            </p>
                            <p className="text-xs text-[var(--color-on-surface-variant)]/70 font-inter">
                              {formatRelativeDate(txn.createdAt)}
                            </p>
                          </div>
                        </div>
                        {/* D2: Monto en manrope font bold */}
                        <p className="font-manrope font-bold text-sm flex-shrink-0 text-[var(--color-on-surface)]">
                          {txn.type === "TRANSFER" ? "-" : "+"}
                          {formatCurrency(parseFloat(txn.amount))}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-8 rounded-[2rem] p-6"
              style={{
                background: "var(--color-surface-container-low)",
              }}
            >
              <p className="text-[var(--color-on-surface)]/90 text-sm font-inter">
                Aún no tienes movimientos. ¡Haz tu primer envío!
              </p>
            </div>
          )}
        </motion.section>

        {/* D3: Mis Cuentas Card - Tertiary (Naranja) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link href="/accounts">
            <div
              className="p-5 rounded-[2rem] bg-[var(--color-surface-container-low)] flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-all hover:bg-[var(--color-surface-container)]"
            >
              <div className="flex items-center gap-4 flex-1">
                {/* D3: Tertiary color icons (naranja) */}
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-tertiary-fixed)] flex items-center justify-center flex-shrink-0">
                  <Icon
                    name="account_balance"
                    size={24}
                    className="text-[var(--color-tertiary)]"
                  />
                </div>
                <div>
                  <h3 className="font-manrope font-bold text-[var(--color-on-surface)]">
                    Mis Cuentas
                  </h3>
                  <p className="text-xs text-[var(--color-on-surface-variant)]/70 font-inter">
                    IBAN & Alias configurados
                  </p>
                </div>
              </div>
              <Icon
                name="chevron_right"
                size={24}
                className="text-[var(--color-on-surface-variant)] group-hover:translate-x-1 transition-transform"
              />
            </div>
          </Link>
        </motion.section>
      </main>
    </div>
  );
}
