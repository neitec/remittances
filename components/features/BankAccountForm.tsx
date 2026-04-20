"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isValidIBAN, friendlyFormatIBAN } from "ibantools";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/Icon";
import { SlideToAction } from "@/components/ui/SlideToAction";
import { useAddExternalAccount } from "@/lib/hooks/mutations/useAddExternalAccount";
import { ExternalAccount } from "@/lib/types";
import { toast } from "sonner";

interface BankAccountFormProps {
  onSuccess: (account: ExternalAccount) => void;
  onCancel?: () => void;
  defaultExpanded?: boolean;
  fullScreen?: boolean;
}

const COUNTRIES = {
  ES: { name: "España", code: "+34", iban: "ES" },
  UK: { name: "Reino Unido", code: "+44", iban: "GB" },
  US: { name: "Estados Unidos", code: "+1", iban: "US" },
  DO: { name: "República Dominicana", code: "+1", iban: "DO" },
};

function validateIBAN(raw: string): { error: string | null; formatted: string } {
  const cleaned = raw.replace(/\s/g, "").toUpperCase();
  if (!isValidIBAN(cleaned)) {
    return { error: "IBAN no válido", formatted: cleaned };
  }
  return { error: null, formatted: friendlyFormatIBAN(cleaned) || cleaned };
}

