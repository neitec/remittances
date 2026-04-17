"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: "home" },
  { href: "/send", label: "Enviar dinero", icon: "swap_horiz" },
  { href: "/transactions", label: "Historial", icon: "history" },
  { href: "/deposit", label: "Depositar", icon: "euro_symbol" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-[var(--color-surface-container-lowest)] border-r border-[var(--color-outline-variant)]/15">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--color-outline-variant)]/15">
        <h1 className="text-2xl font-bold text-[var(--color-on-surface)] font-manrope">
          Remita
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium"
                  : "text-[var(--color-on-surface-variant)]/80 hover:bg-[var(--color-surface-container-low)]"
              )}
            >
              <Icon
                name={item.icon}
                size={20}
                className={cn(
                  "transition-colors",
                  isActive
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-on-surface-variant)]"
                )}
              />
              <span className="font-inter">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-[var(--color-outline-variant)]/15">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-[var(--color-on-surface-variant)]/80 hover:bg-[var(--color-surface-container-low)] transition-colors"
        >
          <Icon name="logout" size={20} />
          <span className="font-inter">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
