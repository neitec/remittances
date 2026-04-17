"use client";

import { motion } from "framer-motion";
import { useExternalAccounts } from "@/lib/hooks/useExternalAccounts";
import { BankAccountForm } from "@/components/features/BankAccountForm";
import { GlassCard } from "@/components/ui/GlassCard";
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
  showAddButton?: boolean;
  showInlineCreate?: boolean;
}

export function ExternalAccountSelector({
  selectedCountry,
  selectedAccount,
  onSelect,
  onSelectFull,
  onBack,
  onAddAccount,
  onContinue,
  showAddButton = false,
  showInlineCreate = false,
}: ExternalAccountSelectorProps) {
  const { data: externalAccounts, isLoading } = useExternalAccounts();

  const filteredAccounts = externalAccounts ?? [];

  return (
    <>
      <motion.div
        key="account-selector"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6 pb-20"
      >
        {/* ACC1: Header Editorial */}
        <div className="space-y-2 pt-4">
          <p className="font-inter font-bold text-[11px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
            MIS CUENTAS
          </p>
          <h1 className="font-manrope font-extrabold text-3xl leading-tight">
            <span className="text-[var(--color-on-surface)]">¿Dónde quieres </span>
            <span className="text-[var(--color-primary)]">recibir el dinero?</span>
          </h1>
        </div>

        {/* Accounts list */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="p-4 rounded-2xl bg-[var(--color-surface-container-low)]/50">
              <p className="text-[var(--color-on-surface-variant)] text-sm font-inter text-center">
                Cargando cuentas bancarias...
              </p>
            </div>
          ) : filteredAccounts && filteredAccounts.length > 0 ? (
            <>
              {filteredAccounts.map((acc) => (
                <label
                  key={acc.id}
                  className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all bg-[var(--color-surface-container-low)]/30 hover:bg-[var(--color-surface-container-low)] group"
                >
                  {/* ACC2: Custom radio */}
                  <input
                    type="radio"
                    name="account"
                    value={acc.id}
                    checked={selectedAccount === acc.id}
                    onChange={(e) => {
                      onSelect(e.target.value);
                      const full = filteredAccounts.find(a => a.id === e.target.value);
                      if (full) onSelectFull?.(full);
                    }}
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

              {showInlineCreate && (
                <BankAccountForm
                  defaultExpanded={false}
                  onSuccess={(newAccount) => {
                    onSelect(newAccount.id);
                    onSelectFull?.(newAccount);
                  }}
                  onCancel={() => {}}
                />
              )}
            </>
          ) : showInlineCreate ? (
            <BankAccountForm
              defaultExpanded={true}
              onSuccess={(newAccount) => {
                onSelect(newAccount.id);
                onSelectFull?.(newAccount);
              }}
            />
          ) : (
            <div className="p-4 rounded-2xl bg-[var(--color-surface-container-low)]/50">
              <p className="text-[var(--color-on-surface-variant)] text-sm font-inter text-center">
                Añade una cuenta bancaria para continuar
              </p>
            </div>
          )}
        </div>

        {/* ACC4: Glass Card with security info */}
        <GlassCard className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[var(--color-success)]/20 flex items-center justify-center flex-shrink-0">
            <Icon
              name="verified_user"
              size={20}
              className="text-[var(--color-success)]"
              filled
            />
          </div>
          <div>
            <p className="font-manrope font-bold text-[var(--color-on-surface)] text-sm">
              Transferencia segura
            </p>
            <p className="text-xs text-[var(--color-on-surface-variant)]/70 font-inter mt-0.5">
              Tus fondos están protegidos con encriptación de nivel bancario
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* ACC5: Fixed bottom action bar */}
      <div
        className="fixed bottom-0 left-0 right-0 lg:left-64 px-6 pt-4 pb-10 z-40"
        style={{
          background: "linear-gradient(to top, var(--color-surface), transparent)",
        }}
      >
        <motion.button
          onClick={onContinue}
          disabled={!selectedAccount}
          className="w-full h-16 rounded-xl bg-[var(--color-primary)] text-white font-manrope font-bold transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center mb-3"
          whileTap={{ scale: 0.98 }}
        >
          Continuar
        </motion.button>
        <button
          onClick={onBack}
          className="w-full text-center text-[var(--color-primary)] font-inter font-bold text-sm uppercase tracking-[0.1em] transition-colors hover:text-[var(--color-primary-container)]"
        >
          Cancelar
        </button>
      </div>
    </>
  );
}
