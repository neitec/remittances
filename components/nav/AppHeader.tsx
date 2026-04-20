"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { Icon } from "@/components/ui/Icon";
import { useRouter } from "next/navigation";

interface AppHeaderProps {
  onBack?: () => void;
  showBack?: boolean;
}

export function AppHeader({ onBack, showBack }: AppHeaderProps) {
  const { user } = useAuth();
  const router = useRouter();

  const userName = user?.name?.split(" ")[0] ?? "Usuario";
  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) ?? "U";

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

        {/* Bell notification — TODO: wire up when notifications API is ready */}

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
