"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { useDebouncedCallback } from "@/lib/hooks/useDebouncedCallback";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { SlideToAction } from "@/components/ui/SlideToAction";
import { GlassCard } from "@/components/ui/GlassCard";
import { useBeneficiaryByPhone, useBeneficiaryByAlias } from "@/lib/hooks/mutations/useBeneficiary";
import { useSendMoney } from "@/lib/hooks/mutations/useSendMoney";
import { useExternalAccounts } from "@/lib/hooks/queries/useExternalAccounts";
import { useMe } from "@/lib/hooks/queries/useMe";
import { ExternalAccountSelector } from "@/components/features/ExternalAccountSelector";
import { toast } from "sonner";
import { useAccounts } from "@/lib/hooks/queries/useAccounts";
import { useTransactions } from "@/lib/hooks/queries/useTransactions";
import { formatCurrency, maskIBAN, getInitials, getQuickAmounts } from "@/lib/format";
import {
  PhoneCountry,
  PHONE_COUNTRIES,
  PHONE_COUNTRY_LIST,
  sanitizePhoneInput,
  formatPhoneDisplay,
  isPhoneComplete,
  getFullPhoneNumber,
  parseFullPhone,
} from "@/lib/phone";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { ExternalAccount, User } from "@/lib/types";
import { useRouter } from "next/navigation";
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

type ActiveField = "phone" | "alias" | null;

const slideVariants = {
  initial: (dir: number) => ({ x: dir * 50, opacity: 0, scale: 0.985 }),
  animate: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir * -50, opacity: 0, scale: 0.985 }),
};

const StepDots = ({ current }: { current: 1 | 2 | 3 }) => (
  <div className="flex items-center gap-1.5">
    {[1, 2, 3].map((n) => (
      <span
        key={n}
        className="h-1.5 rounded-full transition-all duration-300"
        style={{
          width: n === current ? 18 : 6,
          background: n === current ? "var(--color-primary)" : "rgba(0,0,0,0.12)",
        }}
      />
    ))}
  </div>
);

