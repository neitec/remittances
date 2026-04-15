"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddExternalAccount } from "@/lib/hooks/useAddExternalAccount";
import { ExternalAccount } from "@/lib/types";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BankAccountFormProps {
  onSuccess: (account: ExternalAccount) => void;
  onCancel?: () => void;
  defaultExpanded?: boolean;
}

function validateIBAN(raw: string): string | null {
  const cleaned = raw.replace(/\s/g, "").toUpperCase();

  if (cleaned.length < 15) {
    return "El IBAN debe tener al menos 15 caracteres";
  }

  if (!cleaned.match(/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/)) {
    return "Formato de IBAN no válido";
  }

  return null;
}

export function BankAccountForm({
  onSuccess,
  onCancel,
  defaultExpanded = false,
}: BankAccountFormProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumberError, setAccountNumberError] = useState<string | null>(null);

  const { mutate, isPending } = useAddExternalAccount();

  const handleAccountNumberChange = (value: string) => {
    const cleaned = value.toUpperCase();
    setAccountNumber(cleaned);
    if (cleaned) {
      setAccountNumberError(validateIBAN(cleaned));
    } else {
      setAccountNumberError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bankName.trim()) {
      toast.error("Por favor ingresa el nombre del banco");
      return;
    }

    const error = validateIBAN(accountNumber);
    if (error) {
      setAccountNumberError(error);
      return;
    }

    const cleanedAccountNumber = accountNumber.replace(/\s/g, "").toUpperCase();

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
          onSuccess(newAccount);
          toast.success("Cuenta bancaria guardada");
        },
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : "Error al guardar la cuenta";
          toast.error(message);
        },
      }
    );
  };

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
            className="w-full p-4 border-2 border-dashed border-brand-sand/40 rounded-lg cursor-pointer transition-all hover:border-brand-coral hover:bg-brand-coral/5 flex items-center justify-center gap-2 text-brand-sand/80 hover:text-brand-coral font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Añadir nueva cuenta bancaria
          </motion.button>
        )}

        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-4 p-4 rounded-lg border-2 border-brand-sand/30 bg-brand-sand/8 shadow-sm"
          >
            <p className="text-sm font-semibold text-brand-navy">
              Nueva cuenta bancaria
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="accountNumber" className="text-sm text-brand-navy font-semibold">
                  IBAN
                </Label>
                <Input
                  id="accountNumber"
                  type="text"
                  placeholder="ES91 2100 0418 4502 0005 1332"
                  value={accountNumber}
                  onChange={(e) => handleAccountNumberChange(e.target.value)}
                  disabled={isPending}
                  className={`border-2 mt-2 focus:ring-brand-coral/20 ${
                    accountNumberError
                      ? "border-brand-coral focus:border-brand-coral"
                      : "border-brand-sand/30 focus:border-brand-coral"
                  }`}
                />
                {accountNumberError && (
                  <p className="text-xs text-brand-coral mt-1 font-medium">{accountNumberError}</p>
                )}
                <p className="text-xs text-brand-sand/70 mt-2">
                  Cuenta bancaria SEPA (Europa)
                </p>
              </div>

              <div>
                <Label htmlFor="bankName" className="text-sm text-brand-navy font-semibold">
                  Nombre del banco
                </Label>
                <Input
                  id="bankName"
                  type="text"
                  placeholder="Ej: CaixaBank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  disabled={isPending}
                  className="border-2 border-brand-sand/30 focus:border-brand-coral focus:ring-brand-coral/20 mt-2"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isPending || !!accountNumberError || !bankName.trim() || !accountNumber.trim()}
                  className="flex-1 bg-brand-coral hover:bg-brand-coral/90 text-white font-bold py-2 h-10"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar cuenta"
                  )}
                </Button>
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsExpanded(false);
                      setAccountNumber("");
                      setBankName("");
                      setAccountNumberError(null);
                    }}
                    disabled={isPending}
                    className="flex-1 text-brand-navy border-brand-sand/30 hover:bg-brand-sand/5 h-10"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
