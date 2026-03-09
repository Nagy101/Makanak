import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const emailRegex = /^[a-zA-Z0-9._%+-]{2,}@[a-zA-Z0-9.-]{2,}\.[a-zA-Z]{2,}$/i;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert a PascalCase / camelCase backend enum name to a human-readable label.
 * e.g. "PropertyNotAsDescribed" → "Property Not As Described"
 *      "DateCreatedDesc"        → "Date Created Desc"
 */
export function toLabel(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/([a-z])([0-9])/g, '$1 $2')
    .trim();
}
