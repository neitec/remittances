"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/transactions", label: "Historial", icon: "history" },
  { href: "/dashboard", label: "Inicio", icon: "home" },
  { href: "/profile", label: "Cuenta", icon: "person" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: "rgba(255, 255, 255, 0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-center justify-around px-4 h-16 pb-safe">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const isHome = item.href === "/dashboard";

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 min-w-[64px] relative"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.12 }}
                className={cn(
                  "flex items-center justify-center rounded-[14px] transition-all duration-200",
                  isActive
                    ? "bg-[var(--color-primary)]/10"
                    : "bg-transparent",
                  isHome ? "w-14 h-10" : "w-10 h-10"
                )}
              >
                <Icon
                  name={item.icon}
                  size={isActive ? (isHome ? 26 : 24) : 22}
                  filled={isActive}
                  className={cn(
                    "transition-all duration-200",
                    isActive
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--color-on-surface-variant)]/45"
                  )}
                />
              </motion.div>

              <span
                className={cn(
                  "text-[10px] font-inter font-semibold tracking-[0.04em] transition-colors duration-200",
                  isActive
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-on-surface-variant)]/45"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
