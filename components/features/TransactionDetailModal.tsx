"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { Transaction, TransactionType } from "@/lib/api";
import { formatCurrency, getInitials } from "@/lib/format";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Icon } from "@/components/ui/Icon";
import { useMe } from "@/lib/hooks/queries/useMe";
import { TransactionStatusSection } from "@/components/features/TransactionStatusSection";
import { mapToUiStatus } from "@/lib/transactionStatus";
import { toast } from "sonner";

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

type Direction = "outgoing" | "incoming" | "deposit";

const DIRECTION_THEME: Record<Direction, {
  gradient: string;
  shadow: string;
  innerOrbA: string;
  innerOrbB: string;
  warmOrb: string;
  pillBg: string;
  pillFg: string;
  pillIcon: string;
  pillLabel: string;
  amountSign: string;
}> = {
  outgoing: {
    gradient: "linear-gradient(145deg, #001462 0%, #003ec7 52%, #1252e8 100%)",
    shadow: "0 8px 32px rgba(0,62,199,0.32), 0 2px 8px rgba(0,0,0,0.10)",
    innerOrbA: "radial-gradient(circle, rgba(100,168,255,0.22) 0%, transparent 68%)",
    innerOrbB: "radial-gradient(circle, rgba(0,48,190,0.52) 0%, transparent 68%)",
    warmOrb: "radial-gradient(circle, rgba(255,185,110,0.09) 0%, rgba(255,140,60,0.04) 45%, transparent 68%)",
    pillBg: "rgba(255,255,255,0.13)",
    pillFg: "rgba(255,255,255,0.95)",
    pillIcon: "north_east",
    pillLabel: "Enviado",
    amountSign: "−",
  },
  incoming: {
    gradient: "linear-gradient(145deg, #064e3b 0%, #047857 52%, #10b981 100%)",
    shadow: "0 8px 32px rgba(16,185,129,0.30), 0 2px 8px rgba(0,0,0,0.10)",
    innerOrbA: "radial-gradient(circle, rgba(110,231,183,0.20) 0%, transparent 68%)",
    innerOrbB: "radial-gradient(circle, rgba(4,120,87,0.50) 0%, transparent 68%)",
    warmOrb: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 68%)",
    pillBg: "rgba(255,255,255,0.15)",
    pillFg: "rgba(255,255,255,0.95)",
    pillIcon: "south_west",
    pillLabel: "Recibido",
    amountSign: "+",
  },
  deposit: {
    gradient: "linear-gradient(145deg, #1a1c4d 0%, #003ec7 50%, #bc4800 130%)",
    shadow: "0 8px 32px rgba(0,62,199,0.28), 0 2px 8px rgba(0,0,0,0.10)",
    innerOrbA: "radial-gradient(circle, rgba(100,168,255,0.20) 0%, transparent 68%)",
    innerOrbB: "radial-gradient(circle, rgba(188,72,0,0.30) 0%, transparent 68%)",
    warmOrb: "radial-gradient(circle, rgba(255,185,110,0.12) 0%, rgba(255,140,60,0.05) 45%, transparent 68%)",
    pillBg: "rgba(255,255,255,0.13)",
    pillFg: "rgba(255,255,255,0.95)",
    pillIcon: "account_balance",
    pillLabel: "Depósito SEPA",
    amountSign: "+",
  },
};

