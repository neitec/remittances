"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeposit } from "@/lib/hooks/useDeposit";
import { maskIBAN, formatCurrency } from "@/lib/format";
import { ExternalAccountSelector } from "@/components/features/ExternalAccountSelector";
import { ExternalAccount } from "@/lib/types";
import { Loader2, Check, Copy, ArrowRight } from "lucide-react";
import { toast } from "sonner";

type DepositMethod = "EUR" | "DOP";
type Step = 1 | 2 | 3 | 4;

const DEPOSIT_METHODS = [
  {
    id: "EUR" as DepositMethod,
    label: "Transferencia bancaria SEPA",
    description: "Cuenta europea · 2–3 días hábiles",
    disabled: false,
  },
  {
    id: "DOP" as DepositMethod,
    label: "Moneda local (DOP)",
    description: "Próximamente disponible",
    disabled: true,
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

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="min-h-screen bg-brand-white pb-4">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-40 bg-brand-white border-b border-brand-sand/20 backdrop-blur-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy font-heading">
            Depositar Fondos
          </h1>
          <p className="text-brand-sand/80 mt-1 text-xs sm:text-sm">
            Transfiere dinero a tu cuenta EUR
          </p>
        </div>
      </motion.header>

      {/* Step Indicator */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center gap-2 max-w-md mx-auto">
          {[1, 2, 3, 4].map((s) => (
            <motion.div
              key={s}
              className="flex-1"
              animate={{ scale: s === step ? 1.05 : 1 }}
            >
              <div
                className={`w-full h-1.5 rounded-full transition-all ${
                  s < step
                    ? "bg-brand-turquoise"
                    : s === step
                    ? "bg-brand-turquoise ring-2 ring-brand-turquoise ring-offset-2 ring-offset-brand-white"
                    : "bg-brand-sand/20"
                }`}
              />
              <p className="text-xs font-bold text-center mt-1 text-brand-navy">{s}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {/* Step 1: Select Deposit Method */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              <p className="text-sm text-brand-navy font-semibold">
                ¿Cómo deseas depositar?
              </p>
              <div className="space-y-3">
                {DEPOSIT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => {
                      if (!method.disabled) {
                        setSelectedMethod(method.id);
                        setSelectedAccount("");
                        setSelectedAccountData(null);
                        setStep(2);
                      }
                    }}
                    disabled={method.disabled}
                    className={`w-full p-5 rounded-lg border-2 transition-all text-left shadow-sm ${
                      method.disabled
                        ? "border-brand-sand/30 bg-brand-sand/8 opacity-60 cursor-not-allowed"
                        : "border-brand-sand/30 hover:border-brand-coral hover:shadow-md bg-brand-white cursor-pointer"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-brand-navy text-sm">
                          {method.label}
                        </p>
                        <p className="text-xs text-brand-sand/80 mt-1">
                          {method.description}
                        </p>
                      </div>
                      {method.disabled && (
                        <span className="ml-3 text-xs font-bold text-brand-gold uppercase">
                          Próximamente
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Select or Add Bank Account */}
          {step === 2 && (
            <ExternalAccountSelector
              selectedCountry="ES"
              selectedAccount={selectedAccount}
              onSelect={setSelectedAccount}
              onSelectFull={setSelectedAccountData}
              onBack={() => setStep(1)}
              onContinue={handleContinue}
              showInlineCreate={true}
            />
          )}

          {/* Step 3: Enter Amount */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              {selectedAccountData && (
                <div className="bg-brand-sand/8 rounded-lg p-4 border border-brand-sand/20">
                  <p className="text-xs text-brand-navy/60 font-semibold mb-1 uppercase tracking-wide">
                    Cuenta de destino
                  </p>
                  <p className="font-bold text-brand-navy">{selectedAccountData.bankName}</p>
                  <p className="text-xs text-brand-navy/60 mt-1">{maskIBAN(selectedAccountData.accountNumber || "")}</p>
                </div>
              )}

              <form onSubmit={handleDeposit} className="space-y-5">
                <div className="bg-brand-coral/10 rounded-lg p-6 text-center border-2 border-brand-coral/30 shadow-md">
                  <p className="text-sm text-brand-sand/80 mb-4 font-medium">¿Cuánto quieres depositar?</p>
                  <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-3xl text-brand-coral font-bold">€</span>
                    <input
                      id="amount"
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
                      className="text-4xl sm:text-5xl font-bold text-center text-brand-coral border-0 bg-transparent outline-none w-full max-w-xs placeholder-brand-sand/40"
                    />
                  </div>
                  <p className="text-xs text-brand-sand/80">Cantidad mínima: €10 • Sin comisiones ocultas</p>
                </div>

                <Button
                  type="submit"
                  disabled={isPending || !amount}
                  className="w-full bg-brand-turquoise hover:bg-brand-turquoise/90 text-brand-navy font-bold py-3 h-12"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Confirmar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="w-full text-brand-navy border-brand-sand/30 hover:bg-brand-sand/5"
              >
                Volver
              </Button>
            </motion.div>
          )}

          {/* Step 4: SEPA Instructions */}
          {step === 4 && depositInstruction && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              <div className="p-1 rounded-lg bg-brand-turquoise/10 border border-brand-turquoise/20">
                <div className="p-4 rounded bg-brand-white flex gap-3 items-start">
                  <Check className="w-5 h-5 text-brand-turquoise flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-brand-navy text-sm">
                      Datos para tu transferencia
                    </p>
                    <p className="text-xs text-brand-navy/60 mt-1">
                      Copia estos datos y realiza una transferencia SEPA desde tu banco
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-brand-white border border-brand-sand/20 rounded-lg p-5">
                <div>
                  <p className="text-xs text-brand-navy/60 uppercase tracking-wide font-semibold mb-2">
                    Número de cuenta (IBAN)
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-brand-sand/10 px-3 py-3 rounded font-mono text-sm text-brand-navy font-bold break-all">
                      {(depositInstruction as any)?.iban || ""}
                    </code>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard((depositInstruction as any)?.iban || "")
                      }
                      className="flex-shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="h-px bg-brand-sand/15" />

                <div>
                  <p className="text-xs text-brand-navy/60 uppercase tracking-wide font-semibold mb-2">
                    Código SWIFT
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-brand-sand/10 px-3 py-3 rounded font-mono text-sm text-brand-navy font-bold">
                      {(depositInstruction as any)?.bic || ""}
                    </code>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard((depositInstruction as any)?.bic || "")
                      }
                      className="flex-shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="h-px bg-brand-sand/15" />

                <div>
                  <p className="text-xs text-brand-navy/60 uppercase tracking-wide font-semibold mb-2">
                    Referencia
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-brand-sand/10 px-3 py-3 rounded font-mono text-sm text-brand-navy font-bold">
                      {(depositInstruction as any)?.reference || ""}
                    </code>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard((depositInstruction as any)?.reference || "")
                      }
                      className="flex-shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-brand-turquoise/10 border border-brand-turquoise/20 p-4 rounded-lg">
                  <p className="text-xs text-brand-navy/80 leading-relaxed font-medium">
                    ✓ Tu saldo se actualizará automáticamente al recibir los fondos
                  </p>
                </div>
                <div className="bg-brand-gold/10 border border-brand-gold/20 p-4 rounded-lg">
                  <p className="text-xs text-brand-navy leading-relaxed">
                    <strong>Tiempo estimado:</strong> El dinero llegará en 2–3 días hábiles desde que tu banco lo procese.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => window.history.back()}
                className="w-full bg-brand-coral hover:bg-brand-coral/90 text-white font-bold py-3 h-12"
              >
                Listo
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
