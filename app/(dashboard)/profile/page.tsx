"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import { AppHeader } from "@/components/nav/AppHeader";
import { Icon } from "@/components/ui/Icon";
import { toast } from "sonner";
import { ProfileSkeleton } from "@/components/motion/ShimmerSkeleton";

type EditField = "phone" | "alias" | null;

const MOCK_PHONE = "+34 616 494 838";
const MOCK_ALIAS = "eduardrem";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-inter font-bold text-[10px] uppercase tracking-[0.16em] text-[var(--color-on-surface-variant)]/45">
      {children}
    </p>
  );
}

function InfoRow({
  icon,
  label,
  value,
  onEdit,
  placeholder,
  accent,
}: {
  icon: string;
  label: string;
  value?: string;
  onEdit?: () => void;
  placeholder?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 group">
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
        style={{ background: accent ? "rgba(0,62,199,0.08)" : "rgba(0,0,0,0.05)" }}
      >
        <Icon name={icon} size={17} className={accent ? "text-[var(--color-primary)]" : "text-[var(--color-on-surface-variant)]/60"} filled />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-inter text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]/40 mb-0.5">{label}</p>
        {value ? (
          <p className="font-inter text-[13.5px] text-[var(--color-on-surface)] font-medium truncate">{value}</p>
        ) : (
          <p className="font-inter text-[13px] text-[var(--color-on-surface-variant)]/35 italic">{placeholder ?? "No configurado"}</p>
        )}
      </div>
      {onEdit && (
        <button
          onClick={onEdit}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full flex items-center justify-center hover:bg-[rgba(0,62,199,0.08)]"
        >
          <Icon name="edit" size={15} className="text-[var(--color-primary)]" />
        </button>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const [editField, setEditField] = useState<EditField>(null);
  const [phoneValue, setPhoneValue] = useState(MOCK_PHONE);
  const [aliasValue, setAliasValue] = useState(MOCK_ALIAS);
  const [draftValue, setDraftValue] = useState("");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <AppHeader />
        <ProfileSkeleton />
      </div>
    );
  }

  const displayName = "Eduardo";
  const displayEmail = "eduardo@neitec.io";

  const initials = displayName
    .split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase();

  const openEdit = (field: EditField) => {
    setDraftValue(field === "phone" ? phoneValue : aliasValue);
    setEditField(field);
  };

  const saveEdit = () => {
    if (editField === "phone") setPhoneValue(draftValue);
    if (editField === "alias") setAliasValue(draftValue);
    setEditField(null);
    toast.success("Datos actualizados correctamente");
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <AppHeader />

      <main className="pt-[84px] px-5 pb-32 lg:pb-10 lg:pl-12 lg:pr-10">
        <div className="max-w-[1088px]">

          {/* Page header */}
          <div className="pt-3 mb-6 space-y-0.5">
            <h1 className="font-inter font-medium text-[20px] text-[var(--color-on-surface-variant)] leading-tight">
              Mi cuenta
            </h1>
            <p className="text-[13px] font-inter text-[var(--color-on-surface-variant)]/50">
              Gestiona tu perfil y datos de transferencia
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="space-y-4"
          >

            {/* ── Hero card ── */}
            <div
              className="rounded-[22px] p-6 relative overflow-hidden"
              style={{ background: "linear-gradient(145deg, #001462 0%, #003ec7 60%, #1252e8 100%)" }}
            >
              {/* Subtle grid */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.06]"
                style={{
                  backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />
              {/* Orb */}
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)" }} />

              <div className="relative flex items-center gap-5">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-[72px] h-[72px] rounded-full flex items-center justify-center border-[2.5px] border-white/20"
                    style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}
                  >
                    <span className="text-white font-manrope font-bold text-[26px] leading-none">{initials}</span>
                  </div>
                  {/* Online dot */}
                  <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
                </div>

                {/* Name & badge */}
                <div className="flex-1 min-w-0">
                  <p className="font-manrope font-bold text-white text-[20px] leading-tight truncate">
                    {displayName}
                  </p>
                  <p className="font-inter text-[13px] text-white/60 mt-0.5 truncate">{displayEmail}</p>
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>
                    <Icon name="workspace_premium" size={12} className="text-white/80" filled />
                    <span className="font-inter font-bold text-[10px] uppercase tracking-[0.12em] text-white/80">Member</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Identificadores de transferencia ── */}
            <div
              className="rounded-[22px] overflow-hidden"
              style={{ background: "white", border: "1px solid rgba(0,62,199,0.10)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
            >
              {/* Header */}
              <div
                className="px-5 py-3.5 flex items-center justify-between"
                style={{ background: "rgba(0,62,199,0.04)", borderBottom: "1px solid rgba(0,62,199,0.08)" }}
              >
                <div className="flex items-center gap-2">
                  <Icon name="swap_horiz" size={14} className="text-[var(--color-primary)]" />
                  <SectionLabel>Identificadores de transferencia</SectionLabel>
                </div>
                <span
                  className="text-[10px] font-inter font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(0,62,199,0.08)", color: "#003ec7" }}
                >
                  Cómo te encuentran
                </span>
              </div>

              {/* Phone row */}
              <AnimatePresence mode="wait">
                {editField === "phone" ? (
                  <motion.div
                    key="edit-phone"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-5 py-4 space-y-3"
                  >
                    <p className="font-inter text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]/40">Teléfono</p>
                    <input
                      autoFocus
                      type="tel"
                      value={draftValue}
                      onChange={(e) => setDraftValue(e.target.value)}
                      className="w-full h-11 px-4 rounded-[12px] font-inter text-[13px] text-[var(--color-on-surface)] border border-[var(--color-primary)] outline-none"
                      style={{ background: "rgba(0,62,199,0.03)" }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="flex-1 h-10 rounded-[12px] bg-[var(--color-primary)] text-white font-inter font-bold text-[12px]"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditField(null)}
                        className="flex-1 h-10 rounded-[12px] font-inter font-bold text-[12px] text-[var(--color-on-surface-variant)]"
                        style={{ background: "rgba(0,0,0,0.05)" }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="view-phone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <InfoRow
                      icon="phone"
                      label="Teléfono"
                      value={phoneValue}
                      placeholder="Añade tu número de teléfono"
                      onEdit={() => openEdit("phone")}
                      accent
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mx-5 h-px" style={{ background: "rgba(0,0,0,0.05)" }} />

              {/* Alias row */}
              <AnimatePresence mode="wait">
                {editField === "alias" ? (
                  <motion.div
                    key="edit-alias"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-5 py-4 space-y-3"
                  >
                    <p className="font-inter text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)]/40">Alias</p>
                    <div
                      className="flex items-center gap-2 h-11 px-4 rounded-[12px] border border-[var(--color-primary)]"
                      style={{ background: "rgba(0,62,199,0.03)" }}
                    >
                      <span className="font-manrope font-bold text-[var(--color-primary)] text-[16px] leading-none">@</span>
                      <input
                        autoFocus
                        type="text"
                        value={draftValue}
                        onChange={(e) => setDraftValue(e.target.value)}
                        className="flex-1 bg-transparent font-inter text-[13px] text-[var(--color-on-surface)] outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="flex-1 h-10 rounded-[12px] bg-[var(--color-primary)] text-white font-inter font-bold text-[12px]"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditField(null)}
                        className="flex-1 h-10 rounded-[12px] font-inter font-bold text-[12px] text-[var(--color-on-surface-variant)]"
                        style={{ background: "rgba(0,0,0,0.05)" }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="view-alias" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <InfoRow
                      icon="alternate_email"
                      label="Alias"
                      value={aliasValue ? `@${aliasValue}` : undefined}
                      placeholder="Añade un alias único"
                      onEdit={() => openEdit("alias")}
                      accent
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info footer */}
              <div
                className="px-5 py-3 flex items-center gap-2"
                style={{ background: "rgba(188,72,0,0.05)", borderTop: "1px solid rgba(188,72,0,0.10)" }}
              >
                <span className="flex-shrink-0" style={{ color: "#bc4800" }}><Icon name="info" size={13} filled /></span>
                <p className="font-inter text-[11px] leading-relaxed" style={{ color: "rgba(188,72,0,0.65)" }}>
                  Otros usuarios pueden enviarte dinero usando tu teléfono o alias.
                </p>
              </div>
            </div>

            {/* ── Datos personales ── */}
            <div
              className="rounded-[22px] overflow-hidden"
              style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
            >
              <div className="px-5 py-3.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                <SectionLabel>Información personal</SectionLabel>
              </div>

              <InfoRow icon="person" label="Nombre completo" value={displayName} />
              <div className="mx-5 h-px" style={{ background: "rgba(0,0,0,0.05)" }} />
              <InfoRow icon="mail" label="Correo electrónico" value={displayEmail} />
            </div>

            {/* ── Configuración rápida ── */}
            <div
              className="rounded-[22px] overflow-hidden"
              style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
            >
              <div className="px-5 py-3.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                <SectionLabel>Configuración</SectionLabel>
              </div>

              {[
                { icon: "notifications", label: "Notificaciones", sub: "Gestiona tus alertas" },
                { icon: "security", label: "Seguridad", sub: "Contraseña y autenticación" },
                { icon: "help_outline", label: "Ayuda y soporte", sub: "Centro de ayuda" },
              ].map((item, i) => (
                <div key={item.label}>
                  <button
                    onClick={() => toast.info(`${item.label} próximamente disponible`)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[rgba(0,62,199,0.03)] transition-colors text-left group"
                  >
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,0,0,0.05)" }}>
                      <Icon name={item.icon} size={17} className="text-[var(--color-on-surface-variant)]/55" filled />
                    </div>
                    <div className="flex-1">
                      <p className="font-inter font-semibold text-[13.5px] text-[var(--color-on-surface)]">{item.label}</p>
                      <p className="font-inter text-[11px] text-[var(--color-on-surface-variant)]/45 mt-0.5">{item.sub}</p>
                    </div>
                    <Icon name="chevron_right" size={18} className="text-[var(--color-on-surface-variant)]/30 group-hover:text-[var(--color-primary)]/50 transition-colors" />
                  </button>
                  {i < 2 && <div className="mx-5 h-px" style={{ background: "rgba(0,0,0,0.05)" }} />}
                </div>
              ))}
            </div>

            {/* ── Cerrar sesión ── */}
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2.5 h-14 rounded-[18px] font-inter font-bold text-[13px] transition-all hover:opacity-80 active:scale-[0.99]"
              style={{ background: "rgba(188,72,0,0.07)", color: "#bc4800", border: "1px solid rgba(188,72,0,0.12)" }}
            >
              <Icon name="logout" size={18} style={{ color: "#bc4800" }} />
              Cerrar sesión
            </button>

          </motion.div>
        </div>
      </main>
    </div>
  );
}
