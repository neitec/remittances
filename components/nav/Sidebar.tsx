"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/deposit", label: "Deposita", icon: "south_west" },
  { href: "/send", label: "Transfiere", icon: "north_east" },
  { href: "/transactions", label: "Tu Historial", icon: "history" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-52 z-50"
      style={{
        background: "var(--color-surface-container-lowest)",
        borderRight: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      {/* Subtle top depth wash */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,62,199,0.035) 0%, transparent 100%)",
        }}
      />

      {/* Logo */}
      <div className="relative px-3 py-5">
        <Link href="/dashboard">
        <h1
          className="font-manrope font-extrabold text-[28px] leading-none select-none"
          style={{
            letterSpacing: "-0.025em",
            background:
              "linear-gradient(100deg, #003ec7 15%, #003ec7 28%, #6ba4ff 43%, #ffd4a8 50%, #6ba4ff 57%, #003ec7 72%, #003ec7 85%)",
            backgroundSize: "300% 100%",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            animation: "wordmark-shimmer 8s ease-in-out infinite",
          }}
        >
          Remita
        </h1>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-1 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-[11px] rounded-[12px] transition-all duration-150",
                isActive
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-on-surface-variant)]/65 hover:text-[var(--color-on-surface)] hover:bg-[rgba(0,62,199,0.07)]"
              )}
              style={
                isActive
                  ? {
                      background: "rgba(0,62,199,0.07)",
                    }
                  : {}
              }
            >
              {/* Left active accent */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
                  style={{ background: "var(--color-primary)" }}
                />
              )}

              <Icon
                name={item.icon}
                size={20}
                filled={isActive}
                className="transition-colors flex-shrink-0"
              />
              <span className="font-inter font-medium text-[14px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer: cuenta + system status + logout */}
      <div
        className="p-3 space-y-0.5"
        style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}
      >
        {/* Cuenta */}
        <Link
          href="/profile"
          className={cn(
            "relative flex items-center gap-3 px-3 py-[11px] rounded-[12px] transition-all duration-150",
            pathname === "/profile"
              ? "text-[var(--color-primary)]"
              : "text-[var(--color-on-surface-variant)]/65 hover:text-[var(--color-on-surface)] hover:bg-[rgba(0,62,199,0.07)]"
          )}
          style={pathname === "/profile" ? { background: "rgba(0,62,199,0.07)" } : {}}
        >
          {pathname === "/profile" && (
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
              style={{ background: "var(--color-primary)" }}
            />
          )}
          <Icon
            name="person"
            size={20}
            filled={pathname === "/profile"}
            className="flex-shrink-0"
          />
          <span className="font-inter font-medium text-[14px]">Cuenta</span>
        </Link>

        {/* Logout */}
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 w-full px-3 py-[11px] rounded-[12px] text-[var(--color-on-surface-variant)]/55 hover:bg-[rgba(0,62,199,0.07)] hover:text-[var(--color-on-surface)] transition-all duration-150"
        >
          <Icon name="logout" size={20} className="flex-shrink-0" />
          <span className="font-inter font-medium text-[14px]">
            Cerrar sesión
          </span>
        </button>
      </div>
    </aside>
  );
}
