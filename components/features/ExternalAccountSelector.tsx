"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useExternalAccounts } from "@/lib/hooks/useExternalAccounts";
import { BankAccountForm } from "@/components/features/BankAccountForm";
import { maskIBAN } from "@/lib/format";
import { ExternalAccount } from "@/lib/types";
import { ArrowRight, Loader2 } from "lucide-react";

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
    <motion.div
      key="account-selector"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-5"
    >
      <p className="text-sm text-brand-navy font-semibold mb-4">
        Selecciona tu banco
      </p>

      <div className="space-y-2">
        {isLoading ? (
          <div className="p-4 rounded-lg border-2 border-brand-sand/30 bg-brand-sand/8 shadow-sm">
            <p className="text-brand-sand/80 text-sm text-center font-medium">
              Cargando cuentas bancarias...
            </p>
          </div>
        ) : filteredAccounts && filteredAccounts.length > 0 ? (
          <>
            {filteredAccounts.map((acc) => (
              <label
                key={acc.id}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all shadow-sm ${
                  selectedAccount === acc.id
                    ? "border-brand-coral bg-brand-coral/8 shadow-md"
                    : "border-brand-sand/30 hover:border-brand-sand/50 hover:shadow-md bg-brand-white/50"
                }`}
              >
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
                  className="mr-3"
                />
                <div className="flex-1">
                  <p className="font-semibold text-brand-navy text-sm">
                    {acc.bankName}
                  </p>
                  <p className="text-xs text-brand-sand/80 mt-0.5">
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
          <div className="p-4 rounded-lg border-2 border-brand-sand/30 bg-brand-sand/8 shadow-sm">
            <p className="text-brand-sand/80 text-sm text-center font-medium">
              Añade una cuenta bancaria para continuar
            </p>
          </div>
        )}
      </div>

      <Button
        onClick={onContinue}
        disabled={!selectedAccount}
        className="w-full bg-brand-coral hover:bg-brand-coral/90 text-white font-bold py-3 h-12"
      >
        Continuar
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      <Button
        onClick={onBack}
        variant="outline"
        className="w-full text-brand-navy border-brand-sand/30 hover:bg-brand-sand/5"
      >
        Volver
      </Button>
    </motion.div>
  );
}
