"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDeposit } from "@/lib/hooks/useDeposit";
import { ExternalAccountSelector } from "@/components/features/ExternalAccountSelector";
import { AppHeader } from "@/components/nav/AppHeader";
import { Icon } from "@/components/ui/Icon";
import { toast } from "sonner";

type DepositMethod = "EUR" | "DOP";
type Step = 1 | 2 | 4;

const DEPOSIT_METHODS = [
  {
    id: "EUR" as DepositMethod,
    label: "Depósito en Euros (EUR)",
    description: "Transferencia bancaria directa vía red SEPA. Los fondos suelen acreditarse en 24h hábiles.",
    icon: "euro_symbol",
    disabled: false,
    badge: "HABILITADO",
  },
  {
    id: "DOP" as DepositMethod,
    label: "Próximamente",
    description: "Depósitos en pesos dominicanos",
    icon: "payments",
    disabled: true,
    badge: "PRÓXIMAMENTE",
  },
];

const slideVariants = {
  initial: (dir: number) => ({ x: dir * 50, opacity: 0, scale: 0.985 }),
  animate: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir * -50, opacity: 0, scale: 0.985 }),
};

export default function DepositPage() {
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<DepositMethod>("EUR");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const { mutate: initiateDeposit, isPending, data: depositInstruction } = useDeposit();

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
    initiateDeposit(
      { externalAccountId: id, amount: "0" },
      {
        onSuccess: () => goToStep(4),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleNewAccountSaved = (accountId: string) => handleDeposit(accountId);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copiado");
    } catch {
      toast.error("No se pudo copiar");
    }
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

      <main className="relative z-10 pt-[92px] pb-24 lg:pb-0 px-5 lg:pl-12 lg:pr-10">

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
                  DEPÓSITO DE EUROS
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
              className="space-y-3 pb-28 lg:pb-10 max-w-[1088px]"
            >
              {/* Page title + subtitle */}
              <div className="space-y-1 pb-4">
                <h1 className="font-inter font-medium text-[20px] text-[var(--color-on-surface-variant)] leading-tight pt-4">
                  Añade fondos a tu wallet
                </h1>
                <p className="text-[13px] font-inter text-[var(--color-on-surface-variant)]/50">
                  Selecciona el método para añadir fondos a tu wallet
                </p>
              </div>

              {/* EUR — primary active card */}
              <motion.button
                onClick={() => {
                  setSelectedMethod("EUR");
                  setSelectedAccount("");
                  goToStep(2);
                }}
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
                <div className="relative flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #3d6fd4, #5b8aff)",
                      boxShadow: "0 4px 12px rgba(0,62,199,0.18)",
                    }}
                  >
                    <Icon name="euro_symbol" size={22} filled className="text-white" />
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
                <div className="relative space-y-1.5">
                  <h3 className="font-manrope font-semibold text-[17px] text-[var(--color-on-surface)] leading-tight">
                    Depósito en Euros (EUR)
                  </h3>
                  <p className="text-[13px] font-inter text-[var(--color-on-surface-variant)]/70 leading-relaxed">
                    Transferencia bancaria directa vía red SEPA. Los fondos suelen acreditarse en 24h hábiles.
                  </p>
                </div>
                <div className="relative mt-4 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid rgba(0,62,199,0.07)" }}>
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

              {/* USD — coming soon */}
              <motion.button
                onClick={() => toast.info("Depósitos en dólares estarán disponibles muy pronto")}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.995 }}
                transition={{ duration: 0.15 }}
                className="w-full text-left relative overflow-hidden rounded-[22px] p-5 cursor-pointer"
                style={{
                  background: "rgba(248,249,250,0.5)",
                  border: "2px dashed var(--color-outline-variant)",
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--color-surface-container-high)" }}
                  >
                    <Icon name="payments" size={22} className="text-[var(--color-on-surface-variant)]/35" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-manrope font-bold text-[var(--color-on-surface)]/50">
                      Depósito en Dólares (USD)
                    </h3>
                    <p className="text-[13px] font-inter text-[var(--color-on-surface-variant)]/40 mt-1 leading-relaxed">
                      Transferencias ACH desde bancos de Estados Unidos. Estamos trabajando para habilitar esta opción.
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

              {/* Secondary methods — 2-col grid + phone */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { icon: "alternate_email", label: "Vía Alias", sub: "Recibe de otros usuarios.", bg: "#f0f3fa" },
                  { icon: "qr_code_scanner", label: "Escaneo QR", sub: "Transferencia inmediata.", bg: "#e8efff" },
                ].map((item) => (
                  <motion.button
                    key={item.label}
                    onClick={() => toast.info(`${item.label} estará disponible muy pronto`)}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="p-4 rounded-[22px] text-left opacity-70 hover:opacity-90 transition-opacity cursor-pointer"
                    style={{ background: item.bg }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mb-2.5"
                      style={{
                        background: "rgba(255,255,255,0.85)",
                        boxShadow: "0 1px 6px rgba(0,62,199,0.10)",
                      }}
                    >
                      <Icon name={item.icon} size={20} className="text-[var(--color-primary)]" />
                    </div>
                    <p className="font-manrope font-bold text-sm text-[var(--color-on-surface)]">{item.label}</p>
                    <p className="text-xs font-inter text-[var(--color-on-surface-variant)] mt-1">{item.sub}</p>
                  </motion.button>
                ))}
              </div>

              <motion.button
                onClick={() => toast.info("Depósitos por teléfono estarán disponibles muy pronto")}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.995 }}
                transition={{ duration: 0.15 }}
                className="w-full text-left rounded-[22px] p-4 opacity-70 hover:opacity-90 transition-opacity cursor-pointer"
                style={{ background: "var(--color-surface-container-lowest)", border: "1px solid rgba(0,0,0,0.05)" }}
              >
                <div className="flex items-center gap-3">
                  <Icon name="phone_iphone" size={24} className="text-[var(--color-on-surface-variant)]" />
                  <div>
                    <p className="font-manrope font-bold text-sm text-[var(--color-on-surface)]">Número de Teléfono</p>
                    <p className="text-xs font-inter text-[var(--color-on-surface-variant)] mt-0.5">Contactos rápidos.</p>
                  </div>
                  <Icon name="chevron_right" size={24} className="text-[var(--color-on-surface-variant)] ml-auto" />
                </div>
              </motion.button>
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
                onContinue={() => handleDeposit()}
                onNewAccountSaved={handleNewAccountSaved}
                showInlineCreate={true}
              />
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
                    { label: "BIC / SWIFT", value: depositInstruction.bic, icon: "swap_horiz", mono: true },
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
