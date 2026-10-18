import { defaultDivisions, defaultDistricts, defaultUpazilas, defaultUnions, LocationItem } from '../constants/bdLocations';
import { toBengaliNumber } from './bengaliUtils';

/**
 * Utility functions for Geographic Location IDs and Slugs
 */

/**
 * Clean & slugify user-provided or auto-generated location ID
 */
export const sanitizeLocationId = (rawId: string, prefix = ''): string => {
  let clean = rawId.toLowerCase().trim();
  // Replace spaces and special characters with underscores
  clean = clean.replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_');
  // Remove leading/trailing underscores
  clean = clean.replace(/^_+|_+$/g, '');

  if (prefix) {
    const cleanPrefix = prefix.endsWith('_') ? prefix : `${prefix}_`;
    if (!clean.startsWith(cleanPrefix)) {
      clean = `${cleanPrefix}${clean}`;
    }
  }

  return clean;
};

/**
 * Generate a smart slug-based ID from English name
 * e.g., "Nangalkot" + "upz_" -> "upz_nangalkot"
 * If duplicate exists, appends "_2", "_3", etc.
 */
export const slugifyLocationId = (
  prefix: string,
  nameEn?: string,
  existingIds: string[] = []
): string => {
  const cleanPrefix = prefix.endsWith('_') ? prefix : `${prefix}_`;
  
  let baseSlug = (nameEn || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  // Fallback to timestamp if English name is empty or produces invalid characters
  if (!baseSlug) {
    baseSlug = Date.now().toString();
  }

  let candidate = `${cleanPrefix}${baseSlug}`;

  // If candidate ID already exists, resolve collision
  if (existingIds.includes(candidate)) {
    let suffix = 2;
    while (existingIds.includes(`${candidate}_${suffix}`)) {
      suffix++;
    }
    candidate = `${candidate}_${suffix}`;
  }

  return candidate;
};

/**
 * Helper to display location name according to current language (Bengali or English).
 * Strictly maps location IDs (e.g., 'dist_comilla', 'upz_nangalkot') or existing English/Bengali
 * names to the target language specified.
 */
export const getLocationDisplayName = (
  val: string | undefined | null,
  locations: { id: string; name: string; nameBn: string }[] = [],
  lang: 'en' | 'bn' = 'en'
): string => {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();

  // Combined location list prioritizing custom/learned locations, then built-in defaults
  const allLocations: { id: string; name: string; nameBn: string }[] = [
    ...(locations || []),
    ...defaultUpazilas,
    ...defaultDistricts,
    ...defaultDivisions,
    ...defaultUnions,
  ];

  // 1. Direct ID match (case-insensitive)
  let match = allLocations.find(l => l.id.toLowerCase() === lower);

  // 2. English name match (case-insensitive)
  if (!match) {
    match = allLocations.find(l => l.name && l.name.trim().toLowerCase() === lower);
  }

  // 3. Bengali name match
  if (!match) {
    match = allLocations.find(l => l.nameBn && l.nameBn.trim() === trimmed);
  }

  // 4. Handle postal code / parentheses e.g. "Aziara (3583)" or "আজিয়ারা (৩৫৮৩)"
  if (!match && trimmed.includes('(')) {
    const baseName = trimmed.replace(/\s*\([^)]*\)/g, '').trim();
    const baseLower = baseName.toLowerCase();
    const postalMatch = trimmed.match(/\(([^)]+)\)/);
    const postalCode = postalMatch ? postalMatch[1].trim() : '';

    const baseFound = allLocations.find(
      l => l.id.toLowerCase() === baseLower ||
           (l.name && l.name.trim().toLowerCase() === baseLower) ||
           (l.nameBn && l.nameBn.trim() === baseName)
    );

    if (baseFound) {
      const resolvedBase = lang === 'bn' ? (baseFound.nameBn || baseFound.name) : (baseFound.name || baseFound.nameBn);
      if (postalCode) {
        const formattedCode = lang === 'bn' 
          ? toBengaliNumber(postalCode) 
          : postalCode.replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString());
        return `${resolvedBase} (${formattedCode})`;
      }
      return resolvedBase;
    }
  }

  if (match) {
    return lang === 'bn' 
      ? (match.nameBn || match.name) 
      : (match.name || match.nameBn);
  }

  // If no match found in locations, and lang is bn, convert any western digits if present
  if (lang === 'bn') {
    return toBengaliNumber(trimmed);
  }

  return trimmed;
};

