"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBeneficiary } from "@/lib/hooks/useBeneficiary";
import { useSendMoney } from "@/lib/hooks/useSendMoney";
import { useExternalAccounts } from "@/lib/hooks/useExternalAccounts";
import { SuccessAnimation } from "@/components/motion/SuccessAnimation";
import { ExternalAccountSelector } from "@/components/features/ExternalAccountSelector";
import { toast } from "sonner";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { formatCurrency, maskIBAN } from "@/lib/format";
import { ExternalAccount } from "@/lib/types";
import {
  Loader2,
  ArrowRight,
  Phone,
  DollarSign,
  Heart,
  User,
  Lock,
  Clock,
  Check,
  Smartphone,
  AlertCircle,
  RotateCcw,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

type Step = 1 | 2 | 3 | 4 | "processing" | "success" | "error";
type SendMode = "user" | "bank";

export default function SendPage() {
  const router = useRouter();
  const { data: dashboardData } = useAccounts();
  const { data: externalAccounts } = useExternalAccounts();
  const [step, setStep] = useState<Step>(1);
  const [sendMode, setSendMode] = useState<SendMode>("user");
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>("");
  const [selectedAccountData, setSelectedAccountData] = useState<ExternalAccount | null>(null);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitted, setSubmitted] = useState(false); // Double-tap protection
  const { mutate: searchBeneficiary, data: beneficiary, isPending: isSearching } =
    useBeneficiary();
  const { mutate: sendMoney, isPending: isSending } = useSendMoney();

  const totalBalance = dashboardData?.totalBalance ?? 0;
  const hasBalance = totalBalance > 0;

  // Step 3/4 unlock logic: user mode needs beneficiary, bank mode needs selectedAccountData
  const step3Unlocked =
    sendMode === "user" ? !!beneficiary : !!selectedAccountData;

  const QUICK_AMOUNTS = [50, 100, 200, 500];

  const handleSearchBeneficiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    searchBeneficiary(phone, {
      onSuccess: () => setStep(3),
      onError: (err) => alert(err.message),
    });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount.replace(",", "."));
    if (amountNum <= 0 || amountNum > totalBalance) {
      alert("Monto inválido");
      return;
    }
    setStep(4);
  };

  const handleConfirm = () => {
    // Double-tap protection
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

  const handleRetry = () => {
    setStep(4);
    setErrorMessage("");
  };

  useEffect(() => {
    if (step === "success") {
      const timer = setTimeout(() => router.push("/dashboard"), 5000);
      return () => clearTimeout(timer);
    }
  }, [step, router]);

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
            {step === "success"
              ? "¡Enviado!"
              : step === "error"
              ? "Algo salió mal"
              : step === "processing"
              ? "Procesando"
              : "Enviar Dinero"}
          </h1>
          <p className="text-brand-sand/80 mt-1 text-xs sm:text-sm">
            {step === 1 && "Elige cómo enviar tu dinero"}
            {step === 2 && "Ingresa el teléfono de tu contacto"}
            {step === 3 && "Confirma el monto"}
            {step === 4 && "Revisa los detalles"}
            {step === "processing" && "Tu dinero está en camino"}
            {step === "success" && "Tu dinero está en camino"}
            {step === "error" && "Por favor, inténtalo de nuevo"}
          </p>
        </div>
      </motion.header>

      <motion.div
        className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Balance = 0 Blocked State */}
        {!hasBalance && step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="p-8 rounded-lg bg-brand-sand/30 border-2 border-brand-sand/40 space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-brand-coral/20 flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-brand-coral" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-brand-navy">
                Sin saldo disponible
              </h2>
              <p className="text-sm text-brand-sand/80">
                Añade fondos para poder enviar dinero
              </p>
            </div>

            <Link href="/deposit" className="w-full">
              <Button className="w-full bg-brand-coral hover:bg-brand-coral/90 text-white font-bold py-3">
                Depositar fondos
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="w-full text-brand-navy border-brand-sand/30"
            >
              Volver al inicio
            </Button>
          </motion.div>
        )}

        {/* Normal flow (with balance) */}
        {hasBalance && (
          <>
            {/* Step Indicator */}
            {step !== "success" &&
              step !== "error" &&
              step !== "processing" && (
                <div className="flex justify-between items-center gap-2 mb-8">
                  {[1, 2, 3, 4].map((s) => (
                    <motion.div
                      key={s}
                      className="flex-1 flex flex-col items-center gap-1"
                      animate={{ scale: s === step ? 1.05 : 1 }}
                    >
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                          s < step
                            ? "bg-brand-coral text-brand-white"
                            : s === step
                            ? "bg-brand-coral text-brand-white ring-2 ring-brand-coral ring-offset-2 ring-offset-brand-white"
                            : "bg-brand-sand/20 text-brand-sand/80"
                        }`}
                      >
                        {s < step ? "✓" : s}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

            <AnimatePresence mode="wait">
              {/* Step 1: Choose send mode */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-brand-navy font-semibold">
                    ¿A quién envías?
                  </p>

                  <button
                    onClick={() => {
                      setSendMode("user");
                      setStep(2);
                      setPhone("");
                      setAmount("");
                    }}
                    className="w-full p-5 rounded-lg border-2 border-brand-coral bg-brand-coral/8 text-left shadow-md hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <Smartphone className="w-5 h-5 mt-1 flex-shrink-0 text-brand-coral" />
                      <div>
                        <p className="font-bold text-brand-navy text-sm">
                          A un usuario de la plataforma
                        </p>
                        <p className="text-xs text-brand-sand/80 mt-1">
                          El más rápido y sin comisiones
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setSendMode("bank");
                      setSelectedBankAccount("");
                      setSelectedAccountData(null);
                      setStep(2);
                    }}
                    className="w-full p-5 rounded-lg border-2 border-brand-turquoise bg-brand-turquoise/8 text-left hover:border-brand-turquoise/90 transition-all shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <Lock className="w-5 h-5 mt-1 flex-shrink-0 text-brand-turquoise" />
                      <div>
                        <p className="font-bold text-brand-navy text-sm">
                          A una cuenta bancaria
                        </p>
                        <p className="text-xs text-brand-sand/80 mt-1">
                          Transfiere a cuentas SEPA registradas
                        </p>
                      </div>
                    </div>
                  </button>
                </motion.div>
              )}

              {/* Step 2: Select Bank Account (only if bank mode) */}
              {step === 2 && sendMode === "bank" && (
                <motion.div
                  key="step2-bank"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-5"
                >
                  <ExternalAccountSelector
                    selectedCountry="ES"
                    selectedAccount={selectedBankAccount}
                    onSelect={setSelectedBankAccount}
                    onSelectFull={setSelectedAccountData}
                    onBack={() => {
                      setStep(1);
                      setSendMode("user");
                      setSelectedBankAccount("");
                      setSelectedAccountData(null);
                    }}
                    onContinue={() => {
                      if (!selectedBankAccount) {
                        toast.error("Selecciona una cuenta bancaria");
                        return;
                      }
                      if (!selectedAccountData) {
                        const accountData = externalAccounts?.find(a => a.id === selectedBankAccount);
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

              {/* Step 2: Enter Phone (only if user mode) */}
              {step === 2 && sendMode === "user" && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-5"
                >
                  <p className="text-sm text-brand-navy font-semibold">
                    ¿A quién le envías?
                  </p>

                  <form onSubmit={handleSearchBeneficiary} className="space-y-4">
                    <div className="p-4 rounded-lg border-2 border-brand-sand/30 bg-brand-sand/8 space-y-4 shadow-sm">
                      <div>
                        <Label
                          htmlFor="phone"
                          className="text-sm text-brand-navy font-semibold"
                        >
                          Teléfono de tu contacto
                        </Label>
                        <p className="text-xs text-brand-sand/80 mt-1 mb-3">
                          Debe estar registrado en la plataforma
                        </p>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Ejemplo: +34 612 345 678"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={isSearching}
                          className="border-2 border-brand-sand/30 focus:border-brand-coral focus:ring-brand-coral/20 text-base bg-brand-white shadow-sm"
                        />
                        <p className="text-xs text-brand-sand/80 mt-2">
                          Códigos: +34 (España), +1-829 (República Dominicana)
                        </p>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSearching || !phone.trim()}
                      className="w-full bg-brand-coral hover:bg-brand-coral/90 text-white font-bold py-3 h-12"
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Buscando...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Continuar
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="w-full text-brand-navy border-brand-sand/30 hover:bg-brand-sand/5"
                      disabled={isSearching}
                    >
                      Volver
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* Step 3: Enter Amount */}
              {step === 3 && step3Unlocked && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-5"
                >
                  {/* Recipient card - differs by mode */}
                  {sendMode === "user" && beneficiary && (
                    <div className="p-4 rounded-lg border-2 border-brand-sand/30 bg-brand-sand/8 shadow-sm">
                      <p className="text-xs text-brand-navy/60 uppercase tracking-wide font-semibold">
                        Enviando a
                      </p>
                      <p className="text-lg font-bold text-brand-navy mt-2">
                        {beneficiary.name}
                      </p>
                      <p className="text-xs text-brand-navy/60 mt-1">
                        Usuario de la plataforma
                      </p>
                    </div>
                  )}
                  {sendMode === "bank" && selectedAccountData && (
                    <div className="p-4 rounded-lg border-2 border-brand-sand/30 bg-brand-sand/8 shadow-sm">
                      <p className="text-xs text-brand-navy/60 uppercase tracking-wide font-semibold">
                        Cuenta de destino
                      </p>
                      <p className="text-lg font-bold text-brand-navy mt-2">
                        {selectedAccountData.bankName}
                      </p>
                      <p className="text-xs text-brand-navy/60 mt-1">
                        {maskIBAN(selectedAccountData.accountNumber || "")}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSend} className="space-y-5">
                    {/* Amount input */}
                    <div className="bg-brand-turquoise/8 rounded-lg p-5 text-center border-2 border-brand-turquoise/30 shadow-sm">
                      <p className="text-sm text-brand-sand/80 mb-4">
                        ¿Cuánto quieres enviar?
                      </p>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-2xl text-brand-turquoise font-bold">
                          €
                        </span>
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
                          disabled={isSending}
                          className="text-4xl sm:text-5xl font-bold text-center text-brand-coral border-0 bg-transparent outline-none w-full max-w-xs"
                        />
                      </div>
                      <p className="text-xs text-brand-sand/80 mt-4">
                        Tu saldo: {formatCurrency(totalBalance)}
                      </p>
                    </div>

                    {/* Quick amount buttons */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {QUICK_AMOUNTS.map((quickAmount) => (
                        <button
                          key={quickAmount}
                          type="button"
                          onClick={() => setAmount(String(quickAmount))}
                          disabled={
                            quickAmount > totalBalance ||
                            isSending ||
                            parseFloat(amount) === quickAmount
                          }
                          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                            parseFloat(amount) === quickAmount
                              ? "bg-brand-coral text-brand-white"
                              : quickAmount > totalBalance
                              ? "bg-brand-sand/20 text-brand-sand/50 cursor-not-allowed"
                              : "bg-brand-sand/30 text-brand-navy hover:bg-brand-sand/50"
                          }`}
                        >
                          {quickAmount}€
                        </button>
                      ))}
                    </div>

                    {/* Validation feedback - insufficient balance */}
                    {amount &&
                      parseFloat(amount.replace(",", ".")) > totalBalance && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 rounded-lg bg-brand-gold/15 border-2 border-brand-gold text-brand-navy text-xs font-medium"
                        >
                          ⚠️ Saldo insuficiente. Deposita más fondos para continuar.
                        </motion.div>
                      )}

                    {/* Message field - optional */}
                    <div className="bg-brand-white rounded-lg p-4 border-2 border-brand-sand/30 shadow-sm">
                      <Label
                        htmlFor="message"
                        className="text-sm text-brand-navy font-semibold"
                      >
                        Añade un mensaje (opcional)
                      </Label>
                      <textarea
                        id="message"
                        placeholder="Ej: Para la escuela..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value.slice(0, 100))}
                        disabled={isSending}
                        className="w-full mt-2 p-3 text-sm border-2 border-brand-sand/30 rounded-lg focus:border-brand-coral focus:ring-brand-coral/20 resize-none bg-brand-white"
                        rows={3}
                      />
                      <p className="text-xs text-brand-sand/70 mt-2">
                        {message.length}/100 caracteres
                      </p>
                    </div>

                    {/* Info banner */}
                    <div className="bg-brand-gold/12 rounded-lg p-4 border-2 border-brand-gold/30 shadow-sm">
                      <p className="text-xs text-brand-navy text-center font-medium">
                        El dinero llega al instante sin comisiones
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={
                        isSending ||
                        !amount ||
                        parseFloat(amount.replace(",", ".")) <= 0 ||
                        parseFloat(amount.replace(",", ".")) > totalBalance
                      }
                      className="w-full bg-brand-coral hover:bg-brand-coral/90 text-white font-bold py-3 h-12"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4 mr-2" />
                          Continuar
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="w-full text-brand-navy"
                      disabled={isSending}
                    >
                      Cambiar contacto
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && step3Unlocked && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-5"
                >
                  {/* Summary box */}
                  <div className="p-5 rounded-lg border-2 border-brand-sand/30 bg-brand-sand/8 space-y-4 shadow-sm">
                    <div>
                      <p className="text-xs text-brand-sand/80 uppercase tracking-wide font-semibold">
                        Resumen del envío
                      </p>
                    </div>

                    <div className="space-y-4 pt-3 border-t-2 border-brand-sand/20">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-brand-navy/60 mb-1 uppercase tracking-wide font-semibold">
                            {sendMode === "user" ? "Beneficiario" : "Cuenta de destino"}
                          </p>
                          {sendMode === "user" && beneficiary ? (
                            <>
                              <p className="font-bold text-brand-navy text-lg">
                                {beneficiary.name}
                              </p>
                              <p className="text-xs text-brand-navy/60 mt-1">
                                Usuario de la plataforma
                              </p>
                            </>
                          ) : sendMode === "bank" && selectedAccountData ? (
                            <>
                              <p className="font-bold text-brand-navy text-lg">
                                {selectedAccountData.bankName}
                              </p>
                              <p className="text-xs text-brand-navy/60 mt-1">
                                {selectedAccountData.bankName}
                              </p>
                              <p className="text-xs text-brand-navy/60">
                                {maskIBAN(selectedAccountData.accountNumber || "")}
                              </p>
                            </>
                          ) : null}
                        </div>
                        <Heart className="w-5 h-5 text-brand-coral flex-shrink-0" />
                      </div>

                      <div className="h-px bg-brand-sand/15" />

                      <div className="flex items-end justify-between">
                        <p className="text-sm text-brand-sand/80">
                          Monto a enviar
                        </p>
                        <p className="text-3xl font-bold text-brand-coral">
                          {formatCurrency(parseFloat(amount || "0"))}
                        </p>
                      </div>

                      {message && (
                        <>
                          <div className="h-px bg-brand-sand/15" />
                          <div>
                            <p className="text-xs text-brand-sand/80 mb-2">
                              Mensaje
                            </p>
                            <p className="text-sm text-brand-navy italic">
                              "{message}"
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* What happens box */}
                  <div className="p-5 rounded-lg border-2 border-brand-sand/30 bg-brand-sand/8 space-y-4 shadow-sm">
                    <p className="text-xs text-brand-sand/80 uppercase tracking-wide font-semibold">
                      Esto es lo que ocurre
                    </p>

                    <div className="space-y-4 pt-2">
                      <div className="flex gap-3">
                        <Clock className="w-5 h-5 text-brand-coral flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm text-brand-navy">
                            En segundos
                          </p>
                          <p className="text-xs text-brand-sand/80 mt-0.5">
                            El dinero es procesado inmediatamente
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Check className="w-5 h-5 text-brand-coral flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm text-brand-navy">
                            Sin cargos ocultos
                          </p>
                          <p className="text-xs text-brand-sand/80 mt-0.5">
                            {sendMode === "user" && beneficiary
                              ? `${beneficiary.name} recibe los ${formatCurrency(parseFloat(amount || "0"))} completos`
                              : `La cuenta de destino recibe ${formatCurrency(parseFloat(amount || "0"))} completos`}
                          </p>
                        </div>
                      </div>

                      {sendMode === "user" && beneficiary && (
                        <div className="flex gap-3">
                          <Smartphone className="w-5 h-5 text-brand-coral flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-sm text-brand-navy">
                              Notificación instantánea
                            </p>
                            <p className="text-xs text-brand-sand/80 mt-0.5">
                              {beneficiary.name} recibe un mensaje con el dinero
                              listo
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleConfirm}
                    disabled={submitted || isSending}
                    className="w-full bg-brand-coral hover:bg-brand-coral/90 text-white font-bold py-3 h-12"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Enviar dinero
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(3)}
                    className="w-full text-brand-navy border-brand-sand/30 hover:bg-brand-sand/5"
                    disabled={isSending}
                  >
                    Cambiar monto
                  </Button>
                </motion.div>
              )}

              {/* Processing Screen */}
              {step === "processing" && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-8 py-12"
                >
                  {/* Animated dots */}
                  <div className="flex justify-center items-center gap-3">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 rounded-full bg-brand-turquoise"
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
                    <h2 className="text-2xl font-bold text-brand-navy font-heading">
                      Enviando dinero...
                    </h2>
                    <motion.p
                      className="text-sm text-brand-sand/80"
                      animate={{ opacity: [0.7, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Por favor espera mientras procesamos tu transferencia
                    </motion.p>
                  </div>
                </motion.div>
              )}

              {/* Error Screen */}
              {step === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6 py-8"
                >
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-brand-coral/20 flex items-center justify-center">
                      <AlertCircle className="w-10 h-10 text-brand-coral" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-brand-navy font-heading">
                      No se pudo completar el envío
                    </h2>
                    {errorMessage && (
                      <p className="text-sm text-brand-coral font-medium">
                        {errorMessage}
                      </p>
                    )}
                    <p className="text-xs text-brand-sand/80">
                      Por favor, verifica tu conexión e inténtalo de nuevo.
                    </p>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Button
                      onClick={handleRetry}
                      className="w-full bg-brand-coral hover:bg-brand-coral/90 text-white font-bold py-3"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reintentar
                    </Button>

                    <Button
                      onClick={() => router.push("/dashboard")}
                      variant="outline"
                      className="w-full text-brand-navy border-brand-sand/30"
                    >
                      Volver al inicio
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Success Screen */}
              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6 sm:space-y-8"
                >
                  <div className="pt-4">
                    <SuccessAnimation show={true} />
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy font-heading">
                      ¡Enviado!
                    </h2>

                    <div className="p-5 rounded-lg border-2 border-brand-coral/40 bg-brand-coral/10 space-y-3 shadow-sm">
                      <p className="text-3xl font-bold text-brand-coral">
                        {formatCurrency(parseFloat(amount || "0"))}
                      </p>
                      {sendMode === "user" && beneficiary ? (
                        <>
                          <p className="text-base text-brand-navy font-semibold">
                            para {beneficiary.name}
                          </p>
                          <p className="text-xs text-brand-sand/80 leading-relaxed">
                            El dinero está siendo procesado y llegará en segundos.{" "}
                            {beneficiary.name} recibirá una notificación.
                          </p>
                        </>
                      ) : sendMode === "bank" && selectedAccountData ? (
                        <>
                          <p className="text-base text-brand-navy font-semibold">
                            a {selectedAccountData.bankName}
                          </p>
                          <p className="text-xs text-brand-sand/80 leading-relaxed">
                            El dinero está siendo procesado y llegará a la cuenta en 2–3 días hábiles.
                          </p>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="pt-2 space-y-3">
                    <Button
                      onClick={() => router.push("/dashboard")}
                      className="w-full bg-brand-coral hover:bg-brand-coral/90 text-white font-bold py-3 h-12"
                    >
                      Volver al inicio
                    </Button>

                    <Button
                      onClick={() => {
                        setStep(1);
                        setPhone("");
                        setAmount("");
                        setSelectedBankAccount("");
                        setSelectedAccountData(null);
                        setSubmitted(false);
                      }}
                      variant="outline"
                      className="w-full text-brand-navy border-brand-sand/30 hover:bg-brand-sand/5"
                    >
                      {sendMode === "user"
                        ? "Enviar a otro contacto"
                        : "Enviar a otra cuenta"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </div>
  );
}
