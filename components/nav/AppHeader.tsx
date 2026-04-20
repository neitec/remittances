"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import { Icon } from "@/components/ui/Icon";
import { useRouter } from "next/navigation";

interface AppHeaderProps {
  onBack?: () => void;
  showBack?: boolean;
}

const MOCK_NOTIFICATION = {
  id: "N-001",
  icon: "south_west" as const,
  title: "Depósito recibido",
  body: "Has recibido +500,00 € vía SEPA en tu wallet on-chain.",
  time: "Hace 2 horas",
};

export function AppHeader({ onBack, showBack }: AppHeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showNotif) return;
    const handler = (e: MouseEvent) => {
      if (!notifRef.current?.contains(e.target as Node)) setShowNotif(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotif]);

  const userName = "Eduardo";
  const initials = "E";

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-6 lg:pl-[calc(208px+2rem)] lg:pr-8"
      style={{
        background: "rgba(248, 249, 250, 0.75)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(0,0,0,0.04)",
      }}
    >
      {/* Left: Back (optional) + Avatar + Greeting */}
      <div className="flex items-center gap-3 flex-1">
        {showBack && (
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-container-low)] transition-colors flex-shrink-0 -ml-1"
            aria-label="Volver"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="arrow-grad" x1="19" y1="12" x2="6" y2="12" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#0052ff" />
                    <stop offset="100%" stopColor="#bc4800" />
                  </linearGradient>
                </defs>
                <line x1="19" y1="12" x2="6" y2="12" stroke="url(#arrow-grad)" strokeWidth="2.2" strokeLinecap="round" />
                <polyline points="13 6 6 12 13 18" fill="none" stroke="url(#arrow-grad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
          </button>
        )}
        <div className="relative flex-shrink-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-manrope font-bold text-[13px]"
            style={{
              background: "linear-gradient(135deg, #003ec7, #0052ff)",
              boxShadow: "0 2px 8px rgba(0,62,199,0.35)",
            }}
          >
            {initials}
          </div>
          {/* Online indicator */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white block" />
        </div>
        <div>
          <p className="text-[13px] font-manrope font-bold text-[var(--color-on-surface)] leading-tight">
            Hola, {userName}
          </p>
          <p className="text-[10px] font-inter font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            Member
          </p>
        </div>
      </div>

      {/* Right: Bell + QR */}
      <div className="flex items-center gap-2">

        {/* Bell notification */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif((v) => !v)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 cursor-pointer"
            style={{
              background: showNotif
                ? "var(--color-surface-container)"
                : "var(--color-surface-container-low)",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
            aria-label="Notificaciones"
          >
            <Icon name="notifications" size={18} className="text-[var(--color-on-surface)]" />
            <span
              className="absolute -top-1 -right-1 w-[16px] h-[16px] rounded-full flex items-center justify-center text-white font-inter font-bold"
              style={{
                background: "var(--color-tertiary-container)",
                fontSize: "9px",
                lineHeight: 1,
              }}
            >
              1
            </span>
          </button>

          {/* Notification dropdown */}
          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 z-50"
                style={{ top: "calc(100% + 8px)", width: "300px" }}
              >
                <div
                  className="rounded-[18px] overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.97)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                    border: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
                  >
                    <p className="text-[13px] font-manrope font-bold text-[var(--color-on-surface)]">
                      Notificaciones
                    </p>
                    <span
                      className="text-[10px] font-inter font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: "var(--color-tertiary-fixed)",
                        color: "var(--color-tertiary)",
                      }}
                    >
                      1 nueva
                    </span>
                  </div>

                  <div className="px-4 py-3 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-[12px] bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon name={MOCK_NOTIFICATION.icon} size={18} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-manrope font-semibold text-[var(--color-on-surface)] leading-tight">
                        {MOCK_NOTIFICATION.title}
                      </p>
                      <p className="text-[12px] font-inter text-[var(--color-on-surface-variant)]/65 mt-0.5 leading-snug">
                        {MOCK_NOTIFICATION.body}
                      </p>
                      <p className="text-[11px] font-inter text-[var(--color-on-surface-variant)]/40 mt-1.5">
                        {MOCK_NOTIFICATION.time}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* QR */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 cursor-pointer"
          style={{
            background: "var(--color-primary-fixed)",
            border: "1px solid rgba(0,62,199,0.08)",
          }}
        >
          <Icon name="qr_code_2" size={18} className="text-[var(--color-on-surface)]" />
        </div>
      </div>
    </header>
  );
}
