/**
 * Formatting utilities for display and user input
 */

// Format amount as currency
export function formatCurrency(amount: string | number, currency: string = "EUR"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

// Format date
export function formatDate(date: string | Date, format: "short" | "long" = "short"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (format === "short") {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(dateObj);
  }

  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dateObj);
}

// Format datetime
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

// Format phone number for display (mask middle digits)
export function formatPhoneForDisplay(phone: string): string {
  // Format: +34 600 000 000
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < 7) return phone;

  const countryCode = cleaned.substring(0, cleaned.length - 9);
  const lastNine = cleaned.substring(cleaned.length - 9);

  return `+${countryCode} ${lastNine.substring(0, 3)} ${lastNine.substring(3, 6)} ${lastNine.substring(6)}`;
}

// Format account number for display (mask all but last 4)
export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return accountNumber;
  return "****" + accountNumber.slice(-4);
}

// Abbreviate user name
export function abbreviateUserName(name: string, surname?: string): string {
  if (!name) return "U";
  const initials = (name[0] + (surname?.[0] || "")).toUpperCase();
  return initials.substring(0, 2);
}

// Get transaction status badge
export function getTransactionStatusLabel(
  status: string
): { label: string; variant: "success" | "pending" | "error" } {
  switch (status.toUpperCase()) {
    case "COMPLETED":
      return { label: "Completado", variant: "success" };
    case "PENDING":
      return { label: "Pendiente", variant: "pending" };
    case "FAILED":
      return { label: "Fallido", variant: "error" };
    default:
      return { label: status, variant: "pending" };
  }
}

// Get transaction type label
export function getTransactionTypeLabel(type: string): string {
  switch (type.toUpperCase()) {
    case "DEPOSIT":
      return "Depósito";
    case "TRANSFER":
      return "Transferencia";
    case "WITHDRAWAL":
      return "Retiro";
    default:
      return type;
  }
}

// Relative time (e.g., "hace 2 horas")
export function getRelativeTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "hace unos segundos";
  if (diffMins < 60) return `hace ${diffMins} ${diffMins === 1 ? "minuto" : "minutos"}`;
  if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
  if (diffDays < 30) return `hace ${diffDays} ${diffDays === 1 ? "día" : "días"}`;

  return formatDate(dateObj);
}

// Parse currency input (e.g., "1.234,50" or "1,234.50")
export function parseCurrencyInput(input: string): number | null {
  // Remove spaces
  let value = input.trim();

  // Detect format: if comma is last, assume European (1.234,50), else US (1,234.50)
  const lastCommaIndex = value.lastIndexOf(",");
  const lastDotIndex = value.lastIndexOf(".");

  if (lastCommaIndex > lastDotIndex) {
    // European format (1.234,50)
    value = value.replace(/\./g, "").replace(",", ".");
  } else if (lastDotIndex > lastCommaIndex) {
    // US format (1,234.50)
    value = value.replace(/,/g, "");
  } else {
    // No separators, just replace comma with dot if present
    value = value.replace(",", ".");
  }

  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}
