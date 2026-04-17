/**
 * Validation utilities for remittances API
 */

// IBAN validation for EUR accounts
export function isValidIBAN(iban: string): boolean {
  // Remove spaces and convert to uppercase
  const cleanIBAN = iban.replace(/\s/g, "").toUpperCase();

  // Basic IBAN format: 2 letters (country code) + 2 digits (check) + alphanumeric
  const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/;
  if (!ibanRegex.test(cleanIBAN)) {
    return false;
  }

  // EU-specific: ES (Spain) = 24 chars, other EU = varies
  if (cleanIBAN.startsWith("ES") && cleanIBAN.length !== 24) {
    return false;
  }

  // Mod-97 checksum validation
  const rearranged =
    cleanIBAN.substring(4) + cleanIBAN.substring(0, 4);
  const numericIBAN = rearranged
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      return code >= 65 && code <= 90 ? code - 55 : char;
    })
    .join("");

  const checksum = BigInt(numericIBAN) % BigInt(97);
  return checksum === BigInt(1);
}

// Alias validation: 3-30 chars, alphanumeric + dots/underscores/hyphens
export function isValidAlias(alias: string): {
  valid: boolean;
  error?: string;
} {
  if (!alias) {
    return { valid: false, error: "El alias es requerido" };
  }

  if (alias.length < 3) {
    return { valid: false, error: "El alias debe tener al menos 3 caracteres" };
  }

  if (alias.length > 30) {
    return { valid: false, error: "El alias no debe exceder 30 caracteres" };
  }

  // Pattern: ^[a-zA-Z0-9._-]+$
  if (!/^[a-zA-Z0-9._-]+$/.test(alias)) {
    return {
      valid: false,
      error: "El alias solo puede contener letras, números, puntos, guiones y guiones bajos",
    };
  }

  // Cannot start/end with . or -
  if (alias.startsWith(".") || alias.startsWith("-")) {
    return {
      valid: false,
      error: "El alias no puede empezar con punto o guión",
    };
  }

  if (alias.endsWith(".") || alias.endsWith("-")) {
    return {
      valid: false,
      error: "El alias no puede terminar con punto o guión",
    };
  }

  return { valid: true };
}

// Amount validation
export function isValidAmount(amount: string | number): {
  valid: boolean;
  error?: string;
} {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return { valid: false, error: "El monto debe ser un número válido" };
  }

  if (numAmount <= 0) {
    return { valid: false, error: "El monto debe ser mayor a 0" };
  }

  return { valid: true };
}

// Phone validation: must include country code
export function isValidPhoneWithCountryCode(phone: string): {
  valid: boolean;
  error?: string;
} {
  if (!phone) {
    return { valid: false, error: "El teléfono es requerido" };
  }

  // Must start with +
  if (!phone.startsWith("+")) {
    return {
      valid: false,
      error: "El teléfono debe incluir el código del país (+)",
    };
  }

  // Must be digits after +
  if (!/^\+\d{7,15}$/.test(phone)) {
    return {
      valid: false,
      error: "El formato de teléfono no es válido",
    };
  }

  return { valid: true };
}

// Format phone number: ensure it starts with +
export function formatPhoneNumber(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  return "+" + clean;
}

// Combined validation for transfer
export function validateTransfer(data: {
  amount: string;
  beneficiaryPhone?: string;
  userAlias?: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Validate amount
  const amountValidation = isValidAmount(data.amount);
  if (!amountValidation.valid) {
    errors.amount = amountValidation.error || "Monto inválido";
  }

  // At least one of phone or alias required
  if (!data.beneficiaryPhone && !data.userAlias) {
    errors.beneficiary = "Se requiere teléfono o alias del beneficiario";
  }

  // If phone provided, validate format
  if (data.beneficiaryPhone) {
    const phoneValidation = isValidPhoneWithCountryCode(
      data.beneficiaryPhone
    );
    if (!phoneValidation.valid) {
      errors.beneficiaryPhone = phoneValidation.error || "Teléfono inválido";
    }
  }

  // If alias provided, validate format
  if (data.userAlias) {
    const aliasValidation = isValidAlias(data.userAlias);
    if (!aliasValidation.valid) {
      errors.userAlias = aliasValidation.error || "Alias inválido";
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// Combined validation for external account
export function validateExternalAccount(data: {
  accountNumber: string;
  bankName: string;
  currency: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.accountNumber) {
    errors.accountNumber = "El número de cuenta es requerido";
  } else if (data.currency === "EUR" && !isValidIBAN(data.accountNumber)) {
    errors.accountNumber = "El IBAN no es válido";
  }

  if (!data.bankName) {
    errors.bankName = "El nombre del banco es requerido";
  } else if (data.bankName.length > 255) {
    errors.bankName = "El nombre del banco no debe exceder 255 caracteres";
  }

  if (!data.currency) {
    errors.currency = "La moneda es requerida";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
