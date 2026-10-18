/**
 * Utility functions for WhatsApp messaging integration
 */

/**
 * Formats a given mobile/phone number into a valid international WhatsApp URL.
 * Automatically adds Bangladesh country code (+880) if local mobile format is detected.
 */
export function getWhatsAppUrl(mobileNumber?: string, defaultMessage?: string): string | null {
  if (!mobileNumber) return null;
  // Strip everything except digits
  let clean = mobileNumber.replace(/\D/g, '');
  if (!clean) return null;

  // Convert local Bangladesh numbers to international standard:
  // e.g. 01712345678 -> 8801712345678
  // e.g. 1712345678 -> 8801712345678
  if (clean.startsWith('880')) {
    // already starts with 880
  } else if (clean.startsWith('0')) {
    clean = '88' + clean;
  } else if (clean.length === 10 && clean.startsWith('1')) {
    clean = '880' + clean;
  } else if (clean.length <= 8) {
    // too short for valid phone
    return null;
  }

  const base = `https://wa.me/${clean}`;
  if (defaultMessage) {
    return `${base}?text=${encodeURIComponent(defaultMessage)}`;
  }
  return base;
}
