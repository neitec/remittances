"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

const isDesignMode = process.env.NEXT_PUBLIC_DESIGN_MODE === "true";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isDesignMode) {
      router.push("/dashboard");
      return;
    }

    if (isLoading) return;

    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  return null;
}
