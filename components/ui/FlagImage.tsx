"use client";

interface FlagImageProps {
  country: "ES" | "UK" | "US" | "DO";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const COUNTRY_NAMES = {
  ES: "España",
  UK: "Reino Unido",
  US: "Estados Unidos",
  DO: "República Dominicana",
};

const FLAG_UNICODE = {
  ES: "🇪🇸",
  UK: "🇬🇧",
  US: "🇺🇸",
  DO: "🇩🇴",
};

// Use flag Unicode with proper display
export function FlagImage({ country, size = "md", className = "" }: FlagImageProps) {
  const sizeClasses = {
    sm: "text-base",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <span
      title={COUNTRY_NAMES[country]}
      className={`inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}
      role="img"
      aria-label={`Bandera de ${COUNTRY_NAMES[country]}`}
    >
      {FLAG_UNICODE[country]}
    </span>
  );
}
