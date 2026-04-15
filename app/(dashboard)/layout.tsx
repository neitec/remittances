"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { AppShell } from "@/components/nav/AppShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    // Skip redirect while Auth0 is loading
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show nothing while redirecting
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
