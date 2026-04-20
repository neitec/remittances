"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { AppShell } from "@/components/nav/AppShell";

const isDesignMode = process.env.NEXT_PUBLIC_DESIGN_MODE === "true";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isDesignMode) return;
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isDesignMode && (isLoading || !isAuthenticated)) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
