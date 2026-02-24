/**
 * Localised labels for dispute reason IDs returned by the Lookups API.
 *
 * The backend always returns English names (`name` field).
 * When the application is rendered in Arabic (RTL / lang="ar"), this map is
 * used to substitute the English string with an Arabic translation.
 *
 * If a new reason ID is added to the backend and is not yet listed here, the
 * component will fall back to the English `name` from the API response — so
 * nothing will break, it just won't have an Arabic translation until this file
 * is updated.
 *
 * ── How to add a new entry ──────────────────────────────────────────────────
 * Ask the backend team for the numeric ID, then add:
 *   [id]: { en: '<English name>', ar: '<Arabic translation>' },
 */

export interface DisputeReasonLabel {
  en: string;
  ar: string;
}

/** Map of dispute-reason ID → bilingual labels */
export const DISPUTE_REASON_LABELS: Record<number, DisputeReasonLabel> = {
  // ── Shared (may appear for both roles) ─────────────────────────────────
  1:  { en: 'Property is not as described or matches photos', ar: 'العقار لا يطابق الوصف أو الصور' },
  2:  { en: 'Cleanliness issues',                             ar: 'مشاكل في النظافة' },
  3:  { en: 'Amenities not working',                         ar: 'المرافق لا تعمل' },
  4:  { en: 'Owner unresponsive',                            ar: 'المالك لا يستجيب' },
  5:  { en: 'Damage to property or belongings',              ar: 'ضرر على العقار أو الممتلكات' },
  6:  { en: 'Safety concerns',                               ar: 'مخاوف تتعلق بالسلامة' },
  7:  { en: 'Unauthorized charges',                          ar: 'رسوم غير مصرح بها' },
  8:  { en: 'Early termination request',                     ar: 'طلب إنهاء مبكر' },

  // ── Owner-specific ──────────────────────────────────────────────────────
  10: { en: 'Tenant caused damage',                          ar: 'المستأجر تسبب في ضرر' },
  11: { en: 'Unpaid cash balance',                           ar: 'رصيد نقدي غير مسدد' },
  12: { en: 'Unauthorized guests',                           ar: 'ضيوف غير مصرح بهم' },
  13: { en: 'Violation of house rules',                      ar: 'انتهاك قواعد المنزل' },
  14: { en: 'Theft or missing items',                        ar: 'سرقة أو عناصر مفقودة' },
  15: { en: 'Tenant unresponsive',                           ar: 'المستأجر لا يستجيب' },

  // ── Catch-all ───────────────────────────────────────────────────────────
  99: { en: 'Other',                                         ar: 'أخرى' },
};

/**
 * Returns the localised label for a dispute reason.
 *
 * @param id       - The numeric ID returned by the Lookups API
 * @param fallback - The English `name` string from the API (used when no
 *                   translation is registered, or the layout is LTR/English)
 */
export function getDisputeReasonLabel(id: number, fallback: string): string {
  const isArabic =
    document.documentElement.dir === 'rtl' ||
    document.documentElement.lang === 'ar' ||
    document.documentElement.lang.startsWith('ar-');

  if (!isArabic) return fallback;

  return DISPUTE_REASON_LABELS[id]?.ar ?? fallback;
}