export function BankAccountForm({
  onSuccess,
  onCancel,
  defaultExpanded = false,
  fullScreen = false,
}: BankAccountFormProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || fullScreen);
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [country, setCountry] = useState<keyof typeof COUNTRIES>("ES");
  const [accountNumberError, setAccountNumberError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate, isPending } = useAddExternalAccount();

  const handleAccountNumberChange = (value: string) => {
    const cleaned = value.toUpperCase();
    if (!cleaned) {
      setAccountNumber("");
      setAccountNumberError(null);
      return;
    }
    const { error, formatted } = validateIBAN(cleaned);
    setAccountNumber(formatted);
    setAccountNumberError(error);
  };

  const handleSubmit = async () => {
    if (!bankName.trim()) {
      toast.error("Por favor ingresa el nombre del banco");
      return;
    }

    const { error } = validateIBAN(accountNumber);
    if (error) {
      setAccountNumberError(error);
      return;
    }

    const cleanedAccountNumber = accountNumber.replace(/\s/g, "").toUpperCase();

    setIsSubmitting(true);
    mutate(
      {
        accountNumber: cleanedAccountNumber,
        bankName: bankName.trim(),
        currency: "EUR",
      },
      {
        onSuccess: (newAccount) => {
          setAccountNumber("");
          setBankName("");
          setAccountNumberError(null);
          setIsExpanded(false);
          setIsSubmitting(false);
          onSuccess(newAccount);
          toast.success("Cuenta bancaria guardada");
        },
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : "Error al guardar la cuenta";
          toast.error(message);
          setIsSubmitting(false);
        },
      }
    );
  };

  // Full-screen mode (EXT1)
  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        {/* TopAppBar */}
        <div className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center gap-4 px-6 bg-[rgba(248,249,250,0.7)] backdrop-blur-[48px]">
          <button
            onClick={onCancel}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-container-low)] transition-colors"
          >
            <Icon name="arrow_back" size={24} className="text-[var(--color-on-surface)]" />
          </button>
          <div className="flex-1 text-center absolute left-1/2 -translate-x-1/2">
            <p className="font-manrope font-bold text-lg text-[var(--color-on-surface)]">
              Nueva cuenta
            </p>
          </div>
        </div>

        {/* Main content */}
        <main className="pt-24 px-6 pb-32 max-w-2xl mx-auto space-y-6">
          {/* Large icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-[var(--color-primary-fixed)] flex items-center justify-center">
              <Icon
                name="account_balance"
                size={40}
                className="text-[var(--color-primary)]"
                filled
              />
            </div>
          </div>

          <h1 className="font-manrope font-extrabold text-3xl text-center text-[var(--color-on-surface)] mb-8">
            Nueva cuenta externa
          </h1>

          <form className="space-y-6">
            {/* EXT2: Country selector — Spain only */}
            <div className="space-y-3">
              <label className="font-inter font-bold text-[11px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                País del banco
              </label>
              <div className="relative">
                <select
                  value={country}
                  onChange={(e) => {
                    const selected = e.target.value as keyof typeof COUNTRIES;
                    if (selected !== "ES") {
                      setCountry("ES");
                      toast.info("Solo disponible para cuentas españolas por ahora");
                    } else {
                      setCountry(selected);
                    }
                  }}
                  className="w-full appearance-none px-4 py-3 pr-10 rounded-2xl bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] font-inter border border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                >
                  {Object.entries(COUNTRIES).map(([code, data]) => (
                    <option key={code} value={code} disabled={code !== "ES"}>
                      {code} - {data.name} {code !== "ES" ? "(Próximamente)" : ""}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="var(--color-on-surface-variant)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* EXT3: IBAN input */}
            <div className="space-y-3">
              <label className="font-inter font-bold text-[11px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                IBAN
              </label>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                accountNumberError
                  ? "border-[var(--color-error)] bg-[rgba(244,63,94,0.03)]"
                  : accountNumber && !accountNumberError
                  ? "border-[var(--color-success)] bg-[rgba(16,185,129,0.03)]"
                  : "border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]"
              } focus-within:border-[var(--color-primary)]`}>
                <input
                  type="text"
                  placeholder="Ej: ES91 2100 0418 4502 0005 1332"
                  value={accountNumber}
                  onChange={(e) => handleAccountNumberChange(e.target.value)}
                  disabled={isPending}
                  className="flex-1 bg-transparent text-[var(--color-on-surface)] font-inter outline-none placeholder:text-[var(--color-on-surface-variant)]/50"
                />
                {!accountNumberError && accountNumber && (
                  <Icon name="check_circle" size={20} className="text-[var(--color-success)] flex-shrink-0" />
                )}
              </div>
              {accountNumberError && (
                <p className="text-xs text-[var(--color-error)] font-inter flex items-center gap-1.5 mt-1">
                  <Icon name="error_outline" size={14} />
                  {accountNumberError}
                </p>
              )}
              {!accountNumberError && accountNumber && (
                <p className="text-xs text-[var(--color-success)] font-inter flex items-center gap-1.5 mt-1">
                  <Icon name="check" size={14} />
                  IBAN válido
                </p>
              )}
              <p className="text-xs text-[var(--color-on-surface-variant)]/70 font-inter">
                Cuenta bancaria SEPA (Europa)
              </p>
            </div>

            {/* Bank name */}
            <div className="space-y-3">
              <label className="font-inter font-bold text-[11px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                Nombre del banco
              </label>
              <input
                type="text"
                placeholder="Ej: CaixaBank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                disabled={isPending}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] font-inter border border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] focus:outline-none transition-colors placeholder:text-[var(--color-on-surface-variant)]/50"
              />
            </div>
          </form>
        </main>

        {/* SlideToAction at bottom */}
        <div className="fixed bottom-0 left-0 right-0 px-6 py-6 bg-[rgba(248,249,250,0.7)] backdrop-blur-[48px]">
          <SlideToAction
            onConfirm={handleSubmit}
            label="DESLIZA PARA GUARDAR"
            disabled={!!accountNumberError || !bankName.trim() || !accountNumber.trim()}
            loading={isPending || isSubmitting}
          />
        </div>
      </div>
    );
  }

  // Inline mode (collapsed/expanded)
  return (
    <motion.div>
      <AnimatePresence mode="wait">
        {!isExpanded && onCancel && (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={() => setIsExpanded(true)}
            className="w-full p-4 border-2 border-dashed border-[var(--color-outline-variant)]/50 rounded-2xl cursor-pointer transition-all hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/5 flex items-center justify-center gap-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] font-manrope font-bold text-sm"
          >
            <Icon name="add" size={20} />
            Añadir nueva cuenta bancaria
          </motion.button>
        )}

        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-7 p-10 rounded-2xl bg-[var(--color-surface-container-low)]/50 border border-[var(--color-outline-variant)]/20"
          >
            <form className="space-y-7">
              {/* Country selector — Spain only */}
              <div className="space-y-2.5">
                <label className="font-inter font-bold text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                  País del banco
                </label>
                <div className="relative">
                  <select
                    value={country}
                    onChange={(e) => {
                      const selected = e.target.value as keyof typeof COUNTRIES;
                      if (selected !== "ES") {
                        setCountry("ES");
                        toast.info("Solo disponible para cuentas españolas por ahora");
                      } else {
                        setCountry(selected);
                      }
                    }}
                    className="w-full appearance-none px-4 py-3 pr-10 rounded-xl bg-[var(--color-surface-container)] text-[var(--color-on-surface)] font-inter text-sm border border-[var(--color-outline-variant)]/50 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                  >
                    {Object.entries(COUNTRIES).map(([code, data]) => (
                      <option key={code} value={code} disabled={code !== "ES"}>
                        {code} - {data.name} {code !== "ES" ? "(Próximamente)" : ""}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9l6 6 6-6" stroke="var(--color-on-surface-variant)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* IBAN input */}
              <div className="space-y-2.5">
                <label className="font-inter font-bold text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                  IBAN
                </label>
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                  accountNumberError
                    ? "border-[var(--color-error)] bg-[rgba(244,63,94,0.03)]"
                    : accountNumber && !accountNumberError
                    ? "border-[var(--color-success)] bg-[rgba(16,185,129,0.03)]"
                    : "border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container)]"
                } focus-within:border-[var(--color-primary)]`}>
                  <input
                    type="text"
                    placeholder="Ej: ES91 2100 0418 4502 0005 1332"
                    value={accountNumber}
                    onChange={(e) => handleAccountNumberChange(e.target.value)}
                    disabled={isPending}
                    className="flex-1 bg-transparent text-[var(--color-on-surface)] font-inter text-sm outline-none placeholder:text-[var(--color-on-surface-variant)]/50"
                  />
                  {!accountNumberError && accountNumber && (
                    <Icon name="check_circle" size={18} className="text-[var(--color-success)] flex-shrink-0" />
                  )}
                </div>
                {accountNumberError && (
                  <p className="text-xs text-[var(--color-error)] font-inter flex items-center gap-1 mt-1">
                    <Icon name="error_outline" size={13} />
                    {accountNumberError}
                  </p>
                )}
                {!accountNumberError && accountNumber && (
                  <p className="text-xs text-[var(--color-success)] font-inter flex items-center gap-1 mt-1">
                    <Icon name="check" size={13} />
                    IBAN válido
                  </p>
                )}
              </div>

              {/* Bank name */}
              <div className="space-y-2.5">
                <label className="font-inter font-bold text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                  Nombre del banco
                </label>
                <input
                  type="text"
                  placeholder="Ej: CaixaBank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  disabled={isPending}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-container)] text-[var(--color-on-surface)] font-inter text-sm border border-[var(--color-outline-variant)]/50 focus:border-[var(--color-primary)] focus:outline-none transition-colors placeholder:text-[var(--color-on-surface-variant)]/50"
                />
              </div>

              {/* Actions — Cancelar left (orange), Guardar right (blue) */}
              <div className="flex gap-3 pt-2 max-w-sm">
                {onCancel && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsExpanded(false);
                      setAccountNumber("");
                      setBankName("");
                      setAccountNumberError(null);
                    }}
                    className="flex-1 min-w-[100px] h-11 rounded-xl font-manrope font-bold text-sm cursor-pointer transition-transform active:scale-[0.97]"
                    style={{
                      border: "1.5px solid #bc4800",
                      color: "#bc4800",
                      background: "rgba(188,72,0,0.04)",
                      boxShadow: "0 2px 10px rgba(188,72,0,0.10)",
                    }}
                    onMouseEnter={e => {
                      const btn = e.currentTarget;
                      btn.style.background = "rgba(188,72,0,0.10)";
                      btn.style.boxShadow = "0 4px 18px rgba(188,72,0,0.22)";
                      btn.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={e => {
                      const btn = e.currentTarget;
                      btn.style.background = "rgba(188,72,0,0.04)";
                      btn.style.boxShadow = "0 2px 10px rgba(188,72,0,0.10)";
                      btn.style.transform = "translateY(0)";
                    }}
                    onMouseDown={e => {
                      e.currentTarget.style.transform = "translateY(0) scale(0.97)";
                      e.currentTarget.style.boxShadow = "0 1px 5px rgba(188,72,0,0.10)";
                    }}
                    onMouseUp={e => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 4px 18px rgba(188,72,0,0.22)";
                    }}
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="relative flex-1 h-11 rounded-xl text-white font-manrope font-bold text-sm cursor-pointer overflow-hidden active:scale-[0.97] transition-transform"
                  style={{ background: "#003ec7", boxShadow: "0 2px 12px rgba(0,62,199,0.25)" }}
                  onMouseEnter={e => {
                    const btn = e.currentTarget;
                    btn.style.background = "#0035b0";
                    btn.style.boxShadow = "0 4px 20px rgba(0,62,199,0.45)";
                    btn.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={e => {
                    const btn = e.currentTarget;
                    btn.style.background = "#003ec7";
                    btn.style.boxShadow = "0 2px 12px rgba(0,62,199,0.25)";
                    btn.style.transform = "translateY(0)";
                  }}
                  onMouseDown={e => {
                    e.currentTarget.style.transform = "translateY(0) scale(0.97)";
                    e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,62,199,0.2)";
                  }}
                  onMouseUp={e => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,62,199,0.45)";
                  }}
                >
                  {isPending ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
