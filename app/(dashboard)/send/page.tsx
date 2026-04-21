"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { SlideToAction } from "@/components/ui/SlideToAction";
import { GlassCard } from "@/components/ui/GlassCard";
import { useBeneficiary } from "@/lib/hooks/mutations/useBeneficiary";
import { useSendMoney } from "@/lib/hooks/mutations/useSendMoney";
import { useExternalAccounts } from "@/lib/hooks/queries/useExternalAccounts";
import { useMe } from "@/lib/hooks/queries/useMe";
import { ExternalAccountSelector } from "@/components/features/ExternalAccountSelector";
import { toast } from "sonner";
import { useAccounts } from "@/lib/hooks/queries/useAccounts";
import { useTransactions } from "@/lib/hooks/queries/useTransactions";
import { formatCurrency, maskIBAN, formatRelativeDate } from "@/lib/format";
import { ExternalAccount } from "@/lib/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/nav/AppHeader";
import { TransferProcessingScreen } from "@/components/features/TransferProcessingScreen";
import { SendSkeleton } from "@/components/motion/ShimmerSkeleton";
import Image from "next/image";

type Step = 1 | 2 | 3 | 4 | "processing" | "success" | "error";
type SendMode = "user" | "bank";

type ActiveField = "phone" | "alias" | null;

