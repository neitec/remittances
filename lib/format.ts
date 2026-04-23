import { format, formatDistanceToNow, parseISO, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";
import { es } from "date-fns/locale";
import { Transaction } from "@/lib/types";

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

export function getInitials(name?: string, surname?: string): string {
  if (!name || !surname) return "??";
  return `${name[0]}${surname[0]}`.toUpperCase();
}

export function getCountryEmoji(country?: string): string {
  if (!country || country.length !== 2) return "🌍";
  const codePoints = country.toUpperCase().split("").map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export interface TransactionGroup {
  label: string;
  transactions: Transaction[];
}

export function groupTransactionsByDate(transactions: Transaction[]): TransactionGroup[] {
  const groups = new Map<string, Transaction[]>();
  for (const txn of transactions) {
    const date = parseISO(txn.createdAt);
    let label: string;
    if (isToday(date))                              label = "Hoy";
    else if (isYesterday(date))                     label = "Ayer";
    else if (isThisWeek(date, { weekStartsOn: 1 })) label = "Esta semana";
    else if (isThisMonth(date))                     label = "Este mes";
    else {
      label = format(date, "MMMM yyyy", { locale: es });
      label = label.charAt(0).toUpperCase() + label.slice(1);
    }
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(txn);
  }
  return Array.from(groups.entries()).map(([label, txns]) => ({ label, transactions: txns }));
}