function formatLongDate(dateString: string): string {
  try {
    const d = parseISO(dateString);
    return format(d, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
  } catch {
    return dateString;
  }
}

function formatTime(dateString: string): string {
  try {
    return format(parseISO(dateString), "HH:mm 'h'");
  } catch {
    return "";
  }
}

export function TransactionDetailModal({
  transaction,
  onClose,
}: TransactionDetailModalProps) {
  return (
    <AnimatePresence>
      {transaction && <ModalInner key="tx-detail" txn={transaction} onClose={onClose} />}
    </AnimatePresence>
  );
}

function ModalInner({ txn, onClose }: { txn: Transaction; onClose: () => void }) {
  const { data: me } = useMe();

  // Esc closes + scroll lock
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const isTransfer = txn.type === TransactionType.TRANSFER;
  const isDeposit  = txn.type === TransactionType.DEPOSIT;

  const isOutgoing = isTransfer && me && (
    txn.sourceAccount?.userId === me.id ||
    txn.sourceAccount?.user?.email === me.email
  );
  const direction: Direction = isDeposit ? "deposit" : isOutgoing ? "outgoing" : "incoming";
  const theme = DIRECTION_THEME[direction];

  const contact = isOutgoing ? txn.destinationAccount?.user : txn.sourceAccount?.user;
  const uiStatus = mapToUiStatus(txn.type, txn.status, !!isOutgoing);

  const counterpartyLabel = isOutgoing ? "Para" : "De";

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copiado`);
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">

        {/* Backdrop with blur over the underlying page */}
        <motion.button
          key="tx-detail-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute inset-0 cursor-default"
          style={{
            background: "rgba(15,18,30,0.45)",
            backdropFilter: "blur(14px) saturate(120%)",
            WebkitBackdropFilter: "blur(14px) saturate(120%)",
          }}
        />

        {/* Modal panel */}
        <motion.div
          key="tx-detail-panel"
          initial={{ opacity: 0, y: 24, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.99 }}
          transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
          role="dialog"
          aria-modal="true"
          className="relative w-full lg:max-w-[920px] max-h-[92vh] overflow-y-auto rounded-t-[28px] lg:rounded-[28px] mx-0 lg:mx-4"
          style={{
            background: "var(--color-background)",
            boxShadow: "0 24px 64px -12px rgba(0,0,0,0.32), 0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          {/* Floating close button */}
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.04)",
            }}
          >
            <Icon name="close" size={16} className="text-[var(--color-on-surface-variant)]" />
          </button>

          {/* Drag handle on mobile */}
          <div className="flex lg:hidden justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-[var(--color-on-surface-variant)]/15" />
          </div>

          <div className="px-5 lg:px-7 pt-3 lg:pt-7 pb-7 space-y-4">

            {/* ── Hero amount card ── */}
            <motion.div
              className="rounded-[22px] relative overflow-hidden"
              style={{
                background: theme.gradient,
                backgroundSize: "200% 200%",
                boxShadow: theme.shadow,
              }}
              animate={{ backgroundPosition: ["0% 0%", "100% 50%", "50% 100%", "0% 0%"] }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Diagonal sheen sweep — periodic */}
              <motion.div
                className="absolute inset-y-0 w-1/3 pointer-events-none z-[1]"
                animate={{ x: ["-150%", "350%"] }}
                transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 3.4 }}
                style={{
                  background: "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.13) 50%, transparent 100%)",
                }}
              />

              {/* Animated orbs */}
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{ width: 220, height: 220, top: -70, left: -50, background: theme.innerOrbA }}
                animate={{ x: [0, 20, 6, 0], y: [0, 14, 28, 0] }}
                transition={{ duration: 16, ease: "easeInOut", repeat: Infinity }}
              />
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{ width: 280, height: 280, bottom: -100, right: -70, background: theme.innerOrbB }}
                animate={{ x: [0, -16, -28, 0], y: [0, -10, -20, 0] }}
                transition={{ duration: 22, ease: "easeInOut", repeat: Infinity, delay: 2.5 }}
              />
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{ width: 200, height: 200, top: -40, right: "20%", background: theme.warmOrb }}
                animate={{ x: [0, -18, -30, -18, 0], y: [0, 20, 10, -4, 0] }}
                transition={{ duration: 19, ease: "easeInOut", repeat: Infinity, delay: 1.2 }}
              />
              {/* Grid texture */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: "linear-gradient(rgba(255,255,255,0.030) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.030) 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />

              <div className="relative z-10 p-6 lg:p-6">
                {/* Direction pill */}
                <div className="flex items-center justify-between mb-5 lg:mb-4">
                  <span
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10.5px] font-inter font-bold uppercase tracking-[0.18em]"
                    style={{ background: theme.pillBg, color: theme.pillFg }}
                  >
                    <Icon name={theme.pillIcon} size={11} />
                    {theme.pillLabel}
                  </span>
                  <span className="text-[10.5px] font-inter font-semibold uppercase tracking-[0.16em] text-white/55">
                    {formatTime(txn.createdAt)}
                  </span>
                </div>

                {/* Amount + date row (desktop side-by-side, mobile stacked) */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 lg:gap-6">
                  <div className="space-y-1.5">
                    <p className="font-manrope font-extrabold leading-none tracking-tight text-white text-[clamp(40px,7vw,56px)]">
                      {theme.amountSign}{formatCurrency(parseFloat(txn.amount))}
                    </p>
                    <p className="text-[10.5px] font-inter font-bold uppercase tracking-[0.22em] text-white/55">
                      {txn.currency}
                    </p>
                  </div>
                  <p className="text-[12px] font-inter text-white/65 first-letter:uppercase lg:text-right lg:max-w-[40%]">
                    {formatLongDate(txn.createdAt)}
                  </p>
                </div>

                {/* Concepto inline (only when present) */}
                {txn.reference && (
                  <div className="mt-5 pt-4 border-t border-white/15">
                    <p className="text-[10px] font-inter font-bold uppercase tracking-[0.22em] text-white/55 mb-1.5">
                      Concepto
                    </p>
                    <p className="text-[13.5px] font-inter italic text-white/90 leading-relaxed">
                      &ldquo;{txn.reference}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* ── 2-col split below hero (desktop) / stacked (mobile) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-4">

              {/* ═══ LEFT: Quién ═══ */}
              <div className="space-y-4 min-w-0">

                {/* Counterparty (transfers) */}
                {isTransfer && contact && (
                  <Card>
                    <CardHeader label={counterpartyLabel} />
                    <div className="px-5 py-4 flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center font-manrope font-extrabold text-[16px] text-white"
                        style={{
                          background: "linear-gradient(135deg, #003ec7 0%, #1252e8 100%)",
                          boxShadow: "0 4px 12px rgba(0,62,199,0.20)",
                        }}
                      >
                        {getInitials(contact.name, contact.surname)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-manrope font-extrabold text-[15.5px] text-[var(--color-on-surface)] leading-tight truncate">
                          {contact.name} {contact.surname}
                        </p>
                        <p className="text-[12px] font-inter font-semibold mt-0.5 truncate" style={{ color: "var(--color-primary)" }}>
                          {contact.alias ? `@${contact.alias}` : "Usuario de Remita GCS"}
                        </p>
                        <p className="text-[11px] font-inter text-[var(--color-on-surface-variant)]/55 mt-1 flex items-center gap-1.5 min-w-0">
                          {contact.country ? (
                            <>
                              <CountryFlag country={contact.country} className="w-[14px] h-[10px] rounded-[2px] ring-1 ring-black/5 flex-shrink-0" />
                              <span className="truncate">{contact.country}</span>
                            </>
                          ) : (
                            <>
                              <Icon name="public" size={11} className="text-[var(--color-on-surface-variant)]/40 flex-shrink-0" />
                              <span className="truncate">País no disponible</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid rgba(0,0,0,0.04)" }}>
                      <CopyRow
                        icon="mail"
                        label="Email"
                        value={contact.email || "—"}
                        onCopy={() => contact.email && copy(contact.email, "Email")}
                      />
                      <CopyRow
                        icon="phone"
                        label="Teléfono"
                        value={contact.phone || "—"}
                        onCopy={() => contact.phone && copy(contact.phone, "Teléfono")}
                        topBorder
                      />
                    </div>
                  </Card>
                )}

                {/* Origin (deposits) */}
                {isDeposit && txn.externalAccount && (
                  <Card>
                    <CardHeader label="Origen" />
                    <div className="px-5 py-4 flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-[16px] flex-shrink-0 flex items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg, #003ec7 0%, #1252e8 100%)",
                          boxShadow: "0 4px 12px rgba(0,62,199,0.20)",
                        }}
                      >
                        <Icon name="account_balance" size={22} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-manrope font-extrabold text-[15.5px] text-[var(--color-on-surface)] leading-tight truncate">
                          {txn.externalAccount.bankName}
                        </p>
                        <p className="text-[12px] font-inter font-semibold mt-0.5" style={{ color: "var(--color-primary)" }}>
                          Cuenta bancaria
                        </p>
                        <p className="text-[11px] font-inter text-[var(--color-on-surface-variant)]/55 mt-1 flex items-center gap-1.5">
                          <Icon name="bolt" size={11} className="text-[var(--color-primary)]/60" />
                          Transferencia SEPA
                        </p>
                      </div>
                    </div>

                    {txn.externalAccount.accountNumber && (
                      <div style={{ borderTop: "1px solid rgba(0,0,0,0.04)" }}>
                        <CopyRow
                          icon="tag"
                          label="IBAN"
                          value={txn.externalAccount.accountNumber}
                          onCopy={() => copy(txn.externalAccount!.accountNumber, "IBAN")}
                          mono
                        />
                        <CopyRow
                          icon="paid"
                          label="Divisa"
                          value={txn.externalAccount.currency}
                          onCopy={() => copy(txn.externalAccount!.currency, "Divisa")}
                          topBorder
                        />
                      </div>
                    )}
                  </Card>
                )}
              </div>

              {/* ═══ RIGHT: Estado ═══ */}
              <div className="space-y-4 min-w-0">
                <TransactionStatusSection
                  uiStatus={uiStatus}
                  isUserOrigin={isDeposit ? undefined : !!isOutgoing}
                />
              </div>
            </div>

            {/* Descargar comprobante — full-width banner row */}
            <button
              onClick={() => toast.info("Comprobante PDF disponible muy pronto")}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] cursor-pointer transition-colors hover:bg-[rgba(0,62,199,0.04)] group text-left"
              style={{
                background: "var(--color-surface-container-lowest)",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              <div
                className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(0,62,199,0.08)" }}
              >
                <Icon name="download" size={18} className="text-[var(--color-primary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter font-semibold text-[13.5px] text-[var(--color-on-surface)] leading-tight">
                  Descargar comprobante
                </p>
                <p className="text-[11.5px] font-inter text-[var(--color-on-surface-variant)]/55 mt-0.5">
                  PDF con todos los datos de la transacción
                </p>
              </div>
              <Icon
                name="chevron_right"
                size={18}
                className="text-[var(--color-on-surface-variant)]/30 group-hover:text-[var(--color-primary)] transition-colors flex-shrink-0"
              />
            </button>

            {/* Help link — centered subtle text */}
            <button
              onClick={() => toast.info("Soporte disponible muy pronto")}
              className="w-full flex items-center justify-center gap-1.5 py-2 mt-1 font-inter text-[12px] text-[var(--color-on-surface-variant)]/55 cursor-pointer transition-colors hover:text-[var(--color-primary)]"
            >
              <Icon name="support_agent" size={13} />
              ¿Algún problema con esta transacción?
            </button>
          </div>
        </motion.div>
      </div>
  );
}

/* ───────── Small composables ───────── */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section
      className="rounded-[20px] overflow-hidden"
      style={{
        background: "var(--color-surface-container-lowest)",
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      {children}
    </section>
  );
}

function CardHeader({ label, icon }: { label: string; icon?: string }) {
  return (
    <div
      className="px-5 py-2.5 flex items-center gap-2"
      style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
    >
      {icon && <Icon name={icon} size={12} className="text-[var(--color-on-surface-variant)]/40" />}
      <p className="font-inter font-bold text-[10px] uppercase tracking-[0.22em] text-[var(--color-on-surface-variant)]/45">
        {label}
      </p>
    </div>
  );
}

function CopyRow({
  icon,
  label,
  value,
  onCopy,
  topBorder,
  mono,
}: {
  icon: string;
  label: string;
  value: string;
  onCopy: () => void;
  topBorder?: boolean;
  mono?: boolean;
}) {
  return (
    <button
      onClick={onCopy}
      className="w-full flex items-center gap-3 px-5 py-3 text-left group transition-colors hover:bg-[rgba(0,62,199,0.04)] cursor-pointer"
      style={topBorder ? { borderTop: "1px solid rgba(0,0,0,0.04)" } : {}}
    >
      <div
        className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(0,62,199,0.06)" }}
      >
        <Icon name={icon} size={14} className="text-[var(--color-primary)]/70" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-inter font-semibold uppercase tracking-[0.14em] text-[var(--color-on-surface-variant)]/45">{label}</p>
        <p className={`text-[12.5px] text-[var(--color-on-surface)] truncate ${mono ? "font-mono" : "font-inter"}`}>{value}</p>
      </div>
      <Icon
        name="content_copy"
        size={13}
        className="text-[var(--color-on-surface-variant)]/25 group-hover:text-[var(--color-primary)]/70 transition-colors flex-shrink-0"
      />
    </button>
  );
}
