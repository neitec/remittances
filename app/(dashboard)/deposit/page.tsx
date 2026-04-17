"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDeposit } from "@/lib/hooks/useDeposit";
import { maskIBAN, formatCurrency } from "@/lib/format";
import { ExternalAccountSelector } from "@/components/features/ExternalAccountSelector";
import { ExternalAccount } from "@/lib/types";
import { TopAppBar } from "@/components/nav/TopAppBar";
import { Icon } from "@/components/ui/Icon";
import { GlassCard } from "@/components/ui/GlassCard";
import { SlideToAction } from "@/components/ui/SlideToAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type DepositMethod = "EUR" | "DOP";
type Step = 1 | 2 | 3 | 4;

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

export default function DepositPage() {
  const [step, setStep] = useState<Step>(1);
  const [selectedMethod, setSelectedMethod] = useState<DepositMethod>("EUR");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [selectedAccountData, setSelectedAccountData] = useState<ExternalAccount | null>(null);
  const [amount, setAmount] = useState("");
  const { mutate: initiateDeposit, isPending, data: depositInstruction } = useDeposit();

  const handleContinue = () => {
    if (!selectedAccount) {
      toast.error("Selecciona una cuenta bancaria");
      return;
    }
    setStep(3);
  };

  const handleDeposit = () => {
    if (!amount) {
      toast.error("Ingresa un monto");
      return;
    }
    initiateDeposit(
      {
        externalAccountId: selectedAccount,
        amount: amount.replace(",", "."),
      },
      {
        onSuccess: () => setStep(4),
        onError: (err) => toast.error(err.message),
      }
    );
  };

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
      <TopAppBar title="Depositar" onBack={() => (step === 1 ? undefined : setStep(Math.max(1, step - 1) as Step))} />

      <main className="pt-24 pb-24 lg:pb-0 px-6 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Deposit Method */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="space-y-6">
                {/* DEP2: EUR Card with badge top-right and CTA link */}
                {DEPOSIT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => {
                      if (!method.disabled) {
                        setSelectedMethod(method.id);
                        setSelectedAccount("");
                        setSelectedAccountData(null);
                        setStep(2);
                      } else {
                        toast.info(`${method.label} estará disponible muy pronto`);
                      }
                    }}
                    disabled={method.disabled && false}
                    className={cn(
                      "w-full p-6 rounded-3xl text-left transition-all relative",
                      method.disabled && "opacity-70"
                    )}
                    style={{
                      background: method.disabled
                        ? "rgba(248, 249, 250, 0.5)"
                        : "rgba(255, 255, 255, 0.7)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      border: method.id === "DOP" && !method.disabled ? "2px dashed var(--color-outline-variant)" : method.disabled
                        ? "1px solid rgba(195, 198, 215, 0.15)"
                        : "1px solid rgba(195, 198, 215, 0.3)",
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",
                          method.disabled
                            ? "bg-[var(--color-surface-container-highest)]"
                            : "bg-[var(--color-primary)]/10"
                        )}
                      >
                        <Icon
                          name={method.icon}
                          size={24}
                          filled={!method.disabled}
                          className={method.disabled ? "text-[var(--color-outline)]" : "text-[var(--color-primary)]"}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-manrope font-bold text-[var(--color-on-surface)]">
                          {method.label}
                        </h3>
                        <p className="text-sm text-[var(--color-on-surface-variant)] mt-1 font-inter">
                          {method.description}
                        </p>
                        {!method.disabled && method.id === "EUR" && (
                          <div className="flex items-center gap-1 text-[var(--color-primary)] font-inter font-bold text-sm mt-3 pointer-events-none">
                            GESTIONAR TRANSFERENCIA <Icon name="arrow_forward" size={16} />
                          </div>
                        )}
                        {method.badge && (
                          <div
                            className={cn(
                              "absolute top-6 right-6 inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                              method.disabled
                                ? "bg-[var(--color-surface-container-highest)] text-[var(--color-secondary)]"
                                : "bg-[var(--color-success-bg)] text-[var(--color-success-text)] border border-[var(--color-success-border)]"
                            )}
                          >
                            {method.badge}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}

                {/* DEP1: Secondary options - Grid 2 cols + full width */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button
                    onClick={() => toast.info("Depósitos vía alias estarán disponibles muy pronto")}
                    className="p-5 rounded-[2rem] opacity-70 cursor-pointer hover:opacity-80 transition-opacity" style={{ background: "#f0f3fa" }}>
                    <Icon name="alternate_email" size={24} className="mb-3" />
                    <p className="font-manrope font-bold text-sm">Vía Alias</p>
                    <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">Transferencia por alias</p>
                  </button>
                  <button
                    onClick={() => toast.info("Escaneo QR estará disponible muy pronto")}
                    className="p-5 rounded-[2rem] opacity-70 cursor-pointer hover:opacity-80 transition-opacity" style={{ background: "#e8efff" }}>
                    <Icon name="qr_code_scanner" size={24} className="mb-3" />
                    <p className="font-manrope font-bold text-sm">Escaneo QR</p>
                    <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">Código QR dinámico</p>
                  </button>
                </div>

                {/* DEP1: Full-width Teléfono option */}
                <button
                  onClick={() => toast.info("Depósitos por teléfono estarán disponibles muy pronto")}
                  className="w-full p-5 rounded-3xl bg-[var(--color-surface-container-lowest)] flex items-center justify-between opacity-70 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-3">
                    <Icon name="phone_iphone" size={24} />
                    <div>
                      <p className="font-manrope font-bold text-sm">Número de Teléfono</p>
                      <p className="text-xs text-[var(--color-on-surface-variant)]">Envía dinero por teléfono</p>
                    </div>
                  </div>
                  <Icon name="chevron_right" size={24} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Select or Add Bank Account */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ExternalAccountSelector
                selectedCountry="ES"
                selectedAccount={selectedAccount}
                onSelect={setSelectedAccount}
                onSelectFull={setSelectedAccountData}
                onBack={() => setStep(1)}
                onContinue={handleContinue}
                showInlineCreate={true}
              />
            </motion.div>
          )}

          {/* Step 3: Enter Amount */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pb-28 lg:pb-6"
            >
              {selectedAccountData && (
                <div
                  className="p-5 rounded-2xl bg-[var(--color-surface-container-lowest)] flex items-center justify-between cursor-pointer hover:bg-[var(--color-surface-container-low)] transition-colors group"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="flex-1">
                    <p className="text-xs text-[var(--color-on-surface-variant)] font-inter font-bold uppercase tracking-widest mb-2">
                      Cuenta destino
                    </p>
                    <p className="font-manrope font-bold text-[var(--color-on-surface)]">{selectedAccountData.bankName}</p>
                    <p className="text-xs text-[var(--color-on-surface-variant)] mt-1 font-inter">
                      {maskIBAN(selectedAccountData.accountNumber || "")}
                    </p>
                  </div>
                  {/* DEP6: expand_more indicator */}
                  <Icon name="expand_more" size={24} className="text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-primary)] transition-colors" />
                </div>
              )}

              <div className="space-y-3">
                <p className="text-xs text-[var(--color-on-surface-variant)] font-inter font-bold uppercase tracking-widest">
                  CANTIDAD A DEPOSITAR
                </p>
                <div className="flex items-baseline justify-center gap-2 p-6 rounded-2xl bg-[var(--color-surface-container-low)]">
                  <span className="text-4xl text-[var(--color-on-surface-variant)] font-manrope font-extrabold">€</span>
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
                    disabled={isPending}
                    className="text-5xl sm:text-6xl font-manrope font-extrabold text-center text-[var(--color-on-surface)] border-0 bg-transparent outline-none w-full placeholder-[var(--color-surface-container-highest)]"
                  />
                </div>

                <div className="flex gap-2 justify-center flex-wrap">
                  {[10, 50, 100].map((quickAmount) => (
                    <button
                      key={quickAmount}
                      onClick={() => setAmount(quickAmount.toString())}
                      className="px-4 py-1.5 rounded-full bg-[var(--color-surface-container-low)] text-xs font-bold text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] active:scale-95 transition-all font-inter"
                    >
                      +{quickAmount}€
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="p-4 rounded-2xl bg-[var(--color-surface-container-low)] flex gap-3"
              >
                <Icon name="info" size={20} className="text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[var(--color-on-surface-variant)] font-inter">
                  Cantidad mínima: €10. Transferencias SEPA sin comisiones ocultas.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Fixed bottom action bar */}
          {step === 3 && (
            <div
              className="fixed bottom-0 left-0 right-0 lg:left-64 px-6 pt-4 pb-24 lg:pb-10 z-40 pb-safe"
              style={{
                background: "linear-gradient(to top, var(--color-background), transparent)",
              }}
            >
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                <Button
                  onClick={() => setStep(2)}
                  className="h-14 rounded-xl bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] font-bold border border-[var(--color-outline-variant)]/15"
                >
                  Atrás
                </Button>
                <Button
                  onClick={handleDeposit}
                  disabled={isPending || !amount}
                  className="h-14 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] text-white font-bold"
                >
                  {isPending ? "Procesando..." : "Continuar"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: SEPA Instructions - Redesigned */}
          {step === 4 && depositInstruction && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pb-28 lg:pb-6"
            >
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mx-auto">
                  <Icon name="check_circle" size={32} className="text-[var(--color-success)]" filled />
                </div>
                <h2 className="font-manrope font-bold text-2xl text-[var(--color-on-surface)]">
                  Detalles de tu transferencia
                </h2>
                <p className="text-sm text-[var(--color-on-surface-variant)] font-inter">
                  Completa esta transferencia SEPA desde tu banco
                </p>
              </div>

              {/* Reference ID - Highlighted Card */}
              <div className="rounded-3xl p-6 border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/5">
                <p className="text-xs text-[var(--color-on-surface-variant)] font-inter font-bold uppercase tracking-widest mb-3">
                  📋 Código de referencia (OBLIGATORIO)
                </p>
                <div className="space-y-4">
                  <div className="bg-white dark:bg-[var(--color-surface-container-highest)] rounded-2xl p-4 border border-[var(--color-outline-variant)]/30">
                    <p className="font-manrope font-extrabold text-2xl text-[var(--color-primary)] text-center font-mono">
                      {(depositInstruction as any)?.deposit_message || ""}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard((depositInstruction as any)?.deposit_message || "")}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)] font-inter font-bold text-sm transition-colors"
                  >
                    <Icon name="content_copy" size={18} />
                    Copiar código
                  </button>
                  <p className="text-xs text-[var(--color-on-surface-variant)] font-inter text-center">
                    Incluye este código en el <span className="font-bold">concepto</span> de la transferencia
                  </p>
                </div>
              </div>

              {/* Bank Details - Grid */}
              <div className="space-y-3">
                <p className="text-xs text-[var(--color-on-surface-variant)] font-inter font-bold uppercase tracking-widest px-1">
                  🏦 Datos bancarios
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "Beneficiario", value: "Remita Inc.", icon: "person" },
                    { label: "Empresa", value: "Remita Global LTD", icon: "business" },
                    { label: "IBAN", value: (depositInstruction as any)?.iban || "", icon: "credit_card" },
                    { label: "BIC/SWIFT", value: (depositInstruction as any)?.bic || "", icon: "swap_horiz" },
                  ].map((field, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/10 group hover:bg-[var(--color-surface-container-low)] transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Icon name={field.icon} size={20} className="text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[var(--color-on-surface-variant)] font-inter font-bold uppercase tracking-widest mb-1">
                            {field.label}
                          </p>
                          <p className="text-sm font-inter font-medium text-[var(--color-on-surface)] break-words">
                            {field.value}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(field.value)}
                        className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[var(--color-primary)] font-inter font-bold text-xs"
                      >
                        <Icon name="content_copy" size={14} />
                        Copiar
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div className="p-4 rounded-2xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/10">
                <div className="flex items-start gap-3">
                  <Icon name="location_on" size={20} className="text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-[var(--color-on-surface-variant)] font-inter font-bold uppercase tracking-widest mb-1">
                      Dirección
                    </p>
                    <p className="text-sm font-inter font-medium text-[var(--color-on-surface)]">
                      Calle de Alcalá, 1<br/>28014 Madrid, España
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline Info */}
              <div className="p-4 rounded-2xl bg-[var(--color-surface-container-low)]">
                <div className="flex items-start gap-3">
                  <Icon name="schedule" size={20} className="text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-[var(--color-on-surface-variant)] font-inter font-bold uppercase tracking-widest mb-1">
                      ⏱ Tiempo de acreditación
                    </p>
                    <p className="text-sm font-inter text-[var(--color-on-surface)]">
                      1 - 2 días hábiles
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Notes */}
              <div className="p-4 rounded-2xl bg-[var(--color-success)]/5 border border-[var(--color-success)]/20">
                <div className="flex items-start gap-3">
                  <Icon name="shield_check" size={20} className="text-[var(--color-success)] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-[var(--color-on-surface-variant)] font-inter font-bold uppercase tracking-widest mb-2">
                      ✓ Información importante
                    </p>
                    <ul className="space-y-1.5">
                      {[
                        "Solo desde cuenta a tu nombre",
                        "Conserva comprobante de pago",
                        "No incluyas datos personales adicionales",
                      ].map((note, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-[var(--color-on-surface-variant)] font-inter">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] mt-1 flex-shrink-0" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => window.history.back()}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] text-white font-bold"
              >
                Entendido
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
