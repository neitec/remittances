"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopAppBar } from "@/components/nav/TopAppBar";
import { BankAccountForm } from "@/components/features/BankAccountForm";
import { useExternalAccounts } from "@/lib/hooks/useExternalAccounts";
import { maskIBAN } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";

export default function AccountsPage() {
  const { data: externalAccounts = [], isLoading } = useExternalAccounts();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <TopAppBar title="Mis Cuentas" onBack={() => window.history.back()} />

      <main className="pt-24 px-6 pb-32 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="space-y-2">
            <p className="font-inter font-bold text-[11px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
              CUENTAS BANCARIAS
            </p>
            <h1 className="font-manrope font-extrabold text-3xl text-[var(--color-on-surface)]">
              Gestiona tus cuentas
            </h1>
            <p className="text-sm text-[var(--color-on-surface-variant)] font-inter">
              Aquí puedes agregar y administrar tus cuentas bancarias para depósitos y transferencias.
            </p>
          </div>

          {/* Accounts List */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-2xl bg-[var(--color-surface-container-low)]/50"
              >
                <p className="text-[var(--color-on-surface-variant)] text-sm font-inter text-center">
                  Cargando cuentas bancarias...
                </p>
              </motion.div>
            ) : externalAccounts.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {externalAccounts.map((account) => (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-[var(--color-surface-container-low)]/50 border border-[var(--color-outline-variant)]/20 hover:bg-[var(--color-surface-container-low)] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                          <Icon
                            name="account_balance"
                            size={24}
                            className="text-[var(--color-primary)]"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-manrope font-bold text-[var(--color-on-surface)]">
                            {account.bankName}
                          </p>
                          <p className="text-sm text-[var(--color-on-surface-variant)] font-inter mt-1">
                            {maskIBAN(account.accountNumber || "")}
                          </p>
                          <p className="text-xs text-[var(--color-on-surface-variant)]/70 font-inter mt-0.5">
                            {account.currency || "EUR"}
                          </p>
                        </div>
                      </div>
                      <Icon
                        name="check_circle"
                        size={24}
                        className="text-[var(--color-success)] flex-shrink-0"
                        filled
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <Icon
                  name="account_balance"
                  size={48}
                  className="text-[var(--color-on-surface-variant)]/30 mx-auto mb-3"
                />
                <p className="text-[var(--color-on-surface-variant)] text-sm font-inter">
                  Aún no tienes cuentas bancarias agregadas
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add Account Form */}
          {!showForm && externalAccounts.length > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setShowForm(true)}
              className="w-full p-4 border-2 border-dashed border-[var(--color-outline-variant)]/50 rounded-2xl cursor-pointer transition-all hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/5 flex items-center justify-center gap-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] font-manrope font-bold text-sm"
            >
              <Icon name="add" size={20} />
              Añadir nueva cuenta
            </motion.button>
          )}

          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <BankAccountForm
                onSuccess={() => {
                  setShowForm(false);
                }}
                onCancel={() => setShowForm(false)}
                defaultExpanded={true}
              />
            </motion.div>
          )}

          {/* Security Info Card */}
          <div className="p-4 rounded-2xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 space-y-2">
            <div className="flex items-center gap-2">
              <Icon name="verified_user" size={20} className="text-[var(--color-success)]" filled />
              <p className="font-manrope font-bold text-[var(--color-on-surface)] text-sm">
                Transferencias seguras
              </p>
            </div>
            <p className="text-xs text-[var(--color-on-surface-variant)]/80 font-inter">
              Tus fondos están protegidos con encriptación de nivel bancario. Todos los datos de cuenta se cifran.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
