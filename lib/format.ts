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
 * Format IBAN with spaces every 4 characters (DE89 3704 0044 0532 0130 00)
 */
export function formatIBAN(iban: string): string {
  return iban.replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();
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

/**
 * Format phone number to E.164 format for API
 */
export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  // If no country code (doesn't start with +), assume ES (+34)
  if (!phone.startsWith("+") && !cleaned.startsWith("34")) {
    return `+34${cleaned.slice(-9)}`;
  }
  if (!phone.startsWith("+")) {
    return `+${cleaned}`;
  }
  return phone;
}
