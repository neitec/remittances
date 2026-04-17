"use client";

import { CountUp } from "@/components/motion/CountUp";
import { Icon } from "@/components/ui/Icon";

interface HeroBalanceCardProps {
  balanceEur: number;
  isLoading: boolean;
  equivalenceDop?: number;
}

export function HeroBalanceCard({
  balanceEur,
  isLoading,
  equivalenceDop,
}: HeroBalanceCardProps) {
  // Calculate DOP equivalent (using a fixed rate for demo, should come from API)
  const dopRate = 61.5; // 1 EUR = ~61.5 DOP
  const calculatedDop = equivalenceDop || balanceEur * dopRate;

  return (
    <div className="relative h-64 rounded-[2.5rem] overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-container)] to-[var(--color-primary-fixed)]" />

      {/* Decorative blobs */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full blur-3xl bg-white/10" />
      <div className="absolute bottom-5 right-5 w-40 h-40 rounded-full blur-3xl bg-white/10" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-8">
        {/* Top row: LIVE badge */}
        <div className="flex justify-between items-start">
          <div />
          {/* D5: LIVE badge with blue text and animated dot */}
          <div
            className="px-3 py-1 rounded-full text-xs font-bold uppercase text-[var(--color-primary)] flex items-center gap-1.5"
            style={{
              background: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
            LIVE
          </div>
        </div>

        {/* Balance section - D4: EUR inline with balance */}
        <div className="space-y-1">
          <p className="text-white/70 font-inter text-sm">SALDO DISPONIBLE</p>
          {isLoading ? (
            <div className="h-12 bg-white/20 rounded-lg animate-pulse" />
          ) : (
            <div className="flex items-baseline gap-2">
              <h2 className="text-white font-manrope font-extrabold text-5xl tracking-tighter">
                <CountUp from={0} to={balanceEur} />
              </h2>
              <span className="text-white font-manrope font-bold text-xl">EUR</span>
            </div>
          )}
        </div>

        {/* Equivalence section - D6: Money icons without emoji */}
        <div className="space-y-2">
          <p className="text-white/70 font-inter text-xs">EQUIVALENCIA EN PESOS</p>
          <div className="flex items-center justify-between">
            <div>
              {isLoading ? (
                <div className="h-8 bg-white/20 rounded-lg w-32 animate-pulse" />
              ) : (
                <p className="text-white font-inter font-medium text-lg">
                  {(calculatedDop).toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  DOP
                </p>
              )}
            </div>
            {/* D6: Currency icons with Material Symbols */}
            <div className="flex gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <Icon name="euro" size={18} filled />
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <Icon name="token" size={18} filled />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
