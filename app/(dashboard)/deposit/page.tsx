"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDeposit } from "@/lib/hooks/mutations/useDeposit";
import { ExternalAccountSelector } from "@/components/features/ExternalAccountSelector";
import { AppHeader } from "@/components/nav/AppHeader";
import { Icon } from "@/components/ui/Icon";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";

type Step = 1 | 2 | 3 | 4 | 5;

const isAmountStepEnabled = process.env.NEXT_PUBLIC_DEPOSIT_AMOUNT_ENABLED === 'true';

const NETWORKS = [
  { id: "eth",  label: "Ethereum", badge: "ERC-20", color: "#627eea", address: "0x3Fa4B0Yb7cD1eA2F9d8C5E6a1b4D7f3C2e0A8b9" },
  { id: "base", label: "Base",     badge: "Base",    color: "#0052ff", address: "0x9Ac2E5Fb1dB3C7A0e4D6f8b2C5a1E9d7F3b0C4e" },
  { id: "tron", label: "Tron",     badge: "TRC-20",  color: "#14c8b4", address: "TRx9KmQvN8fQzLpWbA3uYdXcJhE7gN2sRt"       },
];

const COINS = [
  { id: "usdt", label: "USDT", name: "Tether",        color: "#14c8b4", icon: "T₮" },
  { id: "usdc", label: "USDC", name: "USD Coin",       color: "#2775ca", icon: "$"  },
  { id: "eurc", label: "EURC", name: "Euro Coin",      color: "#003ec7", icon: "€"  },
];

const slideVariants = {
  initial: (dir: number) => ({ x: dir * 50, opacity: 0, scale: 0.985 }),
  animate: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir * -50, opacity: 0, scale: 0.985 }),
};

