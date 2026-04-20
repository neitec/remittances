"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";

interface DepositAmountSelectorProps {
  selectedAmount: string;
  onSelectAmount: (amount: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

const RECOMMENDED_AMOUNTS = [
  { label: "€250", value: "250" },
  { label: "€500", value: "500" },
  { label: "€1.000", value: "1000" },
  { label: "€2.500", value: "2500" },
];

export function DepositAmountSelector({
  selectedAmount,
  onSelectAmount,
  onBack,
  onContinue,
}: DepositAmountSelectorProps) {
  const [customAmount, setCustomAmount] = useState(selectedAmount || "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28 }}
      className="space-y-5 pb-6"
    >
      {/* Header */}
      <div className="space-y-1 pt-4">
        <h1 className="font-inter font-medium text-[20px] text-[var(--color-on-surface-variant)] leading-tight">
          ¿Cuánto quieres depositar?
        </h1>
        <p className="text-[13px] font-inter text-[var(--color-on-surface-variant)]/50">
          Selecciona una cantidad recomendada o ingresa una cantidad personalizada
        </p>
      </div>

      {/* Recommended Amounts */}
      <div className="grid grid-cols-2 gap-3">
        {RECOMMENDED_AMOUNTS.map((amount) => (
          <motion.button
            key={amount.value}
            onClick={() => {
              onSelectAmount(amount.value);
              setCustomAmount(amount.value);
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative rounded-[18px] p-4 transition-all duration-200 border-2 font-inter font-semibold text-[14px] ${
              selectedAmount === amount.value
                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                : "border-[var(--color-on-surface-variant)]/20 bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface-variant)]"
            }`}
          >
            {selectedAmount === amount.value && (
              <motion.div
                layoutId="activeAmount"
                className="absolute inset-0 rounded-[18px] border-2 border-[var(--color-primary)]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative">{amount.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Custom Amount Input */}
      <div className="space-y-2">
        <label className="text-[11px] font-inter font-semibold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]/40 block px-1">
          Cantidad personalizada (EUR)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] font-semibold text-[var(--color-on-surface-variant)]/50">
            €
          </span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0,00"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              onSelectAmount(e.target.value);
            }}
            className="w-full rounded-[16px] pl-10 pr-4 py-3.5 border border-[var(--color-on-surface-variant)]/20 bg-[var(--color-surface-container-lowest)] text-[16px] font-inter font-medium text-[var(--color-on-surface)] placeholder-[var(--color-on-surface-variant)]/40 transition-all focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </div>
      </div>

      {/* Info Box */}
      <div
        className="rounded-[16px] p-4 space-y-2"
        style={{
          background: "rgba(0, 62, 199, 0.05)",
          border: "1px solid rgba(0, 62, 199, 0.12)",
        }}
      >
        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-[8px] flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(0, 62, 199, 0.15)" }}>
            <Icon name="info" size={12} className="text-[var(--color-primary)]" />
          </div>
          <p className="text-[12px] font-inter text-[var(--color-on-surface-variant)]/70 leading-relaxed">
            El monto es opcional y solo se usa para simular el depósito en entorno de desarrollo.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 rounded-[16px] py-3.5 font-inter font-semibold text-[14px] transition-all border border-[var(--color-on-surface-variant)]/20 bg-transparent text-[var(--color-on-surface-variant)] hover:bg-[var(--color-on-surface-variant)]/5 active:scale-[0.98]"
        >
          Volver
        </button>
        <button
          onClick={onContinue}
          className="flex-1 rounded-[16px] py-3.5 font-inter font-semibold text-[14px] transition-all bg-[var(--color-primary)] text-white hover:shadow-lg hover:shadow-[var(--color-primary)]/30 active:scale-[0.98]"
        >
          Continuar
        </button>
      </div>
    </motion.div>
  );
}
