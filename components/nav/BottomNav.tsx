"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/transactions", label: "HISTORIAL", icon: "history" },
  { href: "/dashboard", label: "HOME", icon: "home" },
  { href: "/profile", label: "CUENTA", icon: "person" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden rounded-t-[2.5rem] bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.03)]"
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-around h-20 px-6 pb-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all",
                isActive
                  ? "w-24 h-16 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-[1.5rem] flex items-center justify-center"
                  : "text-slate-400"
              )}
            >
              <motion.div whileTap={{ scale: 0.95 }} className="flex items-center justify-center">
                <Icon
                  name={item.icon}
                  size={isActive ? 30 : 24}
                  filled={isActive}
                  className={cn(
                    "transition-all",
                    isActive
                      ? "text-[var(--color-primary)]"
                      : "text-slate-400"
                  )}
                />
              </motion.div>
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest transition-colors font-manrope",
                  isActive
                    ? "text-[var(--color-primary)]"
                    : "text-slate-400"
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
