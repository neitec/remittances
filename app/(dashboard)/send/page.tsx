"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { SlideToAction } from "@/components/ui/SlideToAction";
import { GlassCard } from "@/components/ui/GlassCard";
import { useBeneficiary } from "@/lib/hooks/useBeneficiary";
import { useSendMoney } from "@/lib/hooks/useSendMoney";
import { useExternalAccounts } from "@/lib/hooks/useExternalAccounts";
import { SuccessAnimation } from "@/components/motion/SuccessAnimation";
import { ExternalAccountSelector } from "@/components/features/ExternalAccountSelector";
import { toast } from "sonner";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { formatCurrency, maskIBAN, formatRelativeDate } from "@/lib/format";
import { ExternalAccount } from "@/lib/types";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Step = 1 | 2 | 3 | 4 | "processing" | "success" | "error";
type SendMode = "user" | "bank";

export default function SendPage() {
  const router = useRouter();
  const { data: dashboardData } = useAccounts();
  const { data: externalAccounts } = useExternalAccounts();
  const { data: transactionsData } = useTransactions({ type: "TRANSFER" });
  const [step, setStep] = useState<Step>(1);
  const [sendMode, setSendMode] = useState<SendMode>("user");
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>("");
  const [selectedAccountData, setSelectedAccountData] = useState<ExternalAccount | null>(null);
  const [countryCode, setCountryCode] = useState("+34");
  const [phone, setPhone] = useState("");
  const [alias, setAlias] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { mutate: searchBeneficiary, data: beneficiary, isPending: isSearching } =
    useBeneficiary();
  const { mutate: sendMoney, isPending: isSending } = useSendMoney();

  const totalBalance = dashboardData?.totalBalance ?? 0;
  const hasBalance = totalBalance > 0;
  const step3Unlocked =
    sendMode === "user" ? !!beneficiary : !!selectedAccountData;

  const QUICK_AMOUNTS = [50, 100, 200, 500];

  // Handle phone change - search beneficiary when phone is complete
  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (value.length === 9) {
      const fullPhone = countryCode + value;
      searchBeneficiary(fullPhone, {
        onError: () => {
          toast.error("Contacto no encontrado");
        },
      });
    }
  };

  const handleSendConfirm = () => {
    if (submitted) return;
    setSubmitted(true);

    const amountNum = parseFloat(amount.replace(",", "."));
    setErrorMessage("");

    const request =
      sendMode === "bank" && selectedAccountData
        ? {
            beneficiaryPhone: "",
            amount: amountNum.toString(),
            currency: "EUR" as const,
            reference: message ? `mensaje: ${message}` : undefined,
          }
        : {
            beneficiaryPhone: phone,
            amount: amountNum.toString(),
            currency: "EUR" as const,
            reference: message ? `mensaje: ${message}` : undefined,
          };

    setStep("processing");
    sendMoney(request, {
      onSuccess: () => {
        setStep("success");
        setSubmitted(false);
      },
      onError: (err) => {
        const errorMsg =
          err instanceof Error ? err.message : "Error al enviar el dinero";
        setErrorMessage(errorMsg);
        setStep("error");
        setSubmitted(false);
      },
    });
  };

  useEffect(() => {
    if (step === "success") {
      const timer = setTimeout(() => router.push("/dashboard"), 5000);
      return () => clearTimeout(timer);
    }
  }, [step, router]);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* TopAppBar */}
      <motion.header
        className="fixed top-0 left-0 right-0 lg:left-64 z-40 h-16 flex items-center gap-4 px-6 bg-[rgba(248,249,250,0.7)] backdrop-blur-[48px]"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {step === 1 ? null : (
          <button
            onClick={() => {
              if (step === 2 && sendMode === "user") {
                setStep(1);
              } else if (step === 2 && sendMode === "bank") {
                setStep(1);
              } else if (step === 3) {
                setStep(2);
              } else if (step === 4) {
                setStep(3);
              }
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-container-low)] transition-colors"
          >
            <Icon name="arrow_back" size={24} className="text-[var(--color-on-surface)]" />
          </button>
        )}
        <div className="flex-1 text-center absolute left-1/2 -translate-x-1/2">
          <p className="font-manrope font-bold text-lg text-[var(--color-on-surface)]">
            {step === 1
              ? "Enviar Dinero"
              : step === 2
              ? sendMode === "user"
                ? "A un contacto"
                : "A una cuenta"
              : step === 3
              ? "Monto"
              : step === 4
              ? "Confirmación"
              : step === "success"
              ? "¡Enviado!"
              : step === "error"
              ? "Error"
              : "Procesando"}
          </p>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="pt-24 px-6 pb-32 lg:pb-0 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {/* No balance state */}
          {!hasBalance && step === 1 && (
            <motion.div
              key="no-balance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6 py-12"
            >
              <div className="w-20 h-20 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center mx-auto">
                <Icon
                  name="wallet"
                  size={40}
                  className="text-[var(--color-error)]"
                  filled
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-manrope font-bold text-[var(--color-on-surface)]">
                  Sin saldo disponible
                </h2>
                <p className="text-sm text-[var(--color-on-surface-variant)]">
                  Añade fondos para poder enviar dinero
                </p>
              </div>
              <Link href="/deposit" className="block">
                <button className="w-full px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-manrope font-bold transition-all hover:opacity-90 active:scale-[0.98]">
                  Depositar fondos
                </button>
              </Link>
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full px-6 py-3 rounded-xl border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] font-manrope font-bold transition-all hover:bg-[var(--color-surface-container-low)]"
              >
                Volver al inicio
              </button>
            </motion.div>
          )}

          {/* Step 1: Choose transfer type (TR1, TR2) */}
          {hasBalance && step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <p className="font-inter font-bold text-[11px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                  TIPO DE TRANSFERENCIA
                </p>

                {/* TR1: Internal transfer */}
                <button
                  onClick={() => {
                    setSendMode("user");
                    setStep(2);
                    setPhone("");
                    setAmount("");
                  }}
                  className="relative w-full p-6 rounded-[2.5rem] bg-[var(--color-primary-fixed)] border border-[var(--color-primary)]/30 text-left hover:border-[var(--color-primary)]/50 transition-all group active:scale-[0.98]"
                >
                  {/* Badge */}
                  <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold uppercase">
                    HABILITADO
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                      <Icon
                        name="auto_awesome"
                        size={28}
                        className="text-[var(--color-primary)]"
                        filled
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-manrope font-bold text-[var(--color-on-surface)] text-lg">
                        A un usuario de Remita
                      </p>
                      <p className="text-sm text-[var(--color-on-surface-variant)]/80 font-inter mt-1">
                        Sin comisiones · Instantáneo
                      </p>
                    </div>
                    <Icon
                      name="chevron_right"
                      size={24}
                      className="text-[var(--color-on-surface-variant)] flex-shrink-0 group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </button>

                {/* TR1: External transfer */}
                <button
                  onClick={() => {
                    setSendMode("bank");
                    setSelectedBankAccount("");
                    setSelectedAccountData(null);
                    setStep(2);
                  }}
                  className="relative w-full p-6 rounded-[2.5rem] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/50 text-left hover:border-[var(--color-outline-variant)] transition-all group active:scale-[0.98]"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-container-highest)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-surface-container)] transition-colors">
                      <Icon
                        name="swap_horiz"
                        size={28}
                        className="text-[var(--color-on-surface)]"
                        filled
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-manrope font-bold text-[var(--color-on-surface)] text-lg">
                        A una cuenta bancaria
                      </p>
                      <p className="text-sm text-[var(--color-on-surface-variant)]/80 font-inter mt-1">
                        Transferencia externa — A otro usuario que no es usuario de Remita.
                      </p>
                    </div>
                    <Icon
                      name="chevron_right"
                      size={24}
                      className="text-[var(--color-on-surface-variant)] flex-shrink-0 group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </button>
              </div>

              {/* TR2: Promotional card */}
              <div className="p-6 rounded-[2.5rem] bg-[#FFF4ED] border border-[var(--color-tertiary)]/10 space-y-3">
                <div className="inline-block px-3 py-1 rounded-full bg-[var(--color-tertiary)]/20 text-[var(--color-tertiary)] text-[10px] font-bold uppercase">
                  Promoción
                </div>
                <h3 className="font-manrope font-bold text-[var(--color-on-surface)] text-lg">
                  1 mes sin comisiones
                </h3>
                <p className="text-sm text-[var(--color-on-surface-variant)]/80 font-inter">
                  Invita a familia o amigos y ambos obtendréis transferencias sin comisiones.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 2: Bank account selection (bank mode) */}
          {hasBalance && step === 2 && sendMode === "bank" && (
            <motion.div
              key="step2-bank"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ExternalAccountSelector
                selectedCountry="ES"
                selectedAccount={selectedBankAccount}
                onSelect={setSelectedBankAccount}
                onSelectFull={setSelectedAccountData}
                onBack={() => setStep(1)}
                onContinue={() => {
                  if (!selectedBankAccount) {
                    toast.error("Selecciona una cuenta bancaria");
                    return;
                  }
                  if (!selectedAccountData) {
                    const accountData = externalAccounts?.find(
                      (a) => a.id === selectedBankAccount
                    );
                    if (accountData) {
                      setSelectedAccountData(accountData);
                    }
                  }
                  setStep(3);
                }}
                showInlineCreate={true}
              />
            </motion.div>
          )}

          {/* Step 2+3+4: User mode - single scrollable page */}
          {hasBalance && typeof step === "number" && step >= 2 && step <= 4 && sendMode === "user" && (
            <motion.div
              key="step-user"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* PARA: Phone input (TR6) */}
              {typeof step === "number" && step >= 2 && (
                <div className="space-y-3 pb-6 border-b border-[var(--color-outline-variant)]/10">
                  <p className="font-inter font-bold text-[11px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                    PARA
                  </p>

                  <div className="space-y-3">
                    {/* Country code selector */}
                    <div className="flex gap-3">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="px-3 py-3 rounded-xl bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] font-inter text-sm border border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                      >
                        <option value="+34">ES +34 (España)</option>
                        <option value="+1-829">DO +1-829 (Rep. Dominicana)</option>
                      </select>

                      <input
                        type="tel"
                        placeholder="612 345 678"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        disabled={isSearching}
                        maxLength={9}
                        className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] font-inter border border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] focus:outline-none transition-colors placeholder:text-[var(--color-on-surface-variant)]/50"
                      />
                    </div>

                    {/* Beneficiary card */}
                    {beneficiary && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-[var(--color-surface-container-low)]/50 flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                          <Icon
                            name="person"
                            size={20}
                            className="text-white"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-manrope font-bold text-[var(--color-on-surface)] text-sm">
                            {beneficiary.name}
                          </p>
                          <p className="text-xs text-[var(--color-on-surface-variant)]/70 font-inter">
                            Usuario de Remita
                          </p>
                        </div>
                        <Icon
                          name="check_circle"
                          size={20}
                          className="text-[var(--color-success)]"
                          filled
                        />
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* MONTO: Amount input (TR4) */}
              {typeof step === "number" && step >= 3 && beneficiary && (
                <div className="space-y-3 pb-6 border-b border-[var(--color-outline-variant)]/10">
                  <p className="font-inter font-bold text-[11px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                    MONTO
                  </p>

                  <div className="text-center space-y-4">
                    <div className="flex items-baseline justify-center gap-3">
                      <span className="text-2xl text-[var(--color-primary)] font-bold">
                        €
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        value={amount}
                        onChange={(e) => {
                          const val = e.target.value.replace(",", ".");
                          if (!val || /^\d*\.?\d*$/.test(val)) {
                            setAmount(val);
                          }
                        }}
                        disabled={isSending}
                        className="text-5xl font-manrope font-bold text-center text-[var(--color-on-surface)] border-0 bg-transparent outline-none max-w-xs placeholder:text-[var(--color-on-surface-variant)]/50"
                      />
                    </div>

                    <p className="text-xs text-[var(--color-on-surface-variant)]">
                      Tu saldo: {formatCurrency(totalBalance)}
                    </p>

                    {/* Quick amount buttons */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {QUICK_AMOUNTS.map((quickAmount) => (
                        <button
                          key={quickAmount}
                          onClick={() => setAmount(String(quickAmount))}
                          disabled={quickAmount > totalBalance}
                          className={`px-4 py-2 rounded-full font-inter font-bold text-xs transition-all ${
                            parseFloat(amount) === quickAmount
                              ? "bg-[var(--color-primary)] text-white"
                              : quickAmount > totalBalance
                              ? "bg-[var(--color-surface-container-low)]/50 text-[var(--color-on-surface-variant)]/50 cursor-not-allowed"
                              : "bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]"
                          }`}
                        >
                          {quickAmount}€
                        </button>
                      ))}
                    </div>
                  </div>

                  {amount &&
                    parseFloat(amount.replace(",", ".")) > totalBalance && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] text-xs font-inter font-medium flex items-center gap-2"
                      >
                        <Icon name="warning" size={16} />
                        Saldo insuficiente. Deposita más fondos para continuar.
                      </motion.div>
                    )}
                </div>
              )}

              {/* CONCEPTO: Message input (TR4) */}
              {typeof step === "number" && step >= 3 && beneficiary && (
                <div className="space-y-3 pb-6 border-b border-[var(--color-outline-variant)]/10">
                  <p className="font-inter font-bold text-[11px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                    CONCEPTO
                  </p>

                  <textarea
                    placeholder="Añade un mensaje (opcional)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 100))}
                    disabled={isSending}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] font-inter border border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] focus:outline-none transition-colors placeholder:text-[var(--color-on-surface-variant)]/50 resize-none"
                    rows={2}
                  />
                  <p className="text-xs text-[var(--color-on-surface-variant)]/70">
                    {message.length}/100 caracteres
                  </p>
                </div>
              )}

              {/* TR5: ENVÍOS RECIENTES */}
              {step === 2 && (
                <div className="space-y-3 pb-6 border-b border-[var(--color-outline-variant)]/10">
                  <p className="font-inter font-bold text-[11px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                    ENVÍOS RECIENTES
                  </p>

                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {transactionsData?.pages?.[0]?.transactions && transactionsData.pages[0].transactions.length > 0 ? (
                      <>
                        {transactionsData.pages[0].transactions.slice(0, 3).map((txn) => (
                          <button
                            key={txn.id}
                            onClick={() => {
                              // Show info that this is a recent transfer
                              toast.info(`Últimas transacciones: ${formatRelativeDate(txn.createdAt)}`);
                            }}
                            className="flex-shrink-0 px-4 py-2 rounded-2xl bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container)] transition-colors whitespace-nowrap"
                          >
                            <p className="font-manrope font-bold text-xs text-[var(--color-on-surface)]">
                              {formatCurrency(parseFloat(txn.amount))}
                            </p>
                          </button>
                        ))}
                      </>
                    ) : (
                      <p className="text-xs text-[var(--color-on-surface-variant)]/70 font-inter py-2">
                        Aún no hay envíos recientes
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TR8: Divider "O TAMBIÉN" */}
              {step === 2 && (
                <div className="flex items-center gap-3 py-4 border-t border-b border-[var(--color-outline-variant)]/10">
                  <div className="flex-1 h-px bg-[var(--color-outline-variant)]/10" />
                  <p className="text-xs font-inter font-bold uppercase text-[var(--color-on-surface-variant)]/50">
                    O TAMBIÉN
                  </p>
                  <div className="flex-1 h-px bg-[var(--color-outline-variant)]/10" />
                </div>
              )}

              {/* TR7: Alias input (user transfer) */}
              {step === 2 && (
                <div className="space-y-3 pb-6">
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] focus-within:border-[var(--color-primary)]">
                    <span className="font-manrope font-bold text-[var(--color-primary)] text-lg">
                      @
                    </span>
                    <input
                      type="text"
                      placeholder="Usuario Remita"
                      value={alias}
                      onChange={(e) => setAlias(e.target.value)}
                      disabled={isSearching}
                      className="flex-1 bg-transparent text-[var(--color-on-surface)] font-inter outline-none placeholder:text-[var(--color-on-surface-variant)]/50"
                    />
                  </div>
                </div>
              )}

              {/* TR9: SlideToAction confirmation */}
              {step === 3 && beneficiary && amount && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-4 space-y-6"
                >
                  <GlassCard className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon
                        name="verified_user"
                        size={20}
                        className="text-[var(--color-success)]"
                        filled
                      />
                      <p className="font-manrope font-bold text-sm text-[var(--color-on-surface)]">
                        Transferencia segura
                      </p>
                    </div>
                    <p className="text-xs text-[var(--color-on-surface-variant)]/70 font-inter">
                      {beneficiary.name} recibirá {formatCurrency(parseFloat(amount || "0"))}{" "}
                      al instante sin comisiones.
                    </p>
                  </GlassCard>

                  <SlideToAction
                    onConfirm={handleSendConfirm}
                    label="DESLIZA PARA CONFIRMAR"
                    disabled={
                      !amount ||
                      parseFloat(amount.replace(",", ".")) <= 0 ||
                      parseFloat(amount.replace(",", ".")) > totalBalance
                    }
                    loading={isSending}
                  />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 3: Amount for bank mode */}
          {hasBalance && step === 3 && sendMode === "bank" && selectedAccountData && (
            <motion.div
              key="step3-bank"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Account summary */}
              <div className="p-4 rounded-2xl bg-[var(--color-surface-container-low)]/50">
                <p className="font-inter font-bold text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-3">
                  Cuenta de destino
                </p>
                <p className="font-manrope font-bold text-[var(--color-on-surface)]">
                  {selectedAccountData.bankName}
                </p>
                <p className="text-xs text-[var(--color-on-surface-variant)]/70 mt-1">
                  {maskIBAN(selectedAccountData.accountNumber || "")}
                </p>
              </div>

              {/* Amount */}
              <div className="text-center space-y-4">
                <p className="text-sm text-[var(--color-on-surface-variant)] font-inter">
                  ¿Cuánto quieres enviar?
                </p>
                <div className="flex items-baseline justify-center gap-3">
                  <span className="text-2xl text-[var(--color-primary)] font-bold">
                    €
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => {
                      const val = e.target.value.replace(",", ".");
                      if (!val || /^\d*\.?\d*$/.test(val)) {
                        setAmount(val);
                      }
                    }}
                    disabled={isSending}
                    className="text-5xl font-manrope font-bold text-center text-[var(--color-on-surface)] border-0 bg-transparent outline-none max-w-xs placeholder:text-[var(--color-on-surface-variant)]/50"
                  />
                </div>

                <p className="text-xs text-[var(--color-on-surface-variant)]">
                  Tu saldo: {formatCurrency(totalBalance)}
                </p>

                {/* Quick buttons */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {QUICK_AMOUNTS.map((quickAmount) => (
                    <button
                      key={quickAmount}
                      onClick={() => setAmount(String(quickAmount))}
                      disabled={quickAmount > totalBalance}
                      className={`px-4 py-2 rounded-full font-inter font-bold text-xs transition-all ${
                        parseFloat(amount) === quickAmount
                          ? "bg-[var(--color-primary)] text-white"
                          : quickAmount > totalBalance
                          ? "bg-[var(--color-surface-container-low)]/50 text-[var(--color-on-surface-variant)]/50 cursor-not-allowed"
                          : "bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]"
                      }`}
                    >
                      {quickAmount}€
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="font-inter font-bold text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                  Referencia (opcional)
                </label>
                <textarea
                  placeholder="Ej: Pago por servicios"
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 100))}
                  disabled={isSending}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] font-inter border border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] focus:outline-none transition-colors placeholder:text-[var(--color-on-surface-variant)]/50 resize-none"
                  rows={2}
                />
              </div>

              <button
                onClick={() => setStep(4)}
                disabled={
                  !amount ||
                  parseFloat(amount.replace(",", ".")) <= 0 ||
                  parseFloat(amount.replace(",", ".")) > totalBalance
                }
                className="w-full px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-manrope font-bold transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                Continuar
              </button>
            </motion.div>
          )}

          {/* Step 4: Confirmation for bank mode */}
          {hasBalance && step === 4 && sendMode === "bank" && selectedAccountData && (
            <motion.div
              key="step4-bank"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <GlassCard className="space-y-4">
                <p className="font-inter font-bold text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                  Resumen
                </p>

                <div className="space-y-3 border-t border-white/20 pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-[var(--color-on-surface)]/70 font-inter">
                        Cuenta de destino
                      </p>
                      <p className="font-manrope font-bold text-[var(--color-on-surface)] mt-1">
                        {selectedAccountData.bankName}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-3 flex justify-between">
                    <p className="text-sm text-[var(--color-on-surface)]/70 font-inter">
                      Monto
                    </p>
                    <p className="font-manrope font-bold text-lg text-[var(--color-on-surface)]">
                      {formatCurrency(parseFloat(amount || "0"))}
                    </p>
                  </div>
                </div>
              </GlassCard>

              <SlideToAction
                onConfirm={handleSendConfirm}
                label="DESLIZA PARA CONFIRMAR"
                disabled={false}
                loading={isSending}
              />
            </motion.div>
          )}

          {/* Processing state */}
          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8 py-12"
            >
              <div className="flex justify-center items-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full bg-[var(--color-primary)]"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.2,
                      delay: i * 0.15,
                      repeat: Infinity,
                    }}
                  />
                ))}
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-manrope font-bold text-[var(--color-on-surface)]">
                  Enviando dinero...
                </h2>
                <p className="text-sm text-[var(--color-on-surface-variant)] font-inter">
                  Por favor espera mientras procesamos tu transferencia
                </p>
              </div>
            </motion.div>
          )}

          {/* Error state */}
          {step === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-8"
            >
              <div className="w-20 h-20 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center mx-auto">
                <Icon
                  name="error_outline"
                  size={40}
                  className="text-[var(--color-error)]"
                />
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-manrope font-bold text-[var(--color-on-surface)]">
                  No se pudo completar
                </h2>
                {errorMessage && (
                  <p className="text-sm text-[var(--color-error)] font-inter">
                    {errorMessage}
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-4">
                <button
                  onClick={() => {
                    setStep(3);
                    setErrorMessage("");
                  }}
                  className="w-full px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-manrope font-bold transition-all hover:opacity-90"
                >
                  Reintentar
                </button>

                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full px-6 py-3 rounded-xl border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] font-manrope font-bold transition-all hover:bg-[var(--color-surface-container-low)]"
                >
                  Volver al inicio
                </button>
              </div>
            </motion.div>
          )}

          {/* Success state */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-12"
            >
              <SuccessAnimation show={true} />

              <div className="space-y-3">
                <h2 className="text-3xl font-manrope font-bold text-[var(--color-on-surface)]">
                  ¡Enviado!
                </h2>
                <p className="text-lg font-manrope font-bold text-[var(--color-primary)]">
                  {formatCurrency(parseFloat(amount || "0"))}
                </p>
                <p className="text-sm text-[var(--color-on-surface-variant)] font-inter">
                  {sendMode === "user" && beneficiary
                    ? `${beneficiary.name} recibirá el dinero al instante.`
                    : `El dinero llegará en 2-3 días hábiles.`}
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-manrope font-bold transition-all hover:opacity-90"
                >
                  Volver al inicio
                </button>

                <button
                  onClick={() => {
                    setStep(1);
                    setPhone("");
                    setAmount("");
                    setMessage("");
                    setSelectedBankAccount("");
                    setSelectedAccountData(null);
                    setSubmitted(false);
                  }}
                  className="w-full px-6 py-3 rounded-xl border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] font-manrope font-bold transition-all hover:bg-[var(--color-surface-container-low)]"
                >
                  {sendMode === "user"
                    ? "Enviar a otro contacto"
                    : "Enviar a otra cuenta"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
