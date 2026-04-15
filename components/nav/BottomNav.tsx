"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Send,
  History,
  MoreVertical,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/send", label: "Enviar", icon: Send, isMain: true },
  { href: "/transactions", label: "Historial", icon: History },
  { href: "/profile", label: "Perfil", icon: MoreVertical },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-brand-navy border-t border-brand-sand/20 lg:hidden"
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-around h-20 px-4 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          if (item.isMain) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -mt-8 flex flex-col items-center gap-1"
              >
                <motion.div
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-brand-turquoise shadow-lg"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Icon className="w-6 h-6 text-brand-white" />
                </motion.div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 flex-1 py-3"
            >
              <motion.div
                className="flex flex-col items-center gap-1"
                whileTap={{ scale: 0.9 }}
              >
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? "text-brand-turquoise" : "text-brand-white/60"
                  }`}
                />
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive
                      ? "text-brand-turquoise"
                      : "text-brand-white/60"
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="indicator"
                    className="w-1.5 h-1.5 rounded-full bg-brand-turquoise"
                    transition={{ type: "spring", bounce: 0.2 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
