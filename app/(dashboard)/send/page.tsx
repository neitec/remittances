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
import { AppHeader } from "@/components/nav/AppHeader";
import { TransferProcessingScreen } from "@/components/features/TransferProcessingScreen";
import { SendSkeleton } from "@/components/motion/ShimmerSkeleton";
import Image from "next/image";

type Step = 1 | 2 | 3 | 4 | "processing" | "success" | "error";
type SendMode = "user" | "bank" | "stablecoin";

const SEND_NETWORKS = [
  { id: "eth",  label: "Ethereum", badge: "ERC-20", color: "#627eea", },
  { id: "base", label: "Base",     badge: "Base",    color: "#0052ff", },
  { id: "tron", label: "Tron",     badge: "TRC-20",  color: "#14c8b4", },
];
const SEND_COINS = [
  { id: "usdt", label: "USDT", name: "Tether",   color: "#14c8b4", icon: "T₮", mockBalance: 250.00 },
  { id: "usdc", label: "USDC", name: "USD Coin",  color: "#2775ca", icon: "$",  mockBalance: 100.00 },
  { id: "eurc", label: "EURC", name: "Euro Coin", color: "#003ec7", icon: "€",  mockBalance: 75.50  },
];

export default function SendPage() {
  const router = useRouter();
  const { data: dashboardData, isLoading: isAccountsLoading } = useAccounts();
  const { data: externalAccounts } = useExternalAccounts();
  const { data: transactionsData } = useTransactions({ type: "TRANSFER" });
  const [step, setStep] = useState<Step>(1);
  const [sendMode, setSendMode] = useState<SendMode>("user");
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>("");
  const [scCoin, setScCoin] = useState(SEND_COINS[0]);
  const [scNetwork, setScNetwork] = useState(SEND_NETWORKS[0]);
  const [scAddress, setScAddress] = useState("");
  const [scAmount, setScAmount] = useState("");
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
    setErrorMessage("");
    setStep("processing");

    // For bank mode, use the real API
    if (sendMode === "bank" && selectedAccountData) {
      const amountNum = parseFloat(amount.replace(",", "."));
      sendMoney(
        {
          beneficiaryPhone: "",
          amount: amountNum.toString(),
          currency: "EUR" as const,
          reference: message ? `mensaje: ${message}` : undefined,
        },
        {
          onSuccess: () => { setStep("success"); setSubmitted(false); },
          onError: (err) => {
            setErrorMessage(err instanceof Error ? err.message : "Error al enviar el dinero");
            setStep("error");
            setSubmitted(false);
          },
        }
      );
    }
    // For user mode, the TransferProcessingScreen handles its own flow
  };

  useEffect(() => {
    if (step === "success") {
      const timer = setTimeout(() => router.push("/dashboard"), 5000);
      return () => clearTimeout(timer);
    }
  }, [step, router]);

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
      <AppHeader />

      {/* Main content */}
      <main className="pt-[80px] px-5 pb-6 lg:pb-0 lg:pl-12 lg:pr-10">
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
                    {sendMode === "bank" ? "A CUENTA BANCARIA" : sendMode === "stablecoin" ? "TRANSFERENCIA EN STABLECOINS" : "A USUARIO REMITA"}
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
              className="space-y-[13px] pb-6 lg:pb-4 max-w-[1088px]"
            >
              {/* Page title + subtitle */}
              <div className="space-y-0.5 pb-2">
                <h1 className="font-inter font-medium text-[18px] text-[var(--color-on-surface-variant)] leading-tight pt-2">
                  Transfiere fondos desde tu wallet
                </h1>
                <p className="text-[12px] font-inter text-[var(--color-on-surface-variant)]/50">
                  Envía dinero desde tu wallet digital
                </p>
              </div>

              {/* TR1: Internal — Remita user (same style as EUR deposit card) */}
              <motion.button
                onClick={() => { setSendMode("user"); setStep(2); setPhone(""); setAmount(""); }}
                initial="rest"
                whileHover="hover"
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.18 }}
                variants={{ rest: { y: 0 }, hover: { y: -2 } }}
                className="w-full text-left relative overflow-hidden rounded-[22px] p-4 cursor-pointer"
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
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-20 -left-10 w-[460px] h-[340px] rounded-full"
                    style={{ background: "radial-gradient(ellipse at 38% 38%, rgba(0,82,255,0.13) 0%, rgba(0,82,255,0.05) 45%, transparent 70%)" }}
                  />
                  {/* Orange orb — pulled inward so it reaches center */}
                  <motion.div
                    animate={{ x: [0, -12, 9, 0], y: [0, 10, -7, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                    className="absolute -bottom-20 -right-10 w-[440px] h-[320px] rounded-full"
                    style={{ background: "radial-gradient(ellipse at 62% 62%, rgba(188,72,0,0.13) 0%, rgba(188,72,0,0.05) 45%, transparent 70%)" }}
                  />
                </motion.div>

                <div className="relative flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-[12px] flex items-center justify-center overflow-hidden" style={{ background: "rgba(0,62,199,0.06)", boxShadow: "0 4px 12px rgba(0,62,199,0.10)" }}>
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
                <div className="relative space-y-1">
                  <h3 className="font-manrope font-semibold text-[15px] text-[var(--color-on-surface)] leading-tight">A un usuario de Remita</h3>
                  <p className="text-[12px] font-inter text-[var(--color-on-surface-variant)]/70 leading-relaxed">Envío entre wallets on-chain.</p>
                </div>
                <div className="relative mt-3 pt-2.5 flex items-center justify-between" style={{ borderTop: "1px solid rgba(0,62,199,0.07)" }}>
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

              {/* TR2 + TR3: 2-col grid */}
              <div className="grid grid-cols-2 gap-[16px]">

              {/* TR2: Stablecoin on-chain transfer */}
              <motion.button
                onClick={() => { setSendMode("stablecoin"); setStep(2); setScAddress(""); setScAmount(""); }}
                initial="rest"
                whileHover="hover"
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.18 }}
                variants={{ rest: { y: 0 }, hover: { y: -2 } }}
                className="w-full text-left relative overflow-hidden rounded-[22px] p-4 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, rgba(20,200,180,0.06) 0%, rgba(0,180,160,0.02) 100%)",
                  border: "1px solid rgba(20,200,180,0.16)",
                  boxShadow: "0 4px 24px rgba(20,200,180,0.07), 0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(130deg, rgba(20,200,180,0.04) 0%, transparent 60%)" }} />
                <motion.div
                  variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 pointer-events-none overflow-hidden rounded-[22px]"
                >
                  <div className="absolute inset-0" style={{ background: "linear-gradient(130deg, rgba(20,200,180,0.07) 0%, rgba(0,180,160,0.03) 50%, transparent 100%)" }} />
                  <motion.div
                    animate={{ x: [0, -8, 5, 0], y: [0, 6, -4, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-16 -right-12 w-[380px] h-[260px] rounded-full"
                    style={{ background: "radial-gradient(ellipse at 60% 40%, rgba(20,200,180,0.12) 0%, transparent 70%)" }}
                  />
                </motion.div>

                <div className="relative flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                    style={{ background: "rgba(20,200,180,0.12)", border: "1px solid rgba(20,200,180,0.20)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M6 5h12v2.5H13.3V10c3.2.18 5.7.9 5.7 1.75S16.5 13.57 13.3 13.75V19h-2.6v-5.25C7.5 13.57 5 12.85 5 12s2.5-1.57 5.7-1.75V7.5H6V5Z" fill="rgba(20,200,180,0.9)" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(20,200,180,0.09)", border: "1px solid rgba(20,200,180,0.18)" }}>
                    <span className="w-1.5 h-1.5 rounded-full block" style={{ background: "#14c8b4" }} />
                    <span className="text-[10px] font-inter font-bold uppercase tracking-[0.1em]" style={{ color: "#0e9e92" }}>On-chain</span>
                  </div>
                </div>
                <div className="relative space-y-1">
                  <h3 className="font-manrope font-semibold text-[15px] text-[var(--color-on-surface)] leading-tight">En Stablecoins</h3>
                  <p className="text-[12px] font-inter text-[var(--color-on-surface-variant)]/70 leading-relaxed">Envía USDT, USDC o EURC directamente a cualquier wallet.</p>
                </div>
                <div className="relative mt-3 pt-2.5 flex items-center gap-1.5" style={{ borderTop: "1px solid rgba(20,200,180,0.09)" }}>
                  {["USDT","USDC","EURC"].map(t => (
                    <span key={t} className="text-[10px] font-inter font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(20,200,180,0.07)", color: "#0e9e92", border: "1px solid rgba(20,200,180,0.14)" }}>
                      {t}
                    </span>
                  ))}
                </div>
              </motion.button>

              {/* TR3: External — bank account (coming soon) */}
              <motion.button
                onClick={() => toast.info("Las transferencias bancarias estarán disponibles muy pronto", { duration: 2000 })}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.995 }}
                transition={{ duration: 0.15 }}
                className="text-left relative overflow-hidden rounded-[22px] p-4 cursor-pointer opacity-60 hover:opacity-80 transition-opacity"
                style={{ background: "rgba(248,249,250,0.5)", border: "2px dashed var(--color-outline-variant)" }}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ background: "var(--color-surface-container-high)" }}>
                      <Icon name="account_balance" size={18} className="text-[var(--color-on-surface-variant)]/35" />
                    </div>
                    <span className="text-[10px] font-inter font-bold uppercase tracking-[0.1em] px-3 py-1.5 rounded-full flex-shrink-0"
                      style={{ background: "var(--color-surface-container-highest)", color: "var(--color-on-surface-variant)" }}>
                      Próximamente
                    </span>
                  </div>
                  <h3 className="font-manrope font-semibold text-[15px] text-[var(--color-on-surface)]/50 leading-tight mb-1">
                    A una cuenta bancaria
                  </h3>
                  <p className="text-[12px] font-inter text-[var(--color-on-surface-variant)]/40 leading-relaxed">
                    Transferencias externas a usuarios fuera de Remita.
                  </p>
                </div>
              </motion.button>

              </div>{/* end 2-col grid */}

              {/* Promotional card */}
              <div
                className="relative overflow-hidden rounded-[22px] flex items-stretch"
                style={{
                  background: "linear-gradient(135deg, #FFF4ED 0%, #FFEEDD 100%)",
                  border: "1px solid rgba(188,72,0,0.12)",
                  minHeight: "150px",
                }}
              >
                {/* Left: text content */}
                <div className="relative z-10 flex-1 px-5 py-4 space-y-2 flex flex-col justify-center">
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

          {/* Step 2: Stablecoin transfer */}
          {hasBalance && step === 2 && sendMode === "stablecoin" && (
            <motion.div
              key="step2-stablecoin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
              className="pb-6 max-w-[1088px] space-y-3"
            >
              <div className="space-y-0.5 pb-1">
                <h1 className="font-inter font-medium text-[18px] text-[var(--color-on-surface-variant)] leading-tight pt-2">Envía Stablecoins</h1>
                <p className="text-[12px] font-inter text-[var(--color-on-surface-variant)]/50">Selecciona la moneda, la red y la dirección de destino.</p>
              </div>

              {/* Coin selector — top row */}
              <div>
                <p className="text-[10px] font-inter font-semibold uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]/40 mb-2 px-0.5">Moneda</p>
                <div className="flex gap-2">
                  {SEND_COINS.map((coin) => (
                    <motion.button key={coin.id} onClick={() => setScCoin(coin)}
                      whileHover={{ y: -1, scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.15 }}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-[14px] transition-colors duration-150 cursor-pointer"
                      style={{
                        background: scCoin.id === coin.id ? `rgba(${coin.id === "usdt" ? "20,200,180" : coin.id === "usdc" ? "39,117,202" : "0,62,199"},0.10)` : "rgba(0,0,0,0.03)",
                        border: `1.5px solid ${scCoin.id === coin.id ? coin.color + "35" : "rgba(0,0,0,0.07)"}`,
                        boxShadow: scCoin.id === coin.id ? `0 2px 10px ${coin.color}20` : "none",
                      }}>
                      <div className="w-7 h-7 rounded-[9px] flex items-center justify-center text-white text-[11px] font-extrabold flex-shrink-0"
                        style={{ background: coin.color, opacity: scCoin.id === coin.id ? 1 : 0.35 }}>{coin.icon}</div>
                      <span className="font-inter font-bold text-[13px] text-[var(--color-on-surface)]">{coin.label}</span>
                      <span className="text-[11px] font-inter text-[var(--color-on-surface-variant)]/45">{coin.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 2-col: form left, network+info right */}
              <div className="flex gap-6 items-stretch">

                {/* Left: address + amount + summary + button */}
                <div className="flex-[2] min-w-0 space-y-2">
                  {/* Address */}
                  <div className="rounded-[20px] overflow-hidden" style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                    <div className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                      <p className="font-inter font-bold text-[10.5px] uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]/45">Dirección de destino · {scNetwork.badge}</p>
                    </div>
                    <div className="px-4 py-3">
                      <input type="text" placeholder={`Dirección ${scNetwork.badge} del destinatario`}
                        value={scAddress} onChange={(e) => setScAddress(e.target.value)}
                        className="w-full h-10 px-4 rounded-[12px] font-mono text-[12.5px] text-[var(--color-on-surface)] border border-[var(--color-outline-variant)]/50 focus:border-[var(--color-primary)] focus:outline-none transition-colors placeholder:text-[var(--color-on-surface-variant)]/30 placeholder:font-sans"
                        style={{ background: "var(--color-surface-container-lowest)" }} />
                      {scAddress.length > 0 && scAddress.length < 26 && (
                        <p className="text-[10.5px] font-inter mt-1.5 px-1" style={{ color: "var(--color-error)" }}>Dirección demasiado corta</p>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="rounded-[20px] overflow-hidden relative"
                    style={{ background: "linear-gradient(160deg, #f5f7ff 0%, #ffffff 55%)", border: `1px solid ${scCoin.color}22`, boxShadow: `0 3px 16px ${scCoin.color}12`, transition: "border-color 0.3s" }}>
                    <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${scCoin.color}14` }}>
                      <p className="font-inter font-bold text-[10.5px] uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]/45">Cantidad</p>
                    </div>
                    <div className="px-4 pb-3 space-y-2">
                      <div className="flex items-baseline justify-center gap-1 pt-1">
                        <span className="text-[16px] font-manrope font-bold" style={{ color: scCoin.color }}>{scCoin.label}</span>
                        <input type="text" inputMode="decimal" placeholder="0.00" value={scAmount}
                          onChange={(e) => { const v = e.target.value; if (!v || /^\d*\.?\d*$/.test(v)) setScAmount(v); }}
                          className="text-[38px] font-manrope font-bold text-center text-[var(--color-on-surface)] border-0 bg-transparent outline-none placeholder:text-[var(--color-on-surface-variant)]/15 w-[150px]" />
                      </div>
                      <div className="flex justify-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full"
                          style={{ background: `rgba(${scCoin.id === "usdt" ? "20,200,180" : scCoin.id === "usdc" ? "39,117,202" : "0,62,199"},0.07)`, border: `1px solid ${scCoin.color}25` }}>
                          <Icon name="account_balance_wallet" size={11} className="flex-shrink-0" />
                          <span className="font-inter text-[11px]" style={{ color: scCoin.color }}>
                            Disponible: <strong>{scCoin.mockBalance.toFixed(2)} {scCoin.label}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  {scAddress.length >= 26 && parseFloat(scAmount) > 0 && (
                    <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="flex items-center justify-between px-4 py-3 rounded-[16px]"
                      style={{ background: `rgba(${scCoin.id === "usdt" ? "20,200,180" : scCoin.id === "usdc" ? "39,117,202" : "0,62,199"},0.07)`, border: `1px solid ${scCoin.color}25` }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white text-[11px] font-extrabold" style={{ background: scCoin.color }}>{scCoin.icon}</div>
                        <div>
                          <p className="font-manrope font-bold text-[var(--color-on-surface)] text-[13px]">{scAddress.slice(0, 8)}…{scAddress.slice(-6)}</p>
                          <p className="text-[10px] font-inter text-[var(--color-on-surface-variant)]/50">{scNetwork.label} · {scNetwork.badge}</p>
                        </div>
                      </div>
                      <p className="font-manrope font-bold text-[20px]" style={{ color: scCoin.color }}>{scAmount} {scCoin.label}</p>
                    </motion.div>
                  )}

                  {/* Button */}
                  <motion.button
                    onClick={() => toast.success("Transferencia iniciada")}
                    disabled={scAddress.length < 26 || !scAmount || parseFloat(scAmount) <= 0}
                    whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.15 }}
                    className="w-full py-3.5 rounded-[16px] font-manrope font-bold text-[14px] text-white transition-all disabled:opacity-40 disabled:pointer-events-none"
                    style={{ background: `linear-gradient(135deg, ${scCoin.color} 0%, ${scCoin.id === "usdt" ? "#0e9e92" : scCoin.id === "usdc" ? "#1a5fa8" : "#002baa"} 100%)`, boxShadow: `0 4px 16px ${scCoin.color}35` }}>
                    Transferir {scAmount ? `${scAmount} ${scCoin.label}` : scCoin.label}
                  </motion.button>
                </div>

                {/* Right: network selector + info */}
                <div className="flex-[3] min-w-0 flex flex-col gap-3 h-full">
                  <p className="text-[10px] font-inter font-semibold uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]/40 px-0.5">Red de blockchain</p>
                  <div className="rounded-[22px] overflow-hidden" style={{ background: "var(--color-surface-container-lowest)", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                    {SEND_NETWORKS.map((net, idx) => (
                      <button key={net.id} onClick={() => setScNetwork(net)}
                        className="w-full flex items-center gap-3 px-5 py-4 text-left transition-all duration-150 cursor-pointer"
                        style={{
                          background: scNetwork.id === net.id ? `rgba(${net.id === "eth" ? "98,126,234" : net.id === "base" ? "0,82,255" : "20,200,180"},0.07)` : "transparent",
                          borderBottom: idx < SEND_NETWORKS.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
                        }}>
                        <div className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0 text-white text-[13px] font-extrabold"
                          style={{ background: net.color, opacity: scNetwork.id === net.id ? 1 : 0.35 }}>
                          {net.id === "eth" ? "Ξ" : net.id === "base" ? "B" : "T"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-inter font-semibold text-[14px] text-[var(--color-on-surface)]">{net.label}</p>
                          <p className="text-[11px] font-inter text-[var(--color-on-surface-variant)]/45">{net.badge}</p>
                        </div>
                        {scNetwork.id === net.id && (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: net.color }}>
                            <Icon name="check" size={12} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 rounded-[18px] overflow-hidden flex flex-col" style={{ border: "1px solid rgba(20,200,180,0.12)" }}>
                    <div className="px-5 py-2.5" style={{ background: "rgba(20,200,180,0.06)" }}>
                      <p className="text-[10px] font-inter font-bold uppercase tracking-[0.2em]" style={{ color: "#0e9e92" }}>Importante</p>
                    </div>
                    <div className="flex-1 px-5 py-4 flex flex-col gap-3" style={{ background: "rgba(20,200,180,0.02)" }}>
                      {["Verifica siempre la dirección de destino y la red antes de enviar.", "Recibirás una notificación cuando la transferencia sea confirmada en la blockchain."].map((note, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[5px]" style={{ background: "rgba(20,200,180,0.45)" }} />
                          <p className="text-[12px] font-inter text-[var(--color-on-surface-variant)]/65 leading-relaxed">{note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
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
                          disabled={isSearching}
                          maxLength={9}
                          className="flex-1 h-10 px-4 rounded-[12px] text-[var(--color-on-surface)] font-inter text-[13px] border border-[var(--color-outline-variant)]/50 focus:border-[var(--color-primary)] focus:outline-none transition-colors placeholder:text-[var(--color-on-surface-variant)]/35"
                          style={{ background: "var(--color-surface-container-lowest)" }}
                        />
                      </div>
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
                        className="flex items-center gap-2.5 h-10 px-3.5 rounded-[12px] border transition-colors"
                        style={{ background: "var(--color-surface-container-lowest)", borderColor: "rgba(0,0,0,0.09)" }}
                      >
                        <span className="font-manrope font-bold text-[var(--color-primary)] text-[15px] leading-none">@</span>
                        <input
                          type="text"
                          placeholder="Alias de Remita"
                          value={alias}
                          onChange={(e) => setAlias(e.target.value)}
                          disabled={isSearching}
                          className="flex-1 bg-transparent text-[var(--color-on-surface)] font-inter text-[13px] outline-none placeholder:text-[var(--color-on-surface-variant)]/35"
                        />
                      </div>
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

                  {/* ── Slide CTA ── */}
                  <div className="mt-8">
                  <SlideToAction
                    onConfirm={handleSendConfirm}
                    label="DESLIZA PARA TRANSFERIR"
                    disabled={
                      !phone || phone.length < 9 || !beneficiary ||
                      !amount || parseFloat(amount.replace(",", ".")) <= 0 ||
                      parseFloat(amount.replace(",", ".")) > totalBalance
                    }
                    loading={isSending}
                  />
                  </div>
                </div>

                {/* ══ RIGHT: Support panel (desktop only, sticky) ══ */}
                <div className="hidden lg:flex lg:flex-col lg:gap-4 lg:sticky lg:top-[96px]">

                  {/* Frecuentes card */}
                  <div
                    className="rounded-[22px] p-5 space-y-4"
                    style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-inter font-bold text-[11px] uppercase tracking-widest text-[var(--color-on-surface-variant)]/50">Frecuentes y favoritos</p>
                      <button
                        onClick={() => toast.info("Ver todos los contactos próximamente")}
                        className="text-[11px] font-inter font-bold text-[var(--color-primary)] hover:opacity-65 transition-opacity"
                      >
                        Ver todos
                      </button>
                    </div>

                    <div className="flex items-start gap-3">
                      {[
                        { name: "Mateo", color: "#003ec7" },
                        { name: "Lucía", color: "#bc4800" },
                        { name: "Carlos", color: "#0d9488" },
                      ].map((contact) => (
                        <button
                          key={contact.name}
                          onClick={() => toast.info(`Seleccionando a ${contact.name}`)}
                          className="flex flex-col items-center gap-1.5 group transition-all flex-1"
                        >
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-manrope font-bold text-[16px] transition-transform group-hover:scale-105 ring-2 ring-transparent group-hover:ring-[var(--color-primary)]/20"
                            style={{ background: contact.color }}
                          >
                            {contact.name[0]}
                          </div>
                          <p className="font-inter text-[11px] font-medium text-[var(--color-on-surface)] leading-tight">{contact.name}</p>
                        </button>
                      ))}
                      <button
                        onClick={() => toast.info("Añadir nuevo contacto próximamente")}
                        className="flex flex-col items-center gap-1.5 group transition-all flex-1"
                      >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--color-surface-container-low)] transition-transform group-hover:scale-105 border border-dashed border-[rgba(0,0,0,0.15)]">
                          <Icon name="add" size={18} className="text-[var(--color-on-surface-variant)]/45" />
                        </div>
                        <p className="font-inter text-[11px] font-medium text-[var(--color-on-surface-variant)]/45 leading-tight">Nuevo</p>
                      </button>
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
              senderName="Eduardo"
              onComplete={() => router.push("/transactions")}
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
        </div>
      </main>
    </div>
  );
}
