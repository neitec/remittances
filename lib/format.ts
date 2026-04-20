import { format, formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Format a number as EUR currency in European format (€1.234,56)
 */
export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Mask IBAN to show only last 4 characters (•••••••••••••••••000)
 */
export function maskIBAN(iban: string): string {
  const clean = iban.replace(/\s+/g, "");
  if (clean.length <= 4) return clean;
  return "•".repeat(clean.length - 4) + clean.slice(-4);
}

/**
 * Format date to DD/MM/YYYY
 */
export function formatDate(dateString: string): string {
  try {
    return format(parseISO(dateString), "dd/MM/yyyy");
  } catch {
    return dateString;
  }
}

/**
 * Format date as relative (today, yesterday, hace X días, etc.)
 */
export function formatRelativeDate(dateString: string): string {
  try {
    return formatDistanceToNow(parseISO(dateString), {
      addSuffix: true,
      locale: es,
    });
  } catch {
    return dateString;
  }
}