export default function SendPage() {
  const router = useRouter();
  const { data: dashboardData, isLoading: isAccountsLoading } = useAccounts();
  const { data: externalAccounts } = useExternalAccounts();
  const { data: transactionsData } = useTransactions({ type: "TRANSFER" });
  const { data: me } = useMe();
  const [step, setStep] = useState<Step>(1);
  const [transferComplete, setTransferComplete] = useState(false);
  const [sendMode, setSendMode] = useState<SendMode>("user");
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>("");
  const [selectedAccountData, setSelectedAccountData] = useState<ExternalAccount | null>(null);
  const [countryCode, setCountryCode] = useState("+34");
  const [phone, setPhone] = useState("");
  const [alias, setAlias] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [beneficiaryError, setBeneficiaryError] = useState("");
  const [activeField, setActiveField] = useState<ActiveField>(null);
  const [submitted, setSubmitted] = useState(false);
  const { mutate: searchBeneficiary, data: beneficiary, isPending: isSearching } =
    useBeneficiary();
  const { mutate: sendMoney, isPending: isSending } = useSendMoney();

  const totalBalance = dashboardData?.totalBalance ?? 0;
  const hasBalance = totalBalance > 0;
  const step3Unlocked =
    sendMode === "user" ? !!beneficiary : !!selectedAccountData;
  const senderName = [me?.name, me?.surname].filter(Boolean).join(" ") || "Usuario";

  const QUICK_AMOUNTS = [50, 100, 200, 500];

  // Handle phone change - search beneficiary when phone is complete
  const handlePhoneChange = (value: string) => {
    if (alias) return; // Alias has content, don't allow phone input
    setPhone(value);
    setActiveField(value ? "phone" : null);
    setBeneficiaryError("");
    if (value.length === 9) {
      const fullPhone = countryCode + value;
      searchBeneficiary(fullPhone, {
        onError: (error) => {
          const errorMsg = error instanceof Error ? error.message : "Contacto no encontrado";
          setBeneficiaryError(errorMsg);
        },
        onSuccess: () => {
          setBeneficiaryError("");
        },
      });
    }
  };

  // Handle alias change
  const handleAliasChange = (value: string) => {
    if (phone) return; // Phone has content, don't allow alias input
    setAlias(value);
    setActiveField(value ? "alias" : null);
    setBeneficiaryError("");
  };

  const handleSendConfirm = () => {
    if (submitted) return;
    setSubmitted(true);
    setErrorMessage("");
    setStep("processing");

    console.log("[Transfer] handleSendConfirm called", { sendMode, selectedAccountData, amount, phone, alias });

    // For user-to-user transfer
    if (sendMode === "user" && beneficiary) {
      console.log("[Transfer] Mode: user-to-user");
      const amountNum = parseFloat(amount.replace(",", "."));
      const fullPhone = phone ? countryCode + phone : null;

      if (!fullPhone) {
        setErrorMessage("Número de teléfono inválido");
        setStep("error");
        setSubmitted(false);
        return;
      }

      if (isNaN(amountNum) || amountNum <= 0) {
        setErrorMessage("Monto inválido");
        setStep("error");
        setSubmitted(false);
        return;
      }

      sendMoney(
        {
          beneficiaryPhone: fullPhone,
          amount: amountNum.toString(),
          userAlias: alias || undefined,
          reference: message || undefined,
        },
        {
          onSuccess: () => {
            console.log("[Transfer] Success");
            setTransferComplete(true);
            setSubmitted(false);
          },
          onError: (err) => {
            console.error("[Transfer] Error:", err);
            setErrorMessage(err instanceof Error ? err.message : "Error al enviar el dinero");
            setStep("error");
            setSubmitted(false);
          },
        }
      );
    }
    // For bank transfer
    else if (sendMode === "bank" && selectedAccountData) {
      console.log("[Transfer] Mode: bank transfer");
      const amountNum = parseFloat(amount.replace(",", "."));

      if (isNaN(amountNum) || amountNum <= 0) {
        setErrorMessage("Monto inválido");
        setStep("error");
        setSubmitted(false);
        return;
      }

      sendMoney(
        {
          beneficiaryPhone: selectedAccountData.accountNumber,
          amount: amountNum.toString(),
          reference: message ? `mensaje: ${message}` : undefined,
        },
        {
          onSuccess: () => {
            console.log("[Transfer] Success");
            setTransferComplete(true);
            setSubmitted(false);
          },
          onError: (err) => {
            console.error("[Transfer] Error:", err);
            setErrorMessage(err instanceof Error ? err.message : "Error al enviar el dinero");
            setStep("error");
            setSubmitted(false);
          },
        }
      );
    } else {
      console.error("[Transfer] Invalid state", { sendMode, beneficiary, selectedAccountData });
      setErrorMessage("Estado inválido para la transferencia");
      setStep("error");
      setSubmitted(false);
    }
  };

  if (isAccountsLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <AppHeader />
        <SendSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <AppHeader
        showBack={step !== 1 && step !== "processing" && step !== "success" && step !== "error"}
        onBack={() => {
          if (step === 2) setStep(1);
          else if (step === 3) setStep(2);
          else if (step === 4) setStep(3);
        }}
      />

      {/* Main content */}
      <main className="pt-[92px] px-5 pb-32 lg:pb-0 lg:pl-12 lg:pr-10">
        <div className="max-w-[1088px]">

        {/* Persistent breadcrumb nav — stays across all steps */}
        {hasBalance && typeof step === "number" && (
          <div className="pt-1 mb-5 flex items-start gap-3">
            {step === 1 ? (
              <div>
                <span
                  className="text-[11px] font-inter font-semibold uppercase tracking-[0.2em]"
                  style={{ color: "var(--color-primary)" }}
                >
                  TRANSFIERE
                </span>
                <div
                  className="mt-1.5 h-[3px] rounded-full"
                  style={{ background: "linear-gradient(90deg, #0052ff 0%, #bc4800 100%)", width: "100%" }}
                />
              </div>
            ) : (
              <>
                <div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-[11px] font-inter font-semibold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]/50 transition-colors hover:text-[var(--color-primary)]/70 cursor-pointer"
                  >
                    TRANSFIERE
                  </button>
                  <div className="mt-1.5 h-[3px] rounded-full bg-[var(--color-on-surface-variant)]/15" style={{ width: "100%" }} />
                </div>
                <span className="text-[11px] font-inter text-[var(--color-on-surface-variant)]/30 self-center">›</span>
                <div>
                  <span
                    className="text-[11px] font-inter font-semibold uppercase tracking-[0.2em]"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {sendMode === "bank" ? "A CUENTA BANCARIA" : "A USUARIO REMITA"}
                  </span>
                  <div
                    className="mt-1.5 h-[3px] rounded-full"
                    style={{ background: "linear-gradient(90deg, #0052ff 0%, #bc4800 100%)", width: "100%" }}
                  />
                </div>
              </>
            )}
          </div>
        )}

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

          {/* Step 1: Choose transfer type */}
          {hasBalance && step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3 pb-28 lg:pb-10 max-w-[1088px]"
            >
              {/* Page title + subtitle — same format as deposit */}
              <div className="space-y-1 pb-4">
                <h1 className="font-inter font-medium text-[20px] text-[var(--color-on-surface-variant)] leading-tight pt-4">
                  Transfiere fondos desde tu wallet
                </h1>
                <p className="text-[13px] font-inter text-[var(--color-on-surface-variant)]/50">
                  Envía dinero desde tu wallet digital
                </p>
              </div>

              {/* TR1: Internal — Remita user (same style as EUR deposit card) */}
              <motion.button
                onClick={() => { setSendMode("user"); setStep(2); setPhone(""); setAmount(""); setTransferComplete(false); }}
                initial="rest"
                whileHover="hover"
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.18 }}
                variants={{ rest: { y: 0 }, hover: { y: -2 } }}
                className="w-full text-left relative overflow-hidden rounded-[22px] p-5 cursor-pointer"
                style={{
                  background: "var(--color-surface-container-lowest)",
                  border: "1px solid rgba(0,62,199,0.10)",
                  boxShadow: "0 4px 24px rgba(0,62,199,0.07), 0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                {/* Static base: continuous diagonal wash */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(130deg, rgba(0,62,199,0.04) 0%, rgba(80,60,200,0.02) 50%, rgba(188,72,0,0.03) 100%)" }} />
                {/* Hover atmospheric field — one cohesive layer */}
                <motion.div
                  variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 pointer-events-none overflow-hidden rounded-[22px]"
                >
                  {/* Bridging mid-field — spans full card, ties blue+orange together */}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(130deg, rgba(0,62,199,0.06) 0%, rgba(60,40,180,0.03) 45%, rgba(188,72,0,0.05) 100%)" }} />
                  {/* Blue orb — pulled inward so it reaches center */}
                  <motion.div
                    animate={{ x: [0, 12, -5, 0], y: [0, -8, 10, 0] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute -top-20 -left-10 w-[460px] h-[340px] rounded-full"
                    style={{ background: "radial-gradient(ellipse at 38% 38%, rgba(0,82,255,0.13) 0%, rgba(0,82,255,0.05) 45%, transparent 70%)" }}
                  />
                  {/* Orange orb — pulled inward so it reaches center */}
                  <motion.div
                    animate={{ x: [0, -12, 9, 0], y: [0, 10, -7, 0] }}
                    transition={{ duration: 10, repeat: Infinity, delay: 1.5 }}
                    className="absolute -bottom-20 -right-10 w-[440px] h-[320px] rounded-full"
                    style={{ background: "radial-gradient(ellipse at 62% 62%, rgba(188,72,0,0.13) 0%, rgba(188,72,0,0.05) 45%, transparent 70%)" }}
                  />
                </motion.div>

                <div className="relative flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-[14px] flex items-center justify-center overflow-hidden" style={{ background: "rgba(0,62,199,0.06)", boxShadow: "0 4px 12px rgba(0,62,199,0.10)" }}>
                    <Image src="/remita-isologo.png" alt="Remita" width={40} height={40} className="object-contain" style={{ mixBlendMode: "multiply" }} />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "var(--color-success-bg)", border: "1px solid var(--color-success-border)" }}>
                    <span className="relative flex items-center justify-center w-2 h-2">
                      <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-ring" />
                      <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-500 block" />
                    </span>
                    <span className="text-[10px] font-inter font-bold uppercase tracking-[0.1em] text-[var(--color-success-text)]">Habilitado</span>
                  </div>
                </div>
                <div className="relative space-y-1.5">
                  <h3 className="font-manrope font-semibold text-[17px] text-[var(--color-on-surface)] leading-tight">A un usuario de Remita</h3>
                  <p className="text-[13px] font-inter text-[var(--color-on-surface-variant)]/70 leading-relaxed">Envío entre wallets on-chain.</p>
                </div>
                <div className="relative mt-4 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid rgba(0,62,199,0.07)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(0,62,199,0.09)" }}>
                      <Icon name="bolt" size={14} className="text-[var(--color-primary)]" />
                    </div>
                    <span className="text-[11px] font-inter font-semibold text-[var(--color-primary)]">Instantáneo</span>
                  </div>
                  <div className="flex items-center gap-1 text-[var(--color-primary)] font-inter font-bold text-[12px]">
                    ENVIAR <Icon name="arrow_forward" size={14} />
                  </div>
                </div>
              </motion.button>

              {/* TR2: External — bank account (coming soon) */}
              <motion.button
                onClick={() => toast.info("Las transferencias bancarias estarán disponibles muy pronto")}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.995 }}
                transition={{ duration: 0.15 }}
                className="w-full text-left relative overflow-hidden rounded-[22px] p-5 cursor-pointer"
                style={{ background: "rgba(248,249,250,0.5)", border: "2px dashed var(--color-outline-variant)" }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0" style={{ background: "var(--color-surface-container-high)" }}>
                    <Icon name="account_balance" size={22} className="text-[var(--color-on-surface-variant)]/35" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-manrope font-bold text-[var(--color-on-surface)]/50">A una cuenta bancaria</h3>
                    <p className="text-[13px] font-inter text-[var(--color-on-surface-variant)]/40 mt-1 leading-relaxed">
                      Transferencias externas a usuarios fuera de Remita. Estamos trabajando para habilitar esta opción.
                    </p>
                  </div>
                  <span
                    className="flex-shrink-0 text-[10px] font-inter font-bold uppercase tracking-[0.1em] px-3 py-1.5 rounded-full"
                    style={{ background: "var(--color-surface-container-highest)", color: "var(--color-on-surface-variant)" }}
                  >
                    Próximamente
                  </span>
                </div>
              </motion.button>

              {/* Promotional card */}
              <div
                className="relative overflow-hidden rounded-[22px] flex items-stretch"
                style={{
                  background: "linear-gradient(135deg, #FFF4ED 0%, #FFEEDD 100%)",
                  border: "1px solid rgba(188,72,0,0.12)",
                  minHeight: "190px",
                }}
              >
                {/* Left: text content */}
                <div className="relative z-10 flex-1 px-6 py-6 space-y-3 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit" style={{ background: "rgba(188,72,0,0.12)" }}>
                    <span className="w-1.5 h-1.5 rounded-full block" style={{ background: "#bc4800" }} />
                    <span className="text-[10px] font-inter font-bold uppercase tracking-[0.14em]" style={{ color: "#bc4800" }}>Promoción</span>
                  </div>
                  <h3 className="font-manrope font-bold text-[var(--color-on-surface)] text-[22px] leading-tight whitespace-nowrap">
                    1 mes sin comisiones
                  </h3>
                  <div className="w-fit space-y-2">
                    <p className="text-[12.5px] font-inter leading-relaxed" style={{ color: "rgba(60,30,0,0.55)" }}>
                      Invita a familia o amigos y ambos disfrutaréis de transferencias gratuitas.
                    </p>
                    <button
                      onClick={() => toast.info("Función de invitación próximamente disponible")}
                      className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-full font-inter font-bold text-[12px] text-white transition-all hover:opacity-90 active:scale-[0.98] w-full"
                      style={{ background: "#bc4800" }}
                    >
                      <Icon name="person_add" size={13} className="text-white" />
                      Invitar amigos
                    </button>
                  </div>
                </div>

                {/* Right: family photo */}
                <div className="relative flex-shrink-0 w-[210px] self-stretch rounded-r-[20px] overflow-hidden">
                  <Image
                    src="/familia.png"
                    alt="Familia"
                    fill
                    className="object-cover object-center"
                  />
                </div>
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

          {/* Step 2+: User mode */}
          {hasBalance && typeof step === "number" && step >= 2 && step <= 4 && sendMode === "user" && (
            <motion.div
              key="step-user"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
              className="pb-28 lg:pb-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] lg:gap-8 lg:items-start">

                {/* ══ LEFT: Main transfer flow ══ */}
                <div className="space-y-1.5 mb-8 lg:mb-0">

                  {/* ── Card 1: Destinatario ── */}
                  <div
                    className="rounded-[20px] overflow-hidden"
                    style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
                  >
                    <div className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                      <p className="font-inter font-bold text-[10.5px] uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]/45">Destinatario</p>
                    </div>
                    <div className="px-4 py-3 space-y-2.5">
                      <div className="flex gap-2">
                        <div className="relative flex-shrink-0">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="appearance-none h-10 pl-3 pr-6 rounded-[12px] text-[var(--color-on-surface)] font-inter text-[13px] font-medium border border-[var(--color-outline-variant)]/50 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                            style={{ background: "var(--color-surface-container-lowest)" }}
                          >
                            <option value="+34">🇪🇸  +34</option>
                            <option value="+1-829">🇩🇴  +1-829</option>
                          </select>
                          <svg className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 opacity-35" width="9" height="9" viewBox="0 0 24 24" fill="none">
                            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <input
                          type="tel"
                          placeholder="Número de teléfono"
                          value={phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          disabled={isSearching || activeField === "alias"}
                          maxLength={9}
                          className={`flex-1 h-10 px-4 rounded-[12px] text-[var(--color-on-surface)] font-inter text-[13px] border focus:outline-none transition-colors placeholder:text-[var(--color-on-surface-variant)]/35 ${
                            activeField === "alias" ? "opacity-40 pointer-events-none border-[var(--color-outline-variant)]/30" : "border-[var(--color-outline-variant)]/50 focus:border-[var(--color-primary)]"
                          }`}
                          style={{ background: "var(--color-surface-container-lowest)" }}
                        />
                      </div>
                      {beneficiaryError && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-1.5 text-[11px] font-inter text-[var(--color-error)] px-1"
                        >
                          <Icon name="error_outline" size={13} />
                          {beneficiaryError}
                        </motion.p>
                      )}
                      {beneficiary && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-[12px]"
                          style={{ background: "rgba(0,62,199,0.05)", border: "1px solid rgba(0,62,199,0.12)" }}
                        >
                          <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0 font-manrope font-bold text-white text-[12px]">
                            {beneficiary.name?.[0] ?? "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-manrope font-bold text-[var(--color-on-surface)] text-[13px] truncate">{beneficiary.name}</p>
                            <p className="text-[10px] text-[var(--color-on-surface-variant)]/50 font-inter">Usuario de Remita</p>
                          </div>
                          <Icon name="check_circle" size={15} className="text-[var(--color-success-text)] flex-shrink-0" filled />
                        </motion.div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px" style={{ background: "rgba(0,0,0,0.08)" }} />
                        <span className="text-[9.5px] font-inter font-bold uppercase tracking-[0.16em]" style={{ color: "rgba(0,0,0,0.25)" }}>O también</span>
                        <div className="flex-1 h-px" style={{ background: "rgba(0,0,0,0.08)" }} />
                      </div>
                      <div
                        className="flex items-center gap-2.5 h-10 px-3.5 rounded-[12px] border opacity-50 pointer-events-none border-[rgba(0,0,0,0.05)]"
                        style={{ background: "var(--color-surface-container-lowest)" }}
                      >
                        <span className="font-manrope font-bold text-[15px] leading-none text-[var(--color-on-surface-variant)]/35">@</span>
                        <input
                          type="text"
                          placeholder="Alias de Remita"
                          disabled
                          className="flex-1 bg-transparent text-[var(--color-on-surface)] font-inter text-[13px] outline-none placeholder:text-[var(--color-on-surface-variant)]/35"
                        />
                        <span className="text-[9px] font-inter font-bold uppercase tracking-[0.1em] px-2 py-1 rounded-full" style={{ background: "rgba(188,72,0,0.12)", color: "#bc4800" }}>Pronto</span>
                      </div>
                      <AnimatePresence>
                        {beneficiary && !beneficiaryError && sendMode === "user" && step === 2 && (
                          <motion.button
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            onClick={() => setStep(3)}
                            className="w-full h-11 rounded-[14px] font-manrope font-bold text-[14px] text-white bg-[var(--color-primary)] transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 mt-3 shadow-[0_4px_16px_rgba(0,62,199,0.22)]"
                          >
                            Continuar
                            <Icon name="arrow_forward" size={16} className="text-white" />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* ── Card 2: Monto ── */}
                  <div
                    className="rounded-[20px] overflow-hidden relative"
                    style={{
                      background: "linear-gradient(160deg, #f5f7ff 0%, #ffffff 55%)",
                      border: "1px solid rgba(0,62,199,0.10)",
                      boxShadow: "0 3px 16px rgba(0,62,199,0.07), 0 1px 3px rgba(0,0,0,0.03)"
                    }}
                  >
                    <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(0,62,199,0.06) 0%, transparent 70%)" }} />
                    <div className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(0,62,199,0.07)" }}>
                      <p className="font-inter font-bold text-[10.5px] uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]/45">Monto a transferir</p>
                    </div>
                    <div className="relative px-4 pb-3 space-y-2">
                      <div className="flex items-baseline justify-center gap-1 pt-1">
                        <span className="text-[20px] font-manrope font-bold" style={{ color: "var(--color-primary)" }}>€</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="0,00"
                          value={amount}
                          onChange={(e) => {
                            const val = e.target.value.replace(",", ".");
                            if (!val || /^\d*\.?\d*$/.test(val)) setAmount(val);
                          }}
                          disabled={isSending}
                          className="text-[40px] font-manrope font-bold text-center text-[var(--color-on-surface)] border-0 bg-transparent outline-none placeholder:text-[var(--color-on-surface-variant)]/15 w-[150px]"
                        />
                      </div>
                      <div className="flex justify-center">
                        <div
                          className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full"
                          style={{ background: "rgba(0,62,199,0.06)", border: "1px solid rgba(0,62,199,0.10)" }}
                        >
                          <Icon name="account_balance_wallet" size={11} className="text-[var(--color-primary)]" />
                          <span className="font-inter text-[11px]" style={{ color: "var(--color-primary)" }}>
                            Disponible: <strong>{formatCurrency(totalBalance)}</strong>
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 justify-center">
                        {QUICK_AMOUNTS.map((q) => (
                          <button
                            key={q}
                            onClick={() => setAmount(String(q))}
                            disabled={q > totalBalance}
                            className="px-3.5 py-1 rounded-[10px] font-inter font-bold text-[12px] transition-all"
                            style={
                              parseFloat(amount) === q
                                ? { background: "var(--color-primary)", color: "white", boxShadow: "0 2px 8px rgba(0,62,199,0.25)" }
                                : q > totalBalance
                                ? { background: "rgba(0,0,0,0.04)", color: "rgba(0,0,0,0.22)", cursor: "not-allowed" }
                                : { background: "rgba(0,0,0,0.05)", color: "var(--color-on-surface)" }
                            }
                          >
                            {q}€
                          </button>
                        ))}
                      </div>
                      {amount && parseFloat(amount.replace(",", ".")) > totalBalance && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 px-3.5 py-2.5 rounded-[12px] bg-[var(--color-error)]/8 border border-[var(--color-error)]/15 text-[var(--color-error)] text-[11.5px] font-inter font-medium"
                        >
                          <Icon name="warning" size={14} />
                          Saldo insuficiente.
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* ── Card 3: Concepto ── */}
                  <div
                    className="rounded-[20px] overflow-hidden"
                    style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
                  >
                    <div className="px-4 py-2.5 flex items-center gap-1.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                      <p className="font-inter font-bold text-[10.5px] uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]/45">Concepto</p>
                      <span className="text-[10px] font-inter text-[var(--color-on-surface-variant)]/30">(opcional)</span>
                    </div>
                    <div className="px-4 pb-3 pt-2">
                      <textarea
                        placeholder="Escribe un mensaje para el destinatario..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value.slice(0, 100))}
                        disabled={isSending}
                        rows={1}
                        className="w-full px-3.5 py-2 rounded-[12px] text-[var(--color-on-surface)] font-inter text-[13px] border border-[var(--color-outline-variant)]/40 focus:border-[var(--color-primary)] focus:outline-none transition-colors placeholder:text-[var(--color-on-surface-variant)]/30 resize-none"
                        style={{ background: "var(--color-surface-container-lowest)" }}
                      />
                    </div>
                  </div>

                  {/* ── Transfer summary ── */}
                  <AnimatePresence>
                    {beneficiary && amount && parseFloat(amount.replace(",", ".")) > 0 && parseFloat(amount.replace(",", ".")) <= totalBalance && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        className="flex items-center justify-between px-4 py-3 rounded-[16px]"
                        style={{ background: "rgba(0,62,199,0.05)", border: "1px solid rgba(0,62,199,0.10)" }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center font-manrope font-bold text-white text-[13px] flex-shrink-0">
                            {beneficiary.name?.[0] ?? "?"}
                          </div>
                          <div>
                            <p className="font-manrope font-bold text-[var(--color-on-surface)] text-[13px]">{beneficiary.name}</p>
                            <p className="text-[10px] font-inter text-[var(--color-on-surface-variant)]/50">Recibirá al instante</p>
                          </div>
                        </div>
                        <p className="font-manrope font-bold text-[20px]" style={{ color: "var(--color-primary)" }}>
                          {formatCurrency(parseFloat(amount.replace(",", ".")))}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Transfer CTA ── */}
                  <div className="mt-8">
                  <button
                    onClick={handleSendConfirm}
                    disabled={
                      !phone || phone.length < 9 || !beneficiary ||
                      !amount || parseFloat(amount.replace(",", ".")) <= 0 ||
                      parseFloat(amount.replace(",", ".")) > totalBalance ||
                      isSending
                    }
                    className="w-full h-[64px] rounded-full font-inter font-bold text-[10.5px] uppercase tracking-[0.24em] text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none flex items-center justify-center gap-2"
                    style={{
                      background: "linear-gradient(145deg, #d05200 0%, #e06000 55%, #bc4800 100%)",
                      boxShadow: "0 5px 18px rgba(188,72,0,0.50), 0 2px 5px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.22)",
                    }}
                  >
                    {isSending ? "Procesando..." : "TRANSFERIR FONDOS"}
                  </button>
                  </div>
                </div>

                {/* ══ RIGHT: Support panel (desktop only, sticky) ══ */}
                <div className="hidden lg:flex lg:flex-col lg:gap-4 lg:sticky lg:top-[96px]">

                  {/* Frecuentes card */}
                  <div
                    className="rounded-[22px] p-5 space-y-4 relative"
                    style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
                  >
                    {/* Blur overlay + Próximamente badge */}
                    <div className="absolute inset-0 rounded-[22px] backdrop-blur-[3px] flex items-center justify-center pointer-events-none">
                      <span
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[10px] font-inter font-bold uppercase tracking-[0.1em]"
                        style={{ background: "var(--color-surface-container-highest)", color: "var(--color-on-surface-variant)" }}
                      >
                        Próximamente
                      </span>
                    </div>

                    <div className="flex items-center justify-between opacity-50 pointer-events-none">
                      <p className="font-inter font-bold text-[11px] uppercase tracking-widest text-[var(--color-on-surface-variant)]/50">Frecuentes y favoritos</p>
                      <button
                        onClick={() => toast.info("Ver todos los contactos próximamente")}
                        className="text-[11px] font-inter font-bold text-[var(--color-primary)] hover:opacity-65 transition-opacity"
                      >
                        Ver todos
                      </button>
                    </div>

                    <div className="flex items-start gap-3">
                      {transactionsData?.pages[0]?.transactions?.slice(0, 3)?.length ? (
                        transactionsData.pages[0].transactions.slice(0, 3).map((txn) => {
                          const colors = ["#003ec7", "#bc4800", "#0d9488"];
                          const colorIdx = Math.abs(txn.id.charCodeAt(0) % 3);
                          const initial = txn.amount[0];
                          return (
                            <button
                              key={txn.id}
                              onClick={() => {
                                if (txn.type === "TRANSFER") {
                                  toast.info("Seleccionando contacto...");
                                }
                              }}
                              className="flex flex-col items-center gap-1.5 group transition-all flex-1"
                            >
                              <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-manrope font-bold text-[14px] transition-transform group-hover:scale-105 ring-2 ring-transparent group-hover:ring-[var(--color-primary)]/20"
                                style={{ background: colors[colorIdx] }}
                              >
                                {initial}
                              </div>
                              <p className="font-inter text-[11px] font-medium text-[var(--color-on-surface)] leading-tight truncate w-full text-center">
                                +{txn.amount}
                              </p>
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-center w-full text-xs text-[var(--color-on-surface-variant)]/50 py-4">
                          Aún no has enviado dinero
                        </p>
                      )}
                    </div>
                  </div>

                  {/* On-chain benefits card */}
                  <div
                    className="rounded-[18px] overflow-hidden"
                    style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
                  >
                    {/* Header */}
                    <div
                      className="px-4 py-3.5 flex items-center gap-3"
                      style={{ background: "rgba(0,62,199,0.04)", borderBottom: "1px solid rgba(0,62,199,0.08)" }}
                    >
                      <Icon name="verified_user" size={20} className="text-[var(--color-primary)]" filled />
                      <p className="font-manrope font-bold text-[15px]" style={{ color: "#003ec7" }}>
                        Transferencia on-chain
                      </p>
                    </div>

                    {/* Features */}
                    <div className="divide-y divide-[rgba(0,0,0,0.05)]">
                      {[
                        {
                          icon: "bolt",
                          title: "Liquidación instantánea",
                          body: "Los fondos se mueven en segundos entre wallets, reduciendo tiempos y fricción operativa.",
                        },
                        {
                          icon: "lock",
                          title: "Registro inmutable",
                          body: "Cada transacción queda registrada de forma permanente y verificable en la infraestructura digital.",
                        },
                        {
                          icon: "public",
                          title: "Disponibilidad 24/7",
                          body: "Opera en cualquier momento, sin depender de horarios bancarios ni ventanas operativas tradicionales.",
                        },
                      ].map(({ icon, title, body }) => (
                        <div key={title} className="flex items-start gap-3 px-4 py-3.5">
                          <div
                            className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: "rgba(0,62,199,0.07)" }}
                          >
                            <Icon name={icon} size={15} className="text-[var(--color-primary)]" filled />
                          </div>
                          <div>
                            <p className="font-manrope font-bold text-[12.5px] text-[var(--color-on-surface)] leading-tight">{title}</p>
                            <p className="text-[11px] font-inter text-[var(--color-on-surface-variant)]/55 mt-0.5 leading-relaxed">{body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
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

          {/* Processing state — user mode: full-screen premium flow */}
          {step === "processing" && sendMode === "user" && (
            <TransferProcessingScreen
              amount={parseFloat(amount.replace(",", ".")) || 0}
              recipientName={beneficiary?.name || phone}
              recipientIdentifier={alias ? `@${alias}` : `${countryCode} ${phone}`}
              senderName={senderName}
              isTransferComplete={transferComplete}
              onComplete={() => router.push("/dashboard")}
            />
          )}

          {/* Processing state — bank mode: generic spinner */}
          {step === "processing" && sendMode === "bank" && (
            <motion.div
              key="processing-bank"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8 py-12"
            >
              <div className="flex justify-center items-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full bg-[var(--color-primary)]"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-manrope font-bold text-[var(--color-on-surface)]">
                  Procesando transferencia...
                </h2>
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

        </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
