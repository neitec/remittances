"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/useAuth";
import { motion } from "framer-motion";
import { TopAppBar } from "@/components/nav/TopAppBar";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <TopAppBar title="Mi Cuenta" />

      <main className="pt-24 pb-20 px-6 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] flex items-center justify-center">
              <span className="text-white font-manrope font-bold text-2xl">{initials}</span>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <>
              {user.name && (
                <div className="text-center">
                  <p className="font-manrope font-bold text-2xl text-[var(--color-on-surface)]">
                    {user.name}
                  </p>
                </div>
              )}

              {user.email && (
                <div className="text-center">
                  <p className="text-sm text-[var(--color-on-surface-variant)] font-inter">
                    {user.email}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Details Cards */}
          <div className="space-y-3 mt-8">
            {user?.email && (
              <div
                className="p-5 rounded-2xl bg-[var(--color-surface-container-lowest)]"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <p className="text-xs text-[var(--color-on-surface-variant)] font-inter font-bold uppercase tracking-widest mb-2">
                  Email
                </p>
                <p className="text-[var(--color-on-surface)] font-inter break-all">{user.email}</p>
              </div>
            )}

            {user?.name && (
              <div
                className="p-5 rounded-2xl bg-[var(--color-surface-container-lowest)]"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <p className="text-xs text-[var(--color-on-surface-variant)] font-inter font-bold uppercase tracking-widest mb-2">
                  Nombre
                </p>
                <p className="text-[var(--color-on-surface)] font-inter">{user.name}</p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            className="w-full mt-8 h-14 rounded-xl bg-[var(--color-error)]/10 text-[var(--color-error)] font-bold border border-[var(--color-error)]/20 hover:bg-[var(--color-error)]/20 flex items-center justify-center gap-2"
          >
            <Icon name="logout" size={20} />
            <span className="font-inter">Cerrar Sesión</span>
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
