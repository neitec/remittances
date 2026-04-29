export type PhoneCountry = "ES" | "DO";

export interface PhoneCountryConfig {
  code: PhoneCountry;
  dialPrefix: string;
  label: string;
  maxDigits: number;
  groupSizes: number[];
  placeholder: string;
}

export const PHONE_COUNTRIES: Record<PhoneCountry, PhoneCountryConfig> = {
  ES: {
    code: "ES",
    dialPrefix: "+34",
    label: "España",
    maxDigits: 9,
    groupSizes: [3, 3, 3],
    placeholder: "612 345 678",
  },
  DO: {
    code: "DO",
    dialPrefix: "+1-829",
    label: "República Dominicana",
    maxDigits: 7,
    groupSizes: [3, 4],
    placeholder: "555 1234",
  },
};

export const PHONE_COUNTRY_LIST: PhoneCountryConfig[] = Object.values(PHONE_COUNTRIES);

export function sanitizePhoneInput(value: string, country: PhoneCountry): string {
  return value.replace(/\D/g, "").slice(0, PHONE_COUNTRIES[country].maxDigits);
}

export function formatPhoneDisplay(digits: string, country: PhoneCountry): string {
  const cfg = PHONE_COUNTRIES[country];
  const parts: string[] = [];
  let cursor = 0;
  for (const groupSize of cfg.groupSizes) {
    if (cursor >= digits.length) break;
    parts.push(digits.slice(cursor, cursor + groupSize));
    cursor += groupSize;
  }
  return parts.join(" ");
}

export function isPhoneComplete(digits: string, country: PhoneCountry): boolean {
  return digits.length === PHONE_COUNTRIES[country].maxDigits;
}

export function getFullPhoneNumber(digits: string, country: PhoneCountry): string {
  return PHONE_COUNTRIES[country].dialPrefix + digits;
}

export function parseFullPhone(
  fullPhone: string
): { country: PhoneCountry; digits: string } | null {
  if (!fullPhone) return null;
  for (const cfg of PHONE_COUNTRY_LIST) {
    if (fullPhone.startsWith(cfg.dialPrefix)) {
      const digits = fullPhone.slice(cfg.dialPrefix.length).replace(/\D/g, "");
      return { country: cfg.code, digits };
    }
  }
  return null;
}

export function findCountryByDialPrefix(prefix: string): PhoneCountry | null {
  const match = PHONE_COUNTRY_LIST.find((cfg) => cfg.dialPrefix === prefix);
  return match?.code ?? null;
}
