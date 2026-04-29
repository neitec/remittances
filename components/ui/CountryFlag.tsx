"use client";

import * as Flags from "country-flag-icons/react/3x2";
import { ComponentType, SVGProps } from "react";

type FlagComponent = ComponentType<SVGProps<SVGSVGElement> & { title?: string }>;

interface CountryFlagProps {
  country: string;
  className?: string;
  title?: string;
}

export function CountryFlag({ country, className, title }: CountryFlagProps) {
  const code = country?.toUpperCase();
  const Flag = (Flags as unknown as Record<string, FlagComponent>)[code];
  if (!Flag) return null;
  return <Flag className={className} title={title ?? code} aria-label={title ?? code} />;
}
