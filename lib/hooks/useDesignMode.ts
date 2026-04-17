"use client";

/**
 * Hook para detectar si estamos en modo diseño.
 * Modo diseño = Datos mockeados, sin necesidad del API
 * Activado con: NEXT_PUBLIC_DESIGN_MODE=true
 */
export function useDesignMode() {
  const isDesignMode = process.env.NEXT_PUBLIC_DESIGN_MODE === "true";
  return isDesignMode;
}
