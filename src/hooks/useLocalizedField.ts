import { useTranslation } from "react-i18next";
import { useCallback } from "react";

/**
 * Returns a function that picks the correct localized field
 * from backend objects containing nameEn / nameAr pairs.
 *
 * Usage:
 *   const localized = useLocalizedField();
 *   localized(amenity.nameEn, amenity.nameAr)   // → "واي فاي" when ar
 *   localized(gov.nameEn, gov.nameAr)            // → "Cairo"   when en
 *
 * RULE 4 — This NEVER affects what gets sent to the API.
 * API calls always use nameEn / IDs.
 */
export function useLocalizedField() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  return useCallback(
    (nameEn?: string | null, nameAr?: string | null): string => {
      if (isAr && nameAr) return nameAr;
      return nameEn || nameAr || "";
    },
    [isAr],
  );
}
