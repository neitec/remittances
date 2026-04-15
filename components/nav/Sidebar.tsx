"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Send, History, MoreVertical, LogOut } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/send", label: "Enviar dinero", icon: Send },
  { href: "/transactions", label: "Historial", icon: History },
  { href: "/deposit", label: "Depositar", icon: MoreVertical },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-brand-navy border-r border-brand-sand/10">
      {/* Logo */}
      <div className="p-6 border-b border-brand-sand/10">
        <h1 className="text-2xl font-bold text-brand-white font-heading">
          Remesas
        </h1>
        <p className="text-xs text-brand-sand/70 mt-1">Digitales</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-brand-turquoise text-brand-navy font-medium"
                  : "text-brand-sand/80 hover:bg-brand-navy/50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-brand-sand/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-brand-sand/80 hover:bg-brand-navy/50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