export default function SendPage() {
  const router = useRouter();
  const { data: dashboardData, isLoading: isAccountsLoading } = useAccounts();
  const { data: externalAccounts } = useExternalAccounts();
  const { data: transactionsData } = useTransactions({ type: "TRANSFER" });
  const { data: me } = useMe();
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);
  const [sendMode, setSendMode] = useState<SendMode>("user");

  const goToStep = (newStep: Step, dir: number = 1) => {
    setDirection(dir);
    setStep(newStep);
  };

  const [selectedBankAccount, setSelectedBankAccount] = useState<string>("");
  const [scCoin, setScCoin] = useState(SEND_COINS[0]);
  const [scNetwork, setScNetwork] = useState(SEND_NETWORKS[0]);
  const [scAddress, setScAddress] = useState("");
  const [scAmount, setScAmount] = useState("");
  const [selectedAccountData, setSelectedAccountData] = useState<ExternalAccount | null>(null);
  const [country, setCountry] = useState<PhoneCountry>("ES");
  const [phone, setPhone] = useState("");
  const [alias, setAlias] = useState("");
  const [inputMode, setInputMode] = useState<"phone" | "alias">("phone");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [beneficiaryError, setBeneficiaryError] = useState("");
  const [notFoundField, setNotFoundField] = useState<ActiveField>(null);
  const [activeField, setActiveField] = useState<ActiveField>(null);
  const [submitted, setSubmitted] = useState(false);
  const { mutate: searchBeneficiaryByPhone, data: phoneBeneficiary, reset: resetPhoneSearch } =
    useBeneficiaryByPhone();
  const { mutate: searchBeneficiaryByAlias, data: aliasBeneficiary, reset: resetAliasSearch } =
    useBeneficiaryByAlias();
  const { mutate: sendMoney, isPending: isSending } = useSendMoney();

  const beneficiary =
    activeField === "phone" ? phoneBeneficiary : activeField === "alias" ? aliasBeneficiary : undefined;
  const isSelfBeneficiary = !!(beneficiary && me && beneficiary.id === me.id);
  const ALIAS_REGEX = /^[a-zA-Z0-9._-]{3,30}$/;
  const SEARCH_DEBOUNCE_MS = 350;

  const handleSearchError = (
    err: unknown,
    field: "phone" | "alias",
    resetMutation: () => void
  ) => {
    resetMutation();
    if (isAxiosError(err) && err.response?.status === 404) {
      setNotFoundField(field);
      setBeneficiaryError("");
    } else {
      setNotFoundField(null);
      setBeneficiaryError(err instanceof Error ? err.message : "Error en la búsqueda");
    }
  };

  const handleSearchSuccess = () => {
    setBeneficiaryError("");
    setNotFoundField(null);
  };

  const phoneSearch = useDebouncedCallback((fullPhone: string) => {
    searchBeneficiaryByPhone(fullPhone, {
      onError: (err) => handleSearchError(err, "phone", resetPhoneSearch),
      onSuccess: handleSearchSuccess,
    });
  }, SEARCH_DEBOUNCE_MS);

  const aliasSearch = useDebouncedCallback((aliasValue: string) => {
    searchBeneficiaryByAlias(aliasValue, {
      onError: (err) => handleSearchError(err, "alias", resetAliasSearch),
      onSuccess: handleSearchSuccess,
    });
  }, SEARCH_DEBOUNCE_MS);

  const totalBalance = dashboardData?.totalBalance ?? 0;
  const hasBalance = totalBalance > 0;
  const senderName = [me?.name, me?.surname].filter(Boolean).join(" ") || "Usuario";

  // Top 3 most recent unique contacts from transfers
  const frequentContacts: User[] = (() => {
    const transfers = (transactionsData?.pages?.flatMap(p => p.transactions) ?? [])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const seen = new Set<string>();
    const result: User[] = [];
    for (const txn of transfers) {
      const isOutgoing = !!(me && (
        txn.sourceAccount?.userId === me.id ||
        txn.sourceAccount?.user?.email === me.email
      ));
      const contact = isOutgoing ? txn.destinationAccount?.user : txn.sourceAccount?.user;
      if (!contact || seen.has(contact.id)) continue;
      seen.add(contact.id);
      result.push(contact);
      if (result.length >= 3) break;
    }
    return result;
  })();

  const selectFrequentContact = (contact: User) => {
    const parsed = parseFullPhone(contact.phone ?? "");
    const nextCountry: PhoneCountry = parsed?.country ?? "ES";
    const local = parsed ? sanitizePhoneInput(parsed.digits, nextCountry) : "";
    setInputMode("phone");
    setCountry(nextCountry);
    setPhone(local);
    setAlias("");
    resetAliasSearch();
    setActiveField(local ? "phone" : null);
    setBeneficiaryError("");
    setNotFoundField(null);
    aliasSearch.cancel();
    if (isPhoneComplete(local, nextCountry)) {
      phoneSearch.trigger(getFullPhoneNumber(local, nextCountry));
      goToStep(3, 1);
    } else {
      phoneSearch.cancel();
      resetPhoneSearch();
    }
  };

  const quickAmounts = getQuickAmounts(totalBalance);

  // Handle phone change - debounced search when complete
  const handlePhoneChange = (value: string) => {
    // Switch from alias → phone: clear pending alias search + alias state
    aliasSearch.cancel();
    if (alias) setAlias("");
    resetAliasSearch();

    const digitsOnly = sanitizePhoneInput(value, country);
    setPhone(digitsOnly);
    setActiveField(digitsOnly ? "phone" : null);
    setBeneficiaryError("");
    setNotFoundField(null);

    if (isPhoneComplete(digitsOnly, country)) {
      phoneSearch.trigger(getFullPhoneNumber(digitsOnly, country));
    } else {
      phoneSearch.cancel();
      resetPhoneSearch();
    }
  };

  const handleCountryChange = (next: PhoneCountry) => {
    if (next === country) return;
    setCountry(next);
    const truncated = sanitizePhoneInput(phone, next);
    setPhone(truncated);
    setBeneficiaryError("");
    setNotFoundField(null);
    if (isPhoneComplete(truncated, next)) {
      phoneSearch.trigger(getFullPhoneNumber(truncated, next));
    } else {
      phoneSearch.cancel();
      resetPhoneSearch();
    }
  };

  // Handle alias change - debounced search when valid
  const handleAliasChange = (value: string) => {
    // Switch from phone → alias: clear pending phone search + phone state
    phoneSearch.cancel();
    if (phone) setPhone("");
    resetPhoneSearch();

    const sanitized = value.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 30);
    setAlias(sanitized);
    setActiveField(sanitized ? "alias" : null);
    setBeneficiaryError("");
    setNotFoundField(null);

    if (ALIAS_REGEX.test(sanitized)) {
      aliasSearch.trigger(sanitized);
    } else {
      aliasSearch.cancel();
      resetAliasSearch();
    }
  };

  const switchInputMode = (mode: "phone" | "alias") => {
    if (mode === "phone") {
      aliasSearch.cancel();
      setAlias("");
      resetAliasSearch();
    } else {
      phoneSearch.cancel();
      setPhone("");
      resetPhoneSearch();
    }
    setActiveField(null);
    setBeneficiaryError("");
    setNotFoundField(null);
    setInputMode(mode);
  };

  const handleSendConfirm = () => {
    if (submitted) return;
    setSubmitted(true);
    setErrorMessage("");
    setStep("processing");

    // For user-to-user transfer
    if (sendMode === "user" && beneficiary) {
      if (isSelfBeneficiary) {
        setErrorMessage("No puedes enviarte dinero a ti mismo");
        setStep("error");
        setSubmitted(false);
        return;
      }

      const amountNum = parseFloat(amount.replace(",", "."));

      if (isNaN(amountNum) || amountNum <= 0) {
        setErrorMessage("Monto inválido");
        setStep("error");
        setSubmitted(false);
        return;
      }

      const transferRequest =
        activeField === "alias"
          ? { userAlias: alias }
          : { beneficiaryPhone: getFullPhoneNumber(phone, country) };

      if (!transferRequest.userAlias && !transferRequest.beneficiaryPhone) {
        setErrorMessage("Destinatario inválido");
        setStep("error");
        setSubmitted(false);
        return;
      }

      sendMoney(
        {
          ...transferRequest,
          amount: amountNum.toString(),
          reference: message || undefined,
        },
        {
          onSuccess: () => {
            setSubmitted(false);
          },
          onError: (err) => {
            setErrorMessage(err instanceof Error ? err.message : "Error al enviar el dinero");
            setStep("error");
            setSubmitted(false);
          },
        }
      );
    }
    // For bank transfer
    else if (sendMode === "bank" && selectedAccountData) {
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
            setSubmitted(false);
          },
          onError: (err) => {
            setErrorMessage(err instanceof Error ? err.message : "Error al enviar el dinero");
            setStep("error");
            setSubmitted(false);
          },
        }
      );
    } else {
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
      <AppHeader />

      {/* Main content */}
      <main className="pt-[80px] px-5 pb-6 lg:pb-0 lg:pl-12 lg:pr-10">
        <div className="max-w-[1088px]">

        {/* Persistent breadcrumb nav — stays across all steps */}
        {typeof step === "number" && (
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
                    onClick={() => goToStep(1, -1)}
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
          {/* Step 1: Choose transfer type */}
          {step === 1 && (
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
                onClick={() => {
                  setSendMode("user");
                  setInputMode("phone");
                  setPhone("");
                  setAlias("");
                  setActiveField(null);
                  setAmount("");
                  setMessage("");
                  setShowMessage(false);
                  setBeneficiaryError("");
                  setNotFoundField(null);
                  resetPhoneSearch();
                  resetAliasSearch();
                  goToStep(2, 1);
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

                <div className="relative flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-[12px] flex items-center justify-center overflow-hidden" style={{ background: "rgba(0,62,199,0.06)", boxShadow: "0 4px 12px rgba(0,62,199,0.10)" }}>
                    <Image src="/remita-isologo.png" alt="Remita GCS" width={40} height={40} className="object-contain" style={{ mixBlendMode: "multiply" }} />
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
                  <h3 className="font-manrope font-semibold text-[15px] text-[var(--color-on-surface)] leading-tight">A un usuario de Remita GCS</h3>
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
                onClick={() => { setSendMode("stablecoin"); setScAddress(""); setScAmount(""); goToStep(2, 1); }}
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
                    Transferencias externas a usuarios fuera de Remita GCS.
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

          {/* No-balance empty state — prevents blank screen when user navigates past step 1 with 0 balance */}
          {typeof step === "number" && step >= 2 && !hasBalance && (
            <motion.div
              key="no-balance"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
              className="max-w-[560px] mx-auto pt-8 pb-20"
            >
              <div
                className="rounded-[22px] p-8 text-center"
                style={{
                  background: "var(--color-surface-container-lowest)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(0,62,199,0.08)" }}
                >
                  <Icon name="account_balance_wallet" size={26} className="text-[var(--color-primary)]" />
                </div>
                <h2 className="font-manrope font-extrabold text-[18px] text-[var(--color-on-surface)] mb-2">
                  Aún no tienes fondos
                </h2>
                <p className="text-[13px] font-inter text-[var(--color-on-surface-variant)]/70 leading-relaxed mb-6">
                  Necesitas saldo en tu wallet para transferir. Deposita euros vía SEPA o recibe stablecoins on-chain en segundos.
                </p>
                <div className="flex items-center gap-3 justify-center">
                  <button
                    onClick={() => goToStep(1, -1)}
                    className="px-5 py-2.5 rounded-[12px] font-inter font-semibold text-[13px] text-[var(--color-on-surface-variant)] cursor-pointer transition-colors hover:bg-[rgba(0,0,0,0.04)]"
                    style={{ border: "1px solid rgba(0,0,0,0.08)" }}
                  >
                    Volver
                  </button>
                  <button
                    onClick={() => router.push("/deposit")}
                    className="px-5 py-2.5 rounded-[12px] font-inter font-bold text-[13px] text-white cursor-pointer transition-opacity hover:opacity-90"
                    style={{
                      background: "linear-gradient(135deg, #003ec7 0%, #1252e8 100%)",
                      boxShadow: "0 4px 12px rgba(0,62,199,0.20)",
                    }}
                  >
                    Depositar fondos
                  </button>
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
                onBack={() => goToStep(1, -1)}
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
                  goToStep(3, 1);
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
              key="step-user-shell"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
              className="pb-28 lg:pb-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] lg:gap-8 lg:items-start">

                {/* ══ LEFT: Substep content with slide animation ══ */}
                <div className="mb-8 lg:mb-0 min-w-0">

                  {/* Top bar: back arrow + step dots */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => goToStep((step - 1) as Step, -1)}
                      className="flex items-center gap-1.5 -ml-1.5 px-2 py-1.5 rounded-[10px] text-[var(--color-on-surface-variant)]/55 hover:text-[var(--color-on-surface)] hover:bg-[rgba(0,0,0,0.04)] transition-colors cursor-pointer"
                    >
                      <Icon name="arrow_back" size={16} />
                      <span className="font-inter text-[12px] font-medium">Atrás</span>
                    </button>
                    <StepDots current={(step - 1) as 1 | 2 | 3} />
                  </div>

                  <AnimatePresence mode="wait" custom={direction}>

                    {/* ─── Step 2: Destinatario ─── */}
                    {step === 2 && (
                      <motion.div
                        key="user-step-recipient"
                        custom={direction}
                        variants={slideVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.26, ease: [0.25, 0.1, 0.25, 1] }}
                        className="space-y-4"
                      >
                        {/* Title */}
                        <div className="space-y-1">
                          <h1 className="font-manrope font-bold text-[24px] text-[var(--color-on-surface)] leading-tight">
                            ¿A quién envías?
                          </h1>
                          <p className="text-[13px] font-inter text-[var(--color-on-surface-variant)]/55">
                            Introduce el {inputMode === "phone" ? "teléfono" : "alias"} del destinatario.
                          </p>
                        </div>

                        {/* Card Destinatario — héroe */}
                        <div
                          className="rounded-[20px] overflow-hidden"
                          style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
                        >
                          <div className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                            <p className="font-inter font-bold text-[10.5px] uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]/45">Destinatario</p>
                          </div>
                          <div className="px-4 py-3 space-y-2.5">
                            <AnimatePresence mode="wait">
                              {inputMode === "phone" ? (
                                <motion.div
                                  key="phone-input"
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 4 }}
                                  transition={{ duration: 0.18 }}
                                  className="flex gap-2"
                                >
                                  <div className="relative flex-shrink-0">
                                    <div
                                      className="flex items-center gap-2 h-10 pl-2.5 pr-7 rounded-[12px] border border-[var(--color-outline-variant)]/50 focus-within:border-[var(--color-primary)] transition-colors"
                                      style={{ background: "var(--color-surface-container-lowest)" }}
                                    >
                                      <CountryFlag country={country} className="w-[18px] h-[13px] rounded-[2px] flex-shrink-0 ring-1 ring-black/5" />
                                      <span className="font-inter text-[13px] font-medium text-[var(--color-on-surface)]">
                                        {PHONE_COUNTRIES[country].dialPrefix}
                                      </span>
                                    </div>
                                    <select
                                      value={country}
                                      onChange={(e) => handleCountryChange(e.target.value as PhoneCountry)}
                                      aria-label="Código de país"
                                      className="absolute inset-0 opacity-0 cursor-pointer"
                                    >
                                      {PHONE_COUNTRY_LIST.map((cfg) => (
                                        <option key={cfg.code} value={cfg.code}>
                                          {cfg.label} ({cfg.dialPrefix})
                                        </option>
                                      ))}
                                    </select>
                                    <svg className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 opacity-35" width="9" height="9" viewBox="0 0 24 24" fill="none">
                                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </div>
                                  <input
                                    type="tel"
                                    placeholder={PHONE_COUNTRIES[country].placeholder}
                                    autoFocus
                                    value={formatPhoneDisplay(phone, country)}
                                    onChange={(e) => handlePhoneChange(e.target.value)}
                                    maxLength={PHONE_COUNTRIES[country].maxDigits + PHONE_COUNTRIES[country].groupSizes.length - 1}
                                    className="flex-1 h-10 px-4 rounded-[12px] text-[var(--color-on-surface)] font-inter text-[13px] border border-[var(--color-outline-variant)]/50 focus:border-[var(--color-primary)] focus:outline-none transition-colors placeholder:text-[var(--color-on-surface-variant)]/35"
                                    style={{ background: "var(--color-surface-container-lowest)" }}
                                  />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="alias-input"
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 4 }}
                                  transition={{ duration: 0.18 }}
                                  className="flex items-center gap-2.5 h-10 px-3.5 rounded-[12px] border border-[var(--color-outline-variant)]/50 focus-within:border-[var(--color-primary)] transition-colors"
                                  style={{ background: "var(--color-surface-container-lowest)" }}
                                >
                                  <span className="font-manrope font-bold text-[15px] leading-none text-[var(--color-on-surface-variant)]/55">@</span>
                                  <input
                                    type="text"
                                    placeholder="Alias de Remita GCS"
                                    autoFocus
                                    value={alias}
                                    onChange={(e) => handleAliasChange(e.target.value)}
                                    maxLength={30}
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    className="flex-1 bg-transparent text-[var(--color-on-surface)] font-inter text-[13px] outline-none placeholder:text-[var(--color-on-surface-variant)]/35"
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>

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
                            {!beneficiaryError && notFoundField && !beneficiary && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-[12px]"
                                style={{ background: "rgba(0,0,0,0.025)", border: "1px dashed rgba(0,0,0,0.10)" }}
                              >
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{ background: "rgba(0,0,0,0.05)" }}
                                >
                                  <Icon name="search_off" size={14} className="text-[var(--color-on-surface-variant)]/50" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-inter font-semibold text-[12px] text-[var(--color-on-surface)] leading-tight">
                                    Sin resultados
                                  </p>
                                  <p className="text-[11px] font-inter text-[var(--color-on-surface-variant)]/55 truncate">
                                    {notFoundField === "alias"
                                      ? <>No hay ningún usuario con el alias <span className="font-semibold text-[var(--color-on-surface)]/75">@{alias}</span></>
                                      : <>No hay ningún usuario con el teléfono <span className="font-semibold text-[var(--color-on-surface)]/75">{PHONE_COUNTRIES[country].dialPrefix} {formatPhoneDisplay(phone, country)}</span></>
                                    }
                                  </p>
                                </div>
                              </motion.div>
                            )}
                            {beneficiary && !isSelfBeneficiary && (
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
                                  <p className="text-[10px] text-[var(--color-on-surface-variant)]/50 font-inter truncate">
                                    {beneficiary.alias ? `@${beneficiary.alias}` : "Usuario de Remita GCS"}
                                  </p>
                                </div>
                                <Icon name="check_circle" size={15} className="text-[var(--color-success-text)] flex-shrink-0" filled />
                              </motion.div>
                            )}
                            {isSelfBeneficiary && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-[12px]"
                                style={{ background: "rgba(186,26,26,0.05)", border: "1px solid rgba(186,26,26,0.18)" }}
                              >
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{ background: "rgba(186,26,26,0.10)" }}
                                >
                                  <Icon name="block" size={14} className="text-[var(--color-error)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-inter font-semibold text-[12px] text-[var(--color-on-surface)] leading-tight">
                                    Eres tú
                                  </p>
                                  <p className="text-[11px] font-inter text-[var(--color-on-surface-variant)]/60 truncate">
                                    No puedes enviarte dinero a ti mismo. Selecciona otro destinatario.
                                  </p>
                                </div>
                              </motion.div>
                            )}

                            {/* Toggle: prefer phone/alias */}
                            <button
                              onClick={() => switchInputMode(inputMode === "phone" ? "alias" : "phone")}
                              className="w-full flex items-center justify-center gap-1.5 pt-1 pb-0.5 text-[12px] font-inter text-[var(--color-on-surface-variant)]/55 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                            >
                              <Icon name="swap_horiz" size={13} />
                              Prefiero enviar por {inputMode === "phone" ? "alias" : "teléfono"}
                            </button>
                          </div>
                        </div>

                        {/* Continuar CTA — primary brand */}
                        <button
                          onClick={() => goToStep(3, 1)}
                          disabled={!beneficiary || isSelfBeneficiary}
                          className="w-full h-[52px] rounded-[14px] flex items-center justify-center gap-2 text-white transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none cursor-pointer mt-2"
                          style={{
                            background: "linear-gradient(135deg, #003ec7 0%, #0052ff 100%)",
                            boxShadow: "0 6px 16px -4px rgba(0,62,199,0.40), 0 2px 4px rgba(0,62,199,0.18), inset 0 1px 0 rgba(255,255,255,0.18)",
                          }}
                        >
                          <span className="font-inter font-semibold text-[14px] tracking-[0.01em]">Continuar</span>
                          <Icon name="arrow_forward" size={16} className="opacity-95" />
                        </button>

                        {/* Frecuentes — secundario, debajo */}
                        {frequentContacts.length > 0 && (
                          <div className="pt-3">
                            <p className="font-inter text-[10px] uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]/40 mb-2.5 px-1">
                              Contactos frecuentes
                            </p>
                            <div className="flex items-start gap-3.5">
                              {frequentContacts.map((contact, idx) => {
                                const palette = ["#003ec7", "#bc4800", "#0d9488"];
                                const color = palette[idx % palette.length];
                                return (
                                  <button
                                    key={contact.id}
                                    onClick={() => selectFrequentContact(contact)}
                                    className="flex flex-col items-center gap-1.5 group transition-all cursor-pointer min-w-0"
                                    style={{ flex: "0 0 auto" }}
                                  >
                                    <div
                                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-manrope font-bold text-[12px] transition-transform group-hover:scale-105 ring-2 ring-transparent group-hover:ring-[var(--color-primary)]/15 opacity-85 group-hover:opacity-100"
                                      style={{ background: color }}
                                    >
                                      {getInitials(contact.name, contact.surname)}
                                    </div>
                                    <p className="font-inter text-[10.5px] text-[var(--color-on-surface-variant)]/65 group-hover:text-[var(--color-on-surface)] leading-tight truncate w-[60px] text-center">
                                      {contact.name}
                                    </p>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* ─── Step 3: Monto + concepto ─── */}
                    {step === 3 && (
                      <motion.div
                        key="user-step-amount"
                        custom={direction}
                        variants={slideVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.26, ease: [0.25, 0.1, 0.25, 1] }}
                        className="space-y-4"
                      >
                        {/* Title */}
                        <div className="space-y-1">
                          <h1 className="font-manrope font-bold text-[24px] text-[var(--color-on-surface)] leading-tight">
                            ¿Cuánto envías?
                          </h1>
                          <p className="text-[13px] font-inter text-[var(--color-on-surface-variant)]/55">
                            Introduce el importe y, si quieres, un concepto.
                          </p>
                        </div>

                        {/* Recipient context pill */}
                        {beneficiary && (
                          <button
                            onClick={() => goToStep(2, -1)}
                            className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full transition-colors hover:bg-[rgba(0,62,199,0.05)] cursor-pointer group"
                            style={{ background: "rgba(0,62,199,0.04)", border: "1px solid rgba(0,62,199,0.10)" }}
                          >
                            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center font-manrope font-bold text-white text-[11px]">
                              {beneficiary.name?.[0] ?? "?"}
                            </div>
                            <span className="font-inter font-semibold text-[12px] text-[var(--color-on-surface)] truncate max-w-[180px]">
                              {beneficiary.name}
                            </span>
                            {beneficiary.alias && (
                              <span className="text-[11px] font-inter text-[var(--color-on-surface-variant)]/55">
                                @{beneficiary.alias}
                              </span>
                            )}
                            <Icon name="edit" size={12} className="text-[var(--color-primary)]/60 group-hover:text-[var(--color-primary)]" />
                          </button>
                        )}

                        {/* Card Monto */}
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
                                autoFocus
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
                              {quickAmounts.map((q) => (
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

                        {/* Concepto (collapsible) */}
                        <AnimatePresence mode="wait">
                          {!showMessage ? (
                            <motion.button
                              key="trigger"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={() => setShowMessage(true)}
                              className="flex items-center gap-1.5 px-1 py-1 text-[var(--color-on-surface-variant)]/50 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                            >
                              <Icon name="add" size={14} />
                              <span className="font-inter text-[12px]">Añadir concepto <span className="opacity-60">(opcional)</span></span>
                            </motion.button>
                          ) : (
                            <motion.div
                              key="input"
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.18 }}
                              className="rounded-[16px] overflow-hidden"
                              style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
                            >
                              <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                                <span className="font-inter font-bold text-[10.5px] uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)]/45">Concepto</span>
                                <button
                                  onClick={() => { setShowMessage(false); setMessage(""); }}
                                  className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[var(--color-surface-container)] transition-colors text-[var(--color-on-surface-variant)]/40 hover:text-[var(--color-on-surface-variant)]"
                                >
                                  <Icon name="close" size={13} />
                                </button>
                              </div>
                              <div className="px-4 pb-3 pt-2">
                                <textarea
                                  autoFocus
                                  placeholder="Escribe un mensaje para el destinatario..."
                                  value={message}
                                  onChange={(e) => setMessage(e.target.value.slice(0, 100))}
                                  disabled={isSending}
                                  rows={2}
                                  className={`w-full px-3.5 py-2 rounded-[12px] text-[var(--color-on-surface)] font-inter text-[13px] border focus:outline-none transition-colors placeholder:text-[var(--color-on-surface-variant)]/30 resize-none ${
                                    message.length >= 100
                                      ? "border-[var(--color-error)]/45 focus:border-[var(--color-error)]"
                                      : "border-[var(--color-outline-variant)]/40 focus:border-[var(--color-primary)]"
                                  }`}
                                  style={{ background: "var(--color-surface-container-lowest)" }}
                                />
                                <div className="flex items-center justify-between mt-1.5 px-0.5 gap-2">
                                  {message.length >= 100 ? (
                                    <motion.p
                                      initial={{ opacity: 0, y: -2 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="flex items-center gap-1 text-[10.5px] font-inter font-medium text-[var(--color-error)] min-w-0"
                                    >
                                      <Icon name="error_outline" size={11} className="flex-shrink-0" />
                                      <span className="truncate">Has alcanzado el máximo de caracteres</span>
                                    </motion.p>
                                  ) : (
                                    <span />
                                  )}
                                  <p className={`text-[10px] font-inter font-medium tabular-nums flex-shrink-0 ${
                                    message.length >= 100
                                      ? "text-[var(--color-error)]"
                                      : "text-[var(--color-on-surface-variant)]/35"
                                  }`}>
                                    {message.length}/100
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Continuar CTA — primary brand */}
                        <button
                          onClick={() => goToStep(4, 1)}
                          disabled={
                            !amount ||
                            parseFloat(amount.replace(",", ".")) <= 0 ||
                            parseFloat(amount.replace(",", ".")) > totalBalance
                          }
                          className="w-full h-[52px] rounded-[14px] flex items-center justify-center gap-2 text-white transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none cursor-pointer mt-2"
                          style={{
                            background: "linear-gradient(135deg, #003ec7 0%, #0052ff 100%)",
                            boxShadow: "0 6px 16px -4px rgba(0,62,199,0.40), 0 2px 4px rgba(0,62,199,0.18), inset 0 1px 0 rgba(255,255,255,0.18)",
                          }}
                        >
                          <span className="font-inter font-semibold text-[14px] tracking-[0.01em]">Continuar</span>
                          <Icon name="arrow_forward" size={16} className="opacity-95" />
                        </button>
                      </motion.div>
                    )}

                    {/* ─── Step 4: Revisar + confirmar ─── */}
                    {step === 4 && beneficiary && (() => {
                      const amountNum = parseFloat(amount.replace(",", ".")) || 0;
                      return (
                        <motion.div
                          key="user-step-review"
                          custom={direction}
                          variants={slideVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={{ duration: 0.26, ease: [0.25, 0.1, 0.25, 1] }}
                          className="space-y-4"
                        >
                          {/* Title */}
                          <div className="space-y-1">
                            <h1 className="font-manrope font-bold text-[24px] text-[var(--color-on-surface)] leading-tight">
                              ¿Todo listo?
                            </h1>
                            <p className="text-[13px] font-inter text-[var(--color-on-surface-variant)]/55">
                              Revisa los datos antes de confirmar el envío.
                            </p>
                          </div>

                          {/* Review hero card — receipt-like layout */}
                          <div
                            className="rounded-[24px] overflow-hidden bg-white"
                            style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 20px -4px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03)" }}
                          >
                            {/* Recipient hero — clickable */}
                            <button
                              type="button"
                              onClick={() => goToStep(2, -1)}
                              className="w-full flex flex-col items-center gap-2.5 px-6 pt-7 pb-5 relative cursor-pointer transition-colors hover:bg-[rgba(0,62,199,0.025)] group"
                            >
                              <span
                                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-[var(--color-on-surface-variant)]/30 group-hover:text-[var(--color-primary)] group-hover:bg-[rgba(0,62,199,0.08)] transition-all"
                                aria-label="Editar destinatario"
                              >
                                <Icon name="edit" size={14} />
                              </span>
                              <div
                                className="w-14 h-14 rounded-full flex items-center justify-center font-manrope font-bold text-white text-[20px]"
                                style={{ background: "linear-gradient(135deg, #003ec7 0%, #0052ff 100%)", boxShadow: "0 4px 14px -2px rgba(0,62,199,0.35)" }}
                              >
                                {beneficiary.name?.[0] ?? "?"}
                              </div>
                              <div className="text-center">
                                <p className="font-manrope font-bold text-[16px] text-[var(--color-on-surface)] leading-tight">
                                  {beneficiary.name}
                                </p>
                                <p className="text-[12px] font-inter text-[var(--color-on-surface-variant)]/60 mt-0.5">
                                  {beneficiary.alias ? `@${beneficiary.alias}` : "Usuario de Remita GCS"}
                                </p>
                              </div>
                            </button>

                            {/* Amount hero — clickable */}
                            <button
                              type="button"
                              onClick={() => goToStep(3, -1)}
                              className="w-full flex flex-col items-center gap-1 px-6 py-5 relative cursor-pointer transition-colors hover:bg-[rgba(0,62,199,0.025)] group"
                              style={{ borderTop: "1px dashed rgba(0,0,0,0.08)" }}
                            >
                              <span
                                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-[var(--color-on-surface-variant)]/30 group-hover:text-[var(--color-primary)] group-hover:bg-[rgba(0,62,199,0.08)] transition-all"
                                aria-label="Editar importe"
                              >
                                <Icon name="edit" size={14} />
                              </span>
                              <span className="font-manrope font-extrabold text-[40px] text-[var(--color-on-surface)] leading-none tracking-[-0.02em]">
                                {formatCurrency(amountNum)}
                              </span>
                              <span className="text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]/45 mt-1">
                                Envías
                              </span>
                            </button>

                            {/* Concepto — clickable, only if provided */}
                            {message && (
                              <button
                                type="button"
                                onClick={() => goToStep(3, -1)}
                                className="w-full flex items-center gap-2.5 px-5 py-3.5 cursor-pointer transition-colors hover:bg-[rgba(0,62,199,0.025)] group text-left"
                                style={{ borderTop: "1px dashed rgba(0,0,0,0.08)" }}
                              >
                                <Icon name="chat_bubble_outline" size={13} className="text-[var(--color-on-surface-variant)]/45 flex-shrink-0" />
                                <span className="text-[12.5px] font-inter text-[var(--color-on-surface)]/85 flex-1 truncate">
                                  {message}
                                </span>
                                <span
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--color-on-surface-variant)]/30 group-hover:text-[var(--color-primary)] group-hover:bg-[rgba(0,62,199,0.08)] transition-all flex-shrink-0"
                                  aria-label="Editar concepto"
                                >
                                  <Icon name="edit" size={14} />
                                </span>
                              </button>
                            )}

                            {/* Read-only details — Comisión + Llegada */}
                            <div
                              className="grid grid-cols-2 px-5 py-3.5 gap-4"
                              style={{ borderTop: "1px solid rgba(0,0,0,0.05)", background: "rgba(0,0,0,0.015)" }}
                            >
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10.5px] font-inter font-medium uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]/45">Comisión</span>
                                <span className="font-manrope font-bold text-[13px] text-[var(--color-success-text)]">Gratis</span>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10.5px] font-inter font-medium uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]/45">Llegada</span>
                                <div className="flex items-center gap-1">
                                  <Icon name="bolt" size={12} className="text-[var(--color-primary)]" />
                                  <span className="font-manrope font-bold text-[13px] text-[var(--color-on-surface)]">Instantáneo</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Saldo después */}
                          <p className="text-[11.5px] font-inter text-[var(--color-on-surface-variant)]/55 text-center px-2">
                            Tu saldo después: <span className="font-semibold text-[var(--color-on-surface)]/75">{formatCurrency(Math.max(0, totalBalance - amountNum))}</span>
                          </p>

                          {/* Hero confirm CTA — invitante con shimmer */}
                          <motion.button
                            onClick={handleSendConfirm}
                            disabled={
                              isSending ||
                              submitted ||
                              amountNum <= 0 ||
                              amountNum > totalBalance
                            }
                            whileHover={{ y: -1.5 }}
                            whileTap={{ scale: 0.99 }}
                            transition={{ type: "spring", stiffness: 380, damping: 26 }}
                            className="relative w-full h-[64px] rounded-[18px] overflow-hidden cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2 group"
                            style={{
                              background: "linear-gradient(120deg, #003ec7 0%, #0052ff 50%, #003ec7 100%)",
                              backgroundSize: "200% 100%",
                              boxShadow: "0 12px 28px -6px rgba(0,62,199,0.45), 0 4px 12px rgba(0,62,199,0.20), inset 0 1px 0 rgba(255,255,255,0.18)",
                            }}
                          >
                            {/* Shimmer sweep */}
                            <motion.div
                              className="absolute inset-y-0 w-1/3 pointer-events-none"
                              animate={{ x: ["-150%", "350%"] }}
                              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.6 }}
                              style={{
                                background: "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)",
                              }}
                            />
                            {/* Content */}
                            <div className="relative h-full flex items-center justify-center gap-2.5 px-5 text-white">
                              <span className="font-inter font-semibold text-[15px] tracking-[0.01em] leading-none">
                                {isSending ? "Enviando…" : "Enviar"}
                              </span>
                              <motion.span
                                className="inline-flex items-center leading-none"
                                animate={{ x: [0, 3, 0] }}
                                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                              >
                                <Icon name="arrow_forward" size={18} className="text-white leading-none" />
                              </motion.span>
                            </div>
                          </motion.button>
                        </motion.div>
                      );
                    })()}

                  </AnimatePresence>
                </div>

                {/* ══ RIGHT: Sticky on-chain benefits panel (desktop only) ══ */}
                <div className="hidden lg:flex lg:flex-col lg:gap-4 lg:sticky lg:top-[96px]">
                  <div
                    className="rounded-[18px] overflow-hidden"
                    style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
                  >
                    <div
                      className="px-4 py-3.5 flex items-center gap-3"
                      style={{ background: "rgba(0,62,199,0.04)", borderBottom: "1px solid rgba(0,62,199,0.08)" }}
                    >
                      <Icon name="verified_user" size={20} className="text-[var(--color-primary)]" filled />
                      <p className="font-manrope font-bold text-[15px]" style={{ color: "#003ec7" }}>
                        Transferencia on-chain
                      </p>
                    </div>

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
                  {quickAmounts.map((quickAmount) => (
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
                onClick={() => goToStep(4, 1)}
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
              recipientIdentifier={
                activeField === "alias" || beneficiary?.alias
                  ? `@${beneficiary?.alias ?? alias}`
                  : `${PHONE_COUNTRIES[country].dialPrefix} ${formatPhoneDisplay(phone, country)}`
              }
              senderName={senderName}
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
                    goToStep(4, -1);
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