export default function DepositPage() {
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedQR, setCopiedQR] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);
  const [selectedCoin, setSelectedCoin] = useState(COINS[0]);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const { mutate: initiateDeposit, data: depositInstruction, isPending: isInitiating } = useDeposit();

  const goToStep = (newStep: Step, dir: number = 1) => {
    setDirection(dir);
    setStep(newStep);
  };

  const handleDeposit = (accountId?: string) => {
    const id = accountId ?? selectedAccount;
    if (!id) {
      toast.error("Selecciona una cuenta bancaria");
      return;
    }
    const payloadAmount = isAmountStepEnabled && amount ? amount.replace(",", ".") : "0";
    initiateDeposit(
      { externalAccountId: id, amount: payloadAmount },
      {
        onSuccess: () => goToStep(4),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleAccountConfirmed = (accountId: string) => {
    if (!accountId) {
      toast.error("Selecciona una cuenta bancaria");
      return;
    }
    if (isAmountStepEnabled) {
      setSelectedAccount(accountId);
      setAmount("");
      goToStep(5);
    } else {
      handleDeposit(accountId);
    }
  };

  const handleAmountConfirm = () => {
    const cleaned = amount.replace(",", ".").trim();
    const amountNum = parseFloat(cleaned);
    if (!cleaned || isNaN(amountNum) || amountNum <= 0) {
      toast.error("Introduce una cantidad mayor que 0");
      return;
    }
    handleDeposit(selectedAccount);
  };

  const handleNewAccountSaved = (accountId: string) => handleAccountConfirmed(accountId);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copiado");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(selectedNetwork.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  const copyQR = () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopiedQR(true);
        setTimeout(() => setCopiedQR(false), 2000);
      } catch {
        const url = canvas.toDataURL();
        const a = document.createElement("a");
        a.href = url;
        a.download = `wallet-qr-${selectedNetwork.badge}.png`;
        a.click();
        toast.success("QR descargado");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <AppHeader />

      {/* Ambient background — only on step 1 */}
      {step === 1 && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div
            className="absolute -top-32 left-1/4 w-[600px] h-[400px] rounded-full opacity-[0.055]"
            style={{
              background: "radial-gradient(ellipse, #003ec7 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div
            className="absolute top-48 right-0 w-[360px] h-[280px] rounded-full opacity-[0.035]"
            style={{
              background: "radial-gradient(ellipse, #0052ff 0%, transparent 70%)",
              filter: "blur(50px)",
            }}
          />
        </div>
      )}

      <main className="relative z-10 pt-[80px] pb-6 lg:pb-0 px-5 lg:pl-12 lg:pr-10">

        {/* Persistent breadcrumb nav — stays across all steps */}
        <div className="pt-2 mb-3 flex items-start gap-3">
          {step === 1 ? (
            <div>
              <span
                className="text-[11px] font-inter font-semibold uppercase tracking-[0.2em]"
                style={{ color: "var(--color-primary)" }}
              >
                DEPOSITA
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
                  onClick={() => goToStep(1, -1)}
                  className="text-[11px] font-inter font-semibold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]/50 transition-colors hover:text-[var(--color-primary)]/70 cursor-pointer"
                >
                  DEPOSITA
                </button>
                <div className="mt-1.5 h-[3px] rounded-full bg-[var(--color-on-surface-variant)]/15" style={{ width: "100%" }} />
              </div>
              <span className="text-[11px] font-inter text-[var(--color-on-surface-variant)]/30 self-center">›</span>
              <div>
                <span
                  className="text-[11px] font-inter font-semibold uppercase tracking-[0.2em]"
                  style={{ color: "var(--color-primary)" }}
                >
                  {step === 3 ? "DEPÓSITO EN STABLECOINS" : "DEPÓSITO DE EUROS"}
                </span>
                <div
                  className="mt-1.5 h-[3px] rounded-full"
                  style={{ background: "linear-gradient(90deg, #0052ff 0%, #bc4800 100%)", width: "100%" }}
                />
              </div>
            </>
          )}
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          {/* Step 1: Select Deposit Method */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-[16px] pb-6 lg:pb-4 max-w-[1088px]"
            >
              {/* Page title + subtitle */}
              <div className="space-y-0.5 pb-2">
                <h1 className="font-inter font-medium text-[18px] text-[var(--color-on-surface-variant)] leading-tight pt-2">
                  Añade fondos a tu wallet
                </h1>
                <p className="text-[12px] font-inter text-[var(--color-on-surface-variant)]/50">
                  Selecciona el método para añadir fondos a tu wallet
                </p>
              </div>

              {/* EUR — primary active card */}
              <motion.button
                onClick={() => {
                  setSelectedAccount("");
                  goToStep(2);
                }}
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
                {/* Static base: continuous diagonal wash — always visible, ties blue/warm together */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(130deg, rgba(0,62,199,0.04) 0%, rgba(80,60,200,0.02) 50%, rgba(188,72,0,0.03) 100%)" }}
                />

                {/* Hover atmospheric field — one cohesive layer */}
                <motion.div
                  variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 pointer-events-none overflow-hidden rounded-[22px]"
                >
                  {/* Bridging mid-field — spans full card, ties blue+warm together */}
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(130deg, rgba(0,62,199,0.06) 0%, rgba(60,40,180,0.03) 45%, rgba(188,72,0,0.05) 100%)" }}
                  />
                  {/* Blue orb — pulled inward so it reaches center */}
                  <motion.div
                    animate={{ x: [0, 12, -5, 0], y: [0, -8, 10, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-20 -left-10 w-[460px] h-[340px] rounded-full"
                    style={{ background: "radial-gradient(ellipse at 38% 38%, rgba(0,82,255,0.13) 0%, rgba(0,82,255,0.05) 45%, transparent 70%)" }}
                  />
                  {/* Warm orb — pulled inward so it reaches center */}
                  <motion.div
                    animate={{ x: [0, -12, 9, 0], y: [0, 10, -7, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                    className="absolute -bottom-20 -right-10 w-[440px] h-[320px] rounded-full"
                    style={{ background: "radial-gradient(ellipse at 62% 62%, rgba(188,72,0,0.13) 0%, rgba(188,72,0,0.05) 45%, transparent 70%)" }}
                  />
                </motion.div>
                <div className="relative flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #3d6fd4, #5b8aff)",
                      boxShadow: "0 4px 12px rgba(0,62,199,0.18)",
                    }}
                  >
                    <Icon name="euro_symbol" size={18} filled className="text-white" />
                  </div>
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: "var(--color-success-bg)", border: "1px solid var(--color-success-border)" }}
                  >
                    <span className="relative flex items-center justify-center w-2 h-2">
                      <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-ring" />
                      <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-500 block" />
                    </span>
                    <span className="text-[10px] font-inter font-bold uppercase tracking-[0.1em] text-[var(--color-success-text)]">
                      Habilitado
                    </span>
                  </div>
                </div>
                <div className="relative space-y-1">
                  <h3 className="font-manrope font-semibold text-[15px] text-[var(--color-on-surface)] leading-tight">
                    Depósito en Euros (EUR)
                  </h3>
                  <p className="text-[12px] font-inter text-[var(--color-on-surface-variant)]/70 leading-relaxed">
                    Transferencia bancaria directa vía red SEPA. Los fondos suelen acreditarse en 24h hábiles.
                  </p>
                </div>
                <div className="relative mt-3 pt-2.5 flex items-center justify-between" style={{ borderTop: "1px solid rgba(0,62,199,0.07)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(0,62,199,0.08)" }}>
                      <Icon name="security" size={14} className="text-[var(--color-primary)]" />
                    </div>
                    <span className="text-[11px] font-inter text-[var(--color-on-surface-variant)]/50">
                      Transferencia regulada · SEPA
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[var(--color-primary)] font-inter font-bold text-[12px]">
                    VER DETALLES DEL DEPÓSITO <Icon name="arrow_forward" size={14} />
                  </div>
                </div>
              </motion.button>

              {/* USDT + USD — 2-col grid */}
              <div className="grid grid-cols-2 gap-[19px]">

                {/* On-chain USDT — left */}
                <motion.button
                  onClick={() => goToStep(3)}
                  initial="rest"
                  whileHover="hover"
                  whileTap={{ scale: 0.99 }}
                  variants={{ rest: { y: 0 }, hover: { y: -2 } }}
                  transition={{ duration: 0.18 }}
                  className="text-left relative overflow-hidden rounded-[22px] p-4 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, rgba(20,200,180,0.06) 0%, rgba(0,180,160,0.02) 100%)",
                    border: "1px solid rgba(20,200,180,0.14)",
                    boxShadow: "0 4px 24px rgba(20,200,180,0.05), 0 1px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Subtle hover orbs */}
                  <motion.div
                    variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 pointer-events-none overflow-hidden rounded-[22px]"
                  >
                    <div className="absolute inset-0" style={{ background: "linear-gradient(130deg, rgba(20,200,180,0.06) 0%, rgba(0,180,160,0.02) 50%, transparent 100%)" }} />
                    <motion.div
                      animate={{ x: [0, -8, 5, 0], y: [0, 6, -4, 0] }}
                      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -top-12 -right-8 w-[260px] h-[180px] rounded-full"
                      style={{ background: "radial-gradient(ellipse at 60% 40%, rgba(20,200,180,0.10) 0%, transparent 70%)" }}
                    />
                  </motion.div>

                  <div className="relative flex items-start justify-between mb-3">
                    {/* Tether icon */}
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
                    <h3 className="font-manrope font-semibold text-[15px] text-[var(--color-on-surface)] leading-tight">Depósitos en Stablecoins</h3>
                    <p className="text-[12px] font-inter text-[var(--color-on-surface-variant)]/70 leading-relaxed">Recibe pagos internacionales en USDT, USDC o EURC</p>
                  </div>

                  <div className="relative mt-3 pt-2.5 flex items-center gap-1.5" style={{ borderTop: "1px solid rgba(20,200,180,0.09)" }}>
                    {["USDT", "USDC", "EURC"].map((t) => (
                      <span key={t} className="text-[10px] font-inter font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(20,200,180,0.07)", color: "#0e9e92", border: "1px solid rgba(20,200,180,0.14)" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </motion.button>

                {/* USD — right (existing coming soon card restyled to match) */}
                <motion.button
                  onClick={() => toast.info("Depósitos en dólares disponibles muy pronto", { duration: 2000 })}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.995 }}
                  transition={{ duration: 0.15 }}
                  className="text-left relative overflow-hidden rounded-[22px] p-4 cursor-pointer opacity-60 hover:opacity-80 transition-opacity"
                  style={{ background: "rgba(248,249,250,0.5)", border: "2px dashed var(--color-outline-variant)" }}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                        style={{ background: "var(--color-surface-container-high)" }}>
                        <Icon name="payments" size={18} className="text-[var(--color-on-surface-variant)]/35" />
                      </div>
                      <span className="text-[10px] font-inter font-bold uppercase tracking-[0.1em] px-3 py-1.5 rounded-full flex-shrink-0"
                        style={{ background: "var(--color-surface-container-highest)", color: "var(--color-on-surface-variant)" }}>
                        Próximamente
                      </span>
                    </div>
                    <h3 className="font-manrope font-semibold text-[15px] text-[var(--color-on-surface)]/50 leading-tight mb-1">
                      Depósito en Dólares (USD)
                    </h3>
                    <p className="text-[12px] font-inter text-[var(--color-on-surface-variant)]/40 leading-relaxed">
                      Transferencias ACH desde bancos de Estados Unidos.
                    </p>
                  </div>
                </motion.button>

              </div>

              {/* Secondary methods — 2-col grid */}
              <div className="grid grid-cols-2 gap-3 mt-1">
                {[
                  { icon: "alternate_email", label: "Vía Alias", sub: "Recibe de otros usuarios.", bg: "#f0f3fa" },
                  { icon: "qr_code_scanner", label: "Escaneo QR", sub: "Transferencia inmediata.", bg: "#e8efff" },
                ].map((item) => (
                  <motion.button
                    key={item.label}
                    onClick={() => toast.info(`${item.label} disponible muy pronto`, { duration: 2000 })}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="p-4 rounded-[22px] text-left opacity-70 hover:opacity-90 transition-opacity cursor-pointer"
                    style={{ background: item.bg }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2.5"
                      style={{ background: "rgba(255,255,255,0.85)", boxShadow: "0 1px 6px rgba(0,62,199,0.10)" }}>
                      <Icon name={item.icon} size={20} className="text-[var(--color-primary)]" />
                    </div>
                    <p className="font-manrope font-bold text-sm text-[var(--color-on-surface)]">{item.label}</p>
                    <p className="text-xs font-inter text-[var(--color-on-surface-variant)] mt-1">{item.sub}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Select or Add Bank Account */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
              className="max-w-[1088px]"
            >
              <ExternalAccountSelector
                selectedCountry="ES"
                selectedAccount={selectedAccount}
                onSelect={setSelectedAccount}
                onBack={() => setStep(1)}
                onContinue={() => handleAccountConfirmed(selectedAccount)}
                onNewAccountSaved={handleNewAccountSaved}
                showInlineCreate={true}
              />
            </motion.div>
          )}

          {/* Step 3: Stablecoin On-chain Deposit */}
          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
              className="pb-6 max-w-[1088px] space-y-4"
            >
              <div className="space-y-0.5 pb-1">
                <h1 className="font-inter font-medium text-[18px] text-[var(--color-on-surface-variant)] leading-tight pt-2">
                  Depósito en Stablecoins
                </h1>
                <p className="text-[12px] font-inter text-[var(--color-on-surface-variant)]/50">
                  Selecciona la moneda y red, luego envía desde cualquier wallet compatible.
                </p>
              </div>

              {/* Stablecoin selector — primary choice */}
              <div>
                <p className="text-[10px] font-inter font-semibold uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]/40 mb-2 px-0.5">
                  Moneda
                </p>
                <div className="flex gap-2">
                  {COINS.map((coin) => (
                    <motion.button
                      key={coin.id}
                      onClick={() => setSelectedCoin(coin)}
                      whileHover={{ y: -1, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-[14px] transition-colors duration-150 cursor-pointer"
                      style={{
                        background: selectedCoin.id === coin.id
                          ? `rgba(${coin.id === "usdt" ? "20,200,180" : coin.id === "usdc" ? "39,117,202" : "0,62,199"},0.10)`
                          : "rgba(0,0,0,0.03)",
                        border: `1.5px solid ${selectedCoin.id === coin.id ? coin.color + "35" : "rgba(0,0,0,0.07)"}`,
                        boxShadow: selectedCoin.id === coin.id ? `0 2px 12px ${coin.color}20` : "none",
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-[9px] flex items-center justify-center flex-shrink-0 text-white text-[11px] font-extrabold"
                        style={{ background: coin.color, opacity: selectedCoin.id === coin.id ? 1 : 0.35 }}
                      >
                        {coin.icon}
                      </div>
                      <span className="font-inter font-bold text-[13px] text-[var(--color-on-surface)]">{coin.label}</span>
                      <span className="text-[11px] font-inter text-[var(--color-on-surface-variant)]/45">{coin.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* QR + address (left) · Network selector + Importante (right) */}
              <div className="flex gap-6 items-stretch">

                {/* QR + address — hero */}
                <div
                  className="flex-[2] min-w-0 rounded-[24px] overflow-hidden relative"
                  style={{
                    background: "var(--color-surface-container-lowest)",
                    border: `1px solid ${selectedCoin.color}22`,
                    boxShadow: `0 4px 24px ${selectedCoin.color}14, 0 1px 4px rgba(0,0,0,0.04)`,
                    transition: "border-color 0.3s, box-shadow 0.3s",
                  }}
                >
                  <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, ${selectedCoin.color}07 0%, transparent 60%)` }} />
                  <div className="relative flex flex-col items-center pt-9 pb-7 px-7">
                    <div className="p-4 rounded-[18px] mb-5" style={{ background: "white", boxShadow: `0 2px 20px ${selectedCoin.color}18` }}>
                      <QRCodeCanvas
                        ref={qrCanvasRef}
                        value={selectedNetwork.address}
                        size={206}
                        fgColor="#003ec7"
                        bgColor="white"
                        level="M"
                      />
                    </div>
                    <button
                      onClick={copyAddress}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[14px] mb-4 font-inter font-semibold text-[13px] transition-all active:scale-[0.98] cursor-pointer"
                      style={{
                        background: copiedAddress ? `${selectedCoin.color}18` : "rgba(0,0,0,0.04)",
                        border: `1.5px solid ${copiedAddress ? selectedCoin.color + "35" : "rgba(0,0,0,0.07)"}`,
                        color: copiedAddress ? selectedCoin.color : "var(--color-on-surface-variant)",
                      }}
                    >
                      <Icon name={copiedAddress ? "check_circle" : "content_copy"} size={15} />
                      {copiedAddress ? "¡Dirección copiada!" : "Copiar Dirección"}
                    </button>
                    <div className="w-full rounded-[14px] overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
                      <div className="px-4 py-2" style={{ background: "rgba(0,0,0,0.02)" }}>
                        <p className="text-[10px] font-inter font-semibold uppercase tracking-[0.16em] text-[var(--color-on-surface-variant)]/40">
                          Dirección · {selectedCoin.label} · {selectedNetwork.badge}
                        </p>
                      </div>
                      <button
                        onClick={copyAddress}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left group transition-colors duration-100"
                        style={{ background: "var(--color-surface-container-lowest)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,62,199,0.04)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "var(--color-surface-container-lowest)")}
                      >
                        <p className="font-mono text-[11.5px] font-medium text-[var(--color-on-surface)] truncate">
                          {selectedNetwork.address}
                        </p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {copiedAddress ? (
                            <span className="text-[11px] font-inter font-semibold" style={{ color: selectedCoin.color }}>¡Copiado!</span>
                          ) : (
                            <Icon name="content_copy" size={13} className="text-[var(--color-on-surface-variant)]/30 group-hover:text-[var(--color-primary)]/60 transition-colors" />
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: network selector + importante */}
                <div className="flex-[3] min-w-0 flex flex-col gap-3 h-full">
                  <p className="text-[10px] font-inter font-semibold uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]/40 px-0.5">
                    Red de blockchain
                  </p>
                  <div
                    className="rounded-[22px] overflow-hidden"
                    style={{
                      background: "var(--color-surface-container-lowest)",
                      border: "1px solid rgba(0,0,0,0.05)",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    }}
                  >
                    {NETWORKS.map((net, idx) => (
                      <button
                        key={net.id}
                        onClick={() => { setSelectedNetwork(net); setCopiedAddress(false); }}
                        className="w-full flex items-center gap-3 px-5 py-4 text-left transition-all duration-150 cursor-pointer"
                        style={{
                          background: selectedNetwork.id === net.id ? `rgba(${net.id === "eth" ? "98,126,234" : net.id === "base" ? "0,82,255" : "20,200,180"},0.07)` : "transparent",
                          borderBottom: idx < NETWORKS.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0 text-white text-[13px] font-extrabold"
                          style={{ background: net.color, opacity: selectedNetwork.id === net.id ? 1 : 0.35 }}
                        >
                          {net.id === "eth" ? "Ξ" : net.id === "base" ? "B" : "T"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-inter font-semibold text-[14px] text-[var(--color-on-surface)]">{net.label}</p>
                          <p className="text-[11px] font-inter text-[var(--color-on-surface-variant)]/45">{net.badge}</p>
                        </div>
                        {selectedNetwork.id === net.id && (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: net.color }}>
                            <Icon name="check" size={12} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Importante — justo debajo de la red, crece hasta el final */}
                  <div className="flex-1 rounded-[18px] overflow-hidden flex flex-col" style={{ border: "1px solid rgba(20,200,180,0.12)" }}>
                    <div className="px-5 py-2.5" style={{ background: "rgba(20,200,180,0.06)" }}>
                      <p className="text-[10px] font-inter font-bold uppercase tracking-[0.2em]" style={{ color: "#0e9e92" }}>Importante</p>
                    </div>
                    <div className="flex-1 px-5 py-4 flex flex-col gap-3" style={{ background: "rgba(20,200,180,0.02)" }}>
                      {[
                        "Envía únicamente stablecoins por la red seleccionada. Otras redes pueden causar pérdida de fondos.",
                        "Recibirás una notificación cuando los fondos estén disponibles en tu cuenta.",
                      ].map((note, idx) => (
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

          {/* Step 5: Amount input (only when NEXT_PUBLIC_DEPOSIT_AMOUNT_ENABLED=true) */}
          {step === 5 && (
            <motion.div
              key="step5"
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
              className="pb-6 max-w-[560px] space-y-5"
            >
              <div className="space-y-0.5 pb-1">
                <h1 className="font-inter font-medium text-[18px] text-[var(--color-on-surface-variant)] leading-tight pt-2">
                  ¿Cuánto quieres depositar?
                </h1>
                <p className="text-[12px] font-inter text-[var(--color-on-surface-variant)]/50">
                  Introduce el importe en euros que vas a transferir desde tu banco.
                </p>
              </div>

              <div
                className="rounded-[22px] p-6"
                style={{
                  background: "var(--color-surface-container-lowest)",
                  border: "1px solid rgba(0,62,199,0.10)",
                  boxShadow: "0 4px 24px rgba(0,62,199,0.05), 0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <label
                  htmlFor="deposit-amount"
                  className="block text-[10px] font-inter font-semibold uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]/45 mb-3"
                >
                  Cantidad
                </label>
                <div className="flex items-center gap-3">
                  <span className="font-manrope font-extrabold text-[28px] text-[var(--color-on-surface-variant)]/35 leading-none">€</span>
                  <input
                    id="deposit-amount"
                    type="text"
                    inputMode="decimal"
                    autoFocus
                    value={amount}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^\d.,]/g, "");
                      setAmount(v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAmountConfirm();
                    }}
                    placeholder="0,00"
                    className="flex-1 bg-transparent font-manrope font-extrabold text-[34px] text-[var(--color-on-surface)] outline-none placeholder:text-[var(--color-on-surface-variant)]/20"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => goToStep(2, -1)}
                  className="flex-1 py-3 rounded-[14px] font-inter font-semibold text-[13px] text-[var(--color-on-surface-variant)] cursor-pointer transition-colors hover:bg-[rgba(0,0,0,0.04)]"
                  style={{ border: "1px solid rgba(0,0,0,0.08)" }}
                >
                  Atrás
                </button>
                <button
                  onClick={handleAmountConfirm}
                  disabled={isInitiating}
                  className="flex-1 py-3 rounded-[14px] font-inter font-bold text-[13px] text-white cursor-pointer transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #003ec7 0%, #1252e8 100%)",
                    boxShadow: "0 4px 12px rgba(0,62,199,0.20)",
                  }}
                >
                  {isInitiating ? "Generando..." : "Continuar"}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Deposit Details */}
          {step === 4 && depositInstruction && (
            <motion.div
              key="step4"
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-4 pb-20 max-w-[1088px]"
            >
              {/* Header */}
              <div className="space-y-1 pb-1">
                <h1 className="font-inter font-medium text-[20px] text-[var(--color-on-surface-variant)] leading-tight pt-4">
                  Detalles del depósito
                </h1>
                <p className="text-[13px] font-inter text-[var(--color-on-surface-variant)]/50">
                  Utiliza los siguientes datos para completar la transferencia. El Reference ID es requerido para que se efectúe correctamente.
                </p>
              </div>

              {/* Reference ID card + timing box — side by side */}
              <div className="flex gap-3 items-stretch">

                {/* Reference ID card — Hero style */}
                <div
                  className="flex-1 rounded-[22px] relative overflow-hidden"
                  style={{
                    background: "linear-gradient(145deg, #001462 0%, #003ec7 52%, #1252e8 100%)",
                    boxShadow: "0 8px 32px rgba(0,62,199,0.32), 0 2px 8px rgba(0,0,0,0.10)",
                  }}
                >
                  {/* Layer: top-left light orb */}
                  <motion.div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: "220px", height: "220px",
                      top: "-70px", left: "-50px",
                      background: "radial-gradient(circle, rgba(100,168,255,0.22) 0%, transparent 68%)",
                    }}
                    animate={{ x: [0, 20, 6, 0], y: [0, 14, 28, 0] }}
                    transition={{ duration: 16, ease: "easeInOut", repeat: Infinity }}
                  />
                  {/* Layer: bottom-right depth orb */}
                  <motion.div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: "260px", height: "260px",
                      bottom: "-100px", right: "-70px",
                      background: "radial-gradient(circle, rgba(0,48,190,0.52) 0%, transparent 68%)",
                    }}
                    animate={{ x: [0, -16, -28, 0], y: [0, -10, -20, 0] }}
                    transition={{ duration: 22, ease: "easeInOut", repeat: Infinity, delay: 2.5 }}
                  />
                  {/* Layer: orange warm bloom */}
                  <motion.div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: "200px", height: "200px",
                      top: "-40px", right: "10%",
                      background: "radial-gradient(circle, rgba(255,185,110,0.09) 0%, rgba(255,140,60,0.04) 45%, transparent 68%)",
                    }}
                    animate={{ x: [0, -18, -30, -18, 0], y: [0, 20, 10, -4, 0] }}
                    transition={{ duration: 19, ease: "easeInOut", repeat: Infinity, delay: 1.2 }}
                  />
                  {/* Layer: grid */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)`,
                      backgroundSize: "28px 28px",
                    }}
                  />
                  {/* Layer: particles */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[
                      { left: "8%",  bottom: "20%", delay: "0s",   dur: "5.2s", size: "1.5px" },
                      { left: "22%", bottom: "55%", delay: "1.8s", dur: "4.8s", size: "2px"   },
                      { left: "40%", bottom: "25%", delay: "3.2s", dur: "5.6s", size: "1.5px" },
                      { left: "60%", bottom: "70%", delay: "0.6s", dur: "4.4s", size: "2px"   },
                      { left: "75%", bottom: "35%", delay: "2.5s", dur: "5.0s", size: "1.5px" },
                    ].map((p, i) => (
                      <span
                        key={i}
                        className="absolute rounded-full"
                        style={{
                          width: p.size, height: p.size,
                          background: "rgba(255,255,255,0.80)",
                          left: p.left, bottom: p.bottom,
                          animation: `transfer-flow ${p.dur} ease-in-out ${p.delay} infinite`,
                        }}
                      />
                    ))}
                  </div>
                  {/* Layer: diagonal sweep */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                      className="absolute inset-y-0 w-[30%]"
                      style={{
                        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.045) 50%, transparent 100%)",
                        skewX: "-18deg",
                      }}
                      initial={{ x: "-100%" }}
                      animate={{ x: "700%" }}
                      transition={{ duration: 3.5, ease: "linear", repeat: Infinity, repeatDelay: 11 }}
                    />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-[10px] font-inter font-bold uppercase tracking-[0.22em] text-white/50">
                        Reference ID ·{" "}
                      </p>
                      <span className="text-[10px] font-inter font-bold uppercase tracking-[0.22em]" style={{ color: "#ff8c42" }}>
                        Obligatorio
                      </span>
                    </div>
                    <p className="font-mono font-extrabold text-[22px] tracking-[0.07em] text-white leading-none mb-4">
                      {depositInstruction.deposit_message}
                    </p>
                    <button
                      onClick={() => copyToClipboard(depositInstruction.deposit_message)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[12px] font-inter font-semibold text-[12px] transition-all active:scale-[0.98]"
                      style={{ background: "rgba(255,255,255,0.13)", color: "white" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.20)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.13)")}
                    >
                      <Icon name="content_copy" size={14} />
                      Copiar Reference ID
                    </button>
                    <p className="text-[10px] font-inter text-white/35 text-center mt-2.5">
                      Incluye este código en el <span className="text-white/60 font-semibold">concepto</span> de tu transferencia
                    </p>
                  </div>
                </div>

                {/* Timing + SEPA info box */}
                <div
                  className="w-[175px] flex-shrink-0 rounded-[22px] flex flex-col justify-between p-5"
                  style={{
                    background: "var(--color-surface-container-lowest)",
                    border: "1px solid rgba(0,0,0,0.05)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  }}
                >
                  <div>
                    <div className="w-8 h-8 rounded-[10px] flex items-center justify-center mb-3" style={{ background: "rgba(245,158,11,0.10)" }}>
                      <Icon name="schedule" size={16} className="text-amber-500" />
                    </div>
                    <p className="text-[10px] font-inter font-semibold uppercase tracking-[0.14em] text-[var(--color-on-surface-variant)]/40 mb-1">
                      Plazo
                    </p>
                    <p className="font-manrope font-extrabold text-[15px] text-[var(--color-on-surface)] leading-tight">
                      1–2 días hábiles
                    </p>
                  </div>
                  <div
                    className="mt-4 pt-3 flex items-center gap-1.5"
                    style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 block flex-shrink-0" />
                    <span className="text-[10px] font-inter font-bold uppercase tracking-[0.10em] text-[var(--color-on-surface-variant)]/50">
                      SEPA
                    </span>
                  </div>
                </div>
              </div>

              {/* Bank details */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-inter font-semibold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]/40 px-0.5">
                  Datos bancarios del destinatario
                </p>
                <div
                  className="rounded-[20px] overflow-hidden"
                  style={{
                    background: "var(--color-surface-container-lowest)",
                    border: "1px solid rgba(0,0,0,0.05)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  }}
                >
                  {[
                    { label: "Nombre del banco", value: depositInstruction.bank_name, icon: "account_balance" },
                    { label: "Dirección", value: depositInstruction.bank_address, icon: "location_on" },
                    { label: "IBAN", value: depositInstruction.iban, icon: "credit_card", mono: true },
                    { label: "Beneficiario", value: depositInstruction.account_holder_name, icon: "person" },
                  ].map((field, idx, arr) => (
                    <button
                      key={idx}
                      onClick={() => copyToClipboard(field.value)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-left group transition-colors duration-100 hover:bg-[rgba(0,62,199,0.07)]"
                      style={idx < arr.length - 1 ? { borderBottom: "1px solid rgba(0,0,0,0.04)" } : {}}
                    >
                      <div className="w-7 h-7 rounded-[9px] flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,62,199,0.06)" }}>
                        <Icon name={field.icon} size={13} className="text-[var(--color-primary)]/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-inter font-semibold uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]/40 mb-0.5">
                          {field.label}
                        </p>
                        <p className={`text-[13px] font-medium text-[var(--color-on-surface)] truncate ${field.mono ? "font-mono tracking-wide" : "font-inter"}`}>
                          {field.value}
                        </p>
                      </div>
                      <Icon name="content_copy" size={12} className="text-[var(--color-on-surface-variant)]/20 group-hover:text-[var(--color-primary)]/60 transition-colors flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Important notes */}
              <div
                className="rounded-[18px] overflow-hidden"
                style={{ border: "1px solid rgba(188,72,0,0.12)" }}
              >
                <div
                  className="px-5 py-2.5"
                  style={{ background: "rgba(188,72,0,0.06)" }}
                >
                  <p className="text-[10px] font-inter font-bold uppercase tracking-[0.2em]" style={{ color: "#bc4800" }}>
                    Importante
                  </p>
                </div>
                <div
                  className="px-5 py-4 space-y-3"
                  style={{ background: "rgba(188,72,0,0.025)" }}
                >
                  {[
                    "Transfiere solo desde una cuenta bancaria registrada a tu nombre.",
                    "Las transferencias sin el Reference ID pueden ser devueltas.",
                    "Recibirás una notificación cuando los fondos estén disponibles.",
                  ].map((note, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[5px]" style={{ background: "rgba(188,72,0,0.35)" }} />
                      <p className="text-[12.5px] font-inter text-[var(--color-on-surface-variant)]/65 leading-relaxed">{note}</p>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
