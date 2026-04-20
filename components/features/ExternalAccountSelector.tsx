"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExternalAccounts } from "@/lib/hooks/useExternalAccounts";
import { BankAccountForm } from "@/components/features/BankAccountForm";
import { Icon } from "@/components/ui/Icon";
import { maskIBAN } from "@/lib/format";
import { ExternalAccount } from "@/lib/types";

interface ExternalAccountSelectorProps {
  selectedCountry: string;
  selectedAccount: string;
  onSelect: (accountId: string) => void;
  onSelectFull?: (account: ExternalAccount) => void;
  onBack: () => void;
  onAddAccount?: () => void;
  onContinue: () => void;
  onNewAccountSaved?: (accountId: string) => void;
  showAddButton?: boolean;
  showInlineCreate?: boolean;
}

const slideVariants = {
  initial: (dir: number) => ({ x: dir * 48, opacity: 0, scale: 0.985 }),
  animate: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir * -48, opacity: 0, scale: 0.985 }),
};

export function ExternalAccountSelector({
  selectedCountry,
  selectedAccount,
  onSelect,
  onSelectFull,
  onBack,
  onContinue,
  onNewAccountSaved,
}: ExternalAccountSelectorProps) {
  const { data: externalAccounts, isLoading } = useExternalAccounts();
  const [view, setView] = useState<"list" | "add">("list");
  const [slideDir, setSlideDir] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const filteredAccounts = externalAccounts ?? [];
  const hasAccounts = filteredAccounts.length > 0;

  const goToAdd = () => {
    setSlideDir(1);
    setView("add");
  };

  const goToList = () => {
    setSlideDir(-1);
    setView("list");
  };

  if (isSaving) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24 gap-4"
      >
        <div
          className="w-12 h-12 rounded-full border-[3px] border-[var(--color-primary-fixed)] border-t-[var(--color-primary)] animate-spin"
        />
        <p className="text-[13px] font-inter text-[var(--color-on-surface-variant)]/50">
          Preparando tu depósito…
        </p>
      </motion.div>
    );
  }

  return (
    <>
      {/* Overflow hidden so slide doesn't spill */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={slideDir}>
          {/* ── LIST VIEW ── */}
          {view === "list" && (
            <motion.div
              key="list"
              custom={slideDir}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.34, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-5 pb-6"
            >
              {/* Header */}
              <div className="space-y-1 pt-4">
                <h1 className="font-inter font-medium text-[20px] text-[var(--color-on-surface-variant)] leading-tight">
                  Selecciona tu cuenta bancaria
                </h1>
                <p className="text-[13px] font-inter text-[var(--color-on-surface-variant)]/50">
                  Selecciona una cuenta bancaria existente o añade una nueva
                </p>
              </div>

              {/* Account list */}
              <div className="space-y-3">
                {isLoading ? (
                  <div className="p-4 rounded-2xl bg-[var(--color-surface-container-low)]/50">
                    <p className="text-[var(--color-on-surface-variant)] text-sm font-inter text-center">
                      Cargando cuentas bancarias...
                    </p>
                  </div>
                ) : hasAccounts ? (
                  <>
                    {filteredAccounts.map((acc) => (
                      <label
                        key={acc.id}
                        className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all bg-[var(--color-surface-container-low)]/30 hover:bg-[var(--color-surface-container-low)] group"
                        onClick={() => {
                          onSelect(acc.id);
                          onSelectFull?.(acc);
                          if (onNewAccountSaved) {
                            setIsSaving(true);
                            onNewAccountSaved(acc.id);
                          } else {
                            setTimeout(() => onContinue(), 120);
                          }
                        }}
                      >
                        <input
                          type="radio"
                          name="account"
                          value={acc.id}
                          checked={selectedAccount === acc.id}
                          onChange={() => {}}
                          className="hidden peer"
                        />
                        <div className="w-6 h-6 rounded-full border-2 border-[var(--color-outline-variant)] peer-checked:border-[var(--color-primary)] peer-checked:bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0 transition-all">
                          {selectedAccount === acc.id && (
                            <Icon name="check" size={16} className="text-white" filled />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-manrope font-bold text-[var(--color-on-surface)] text-sm">
                            {acc.bankName}
                          </p>
                          <p className="text-xs text-[var(--color-on-surface-variant)]/70 font-inter mt-0.5">
                            {maskIBAN(acc.accountNumber || "")}
                          </p>
                        </div>
                      </label>
                    ))}
                  </>
                ) : null}

                {/* Add new account button */}
                <button
                  onClick={goToAdd}
                  className="w-full p-4 border-2 border-dashed border-[var(--color-outline-variant)]/50 rounded-2xl cursor-pointer transition-all hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/5 flex items-center justify-center gap-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] font-manrope font-bold text-sm"
                >
                  <Icon name="add" size={20} />
                  Añadir nueva cuenta bancaria
                </button>
              </div>

              {/* Security card */}
              <div
                className="flex items-center gap-4 px-5 py-4 rounded-[18px]"
                style={{
                  background: "rgba(0,62,199,0.05)",
                  border: "1px solid rgba(0,62,199,0.10)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(0,62,199,0.10)" }}
                >
                  <Icon name="verified_user" size={20} className="text-[var(--color-primary)]" filled />
                </div>
                <div>
                  <p className="font-manrope font-bold text-sm" style={{ color: "#003ec7" }}>
                    Transferencia segura
                  </p>
                  <p className="text-xs font-inter mt-0.5 text-[var(--color-on-surface-variant)]/60">
                    Tus fondos están protegidos con encriptación de nivel bancario
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── ADD VIEW ── */}
          {view === "add" && (
            <motion.div
              key="add"
              custom={slideDir}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.34, ease: [0.25, 0.1, 0.25, 1] }}
              className="pb-20"
            >
              {/* Back button */}
              <div className="pt-4 mb-5">
                <button
                  onClick={goToList}
                  className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-[10px] transition-all hover:opacity-80"
                  style={{ background: "var(--color-primary-fixed)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <line x1="19" y1="12" x2="6" y2="12" stroke="#003ec7" strokeWidth="2.2" strokeLinecap="round" />
                    <polyline points="13 6 6 12 13 18" fill="none" stroke="#003ec7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[11px] font-inter font-semibold uppercase tracking-[0.18em]" style={{ color: "#003ec7" }}>
                    Volver a mis cuentas
                  </span>
                </button>
              </div>

              {/* Header */}
              <div className="space-y-1 mb-6">
                <h1 className="font-inter font-medium text-[20px] text-[var(--color-on-surface-variant)] leading-tight">
                  Introduce los detalles de la nueva cuenta
                </h1>
                <p className="text-[13px] font-inter text-[var(--color-on-surface-variant)]/50">
                  Añade los datos bancarios de la cuenta desde la que quieres realizar el depósito
                </p>
              </div>

              <BankAccountForm
                defaultExpanded={true}
                onSuccess={(newAccount) => {
                  onSelect(newAccount.id);
                  onSelectFull?.(newAccount);
                  if (onNewAccountSaved) {
                    setIsSaving(true);
                    onNewAccountSaved(newAccount.id);
                  } else {
                    onContinue();
                  }
                }}
                onCancel={goToList}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </>
  );
}
