import { AcademicClass, AcademicGroup, AcademicSection } from '../types';

/**
 * Normalizes and validates class names to prevent duplicate or rogue classes from being created
 * during manual entry, Excel import, or AI parsing.
 */
export function normalizeClassName(
  rawClass: string | undefined | null,
  registeredClasses: AcademicClass[],
  fallbackClass?: string
): string {
  const fallback = fallbackClass || registeredClasses.find(c => c.isDefault)?.name || registeredClasses[0]?.name || 'Class 6';
  if (!rawClass || typeof rawClass !== 'string') return fallback;

  const clean = rawClass.trim();
  if (!clean) return fallback;

  // 1. Direct exact or case-insensitive match
  const exact = registeredClasses.find(c => c.name.toLowerCase() === clean.toLowerCase());
  if (exact) return exact.name;

  // 2. Numeric / Bengali number match (e.g., "6", "৬", "Class 6", "Class-6", "৬ষ্ঠ", "Six")
  const lower = clean.toLowerCase();

  // Match English / Bengali numbers against registered classes
  for (const rc of registeredClasses) {
    const numMatch = rc.name.match(/\d+/);
    if (numMatch) {
      const digit = numMatch[0];
      if (
        lower === digit ||
        lower === `class ${digit}` ||
        lower === `class-${digit}` ||
        lower === `class${digit}` ||
        lower === `grade ${digit}` ||
        lower === `grade-${digit}` ||
        lower === `grade${digit}`
      ) {
        return rc.name;
      }
    }

    // Specific class mappings
    if (rc.name.includes('6') && (clean.includes('৬') || lower.includes('six') || clean.includes('৬ষ্ঠ'))) return rc.name;
    if (rc.name.includes('7') && (clean.includes('৭') || lower.includes('seven') || clean.includes('৭ম'))) return rc.name;
    if (rc.name.includes('8') && (clean.includes('৮') || lower.includes('eight') || clean.includes('৮ম'))) return rc.name;
    if (rc.name.includes('9') && (clean.includes('৯') || lower.includes('nine') || clean.includes('৯ম'))) return rc.name;
    if (rc.name.includes('10') && (clean.includes('১০') || lower.includes('ten') || clean.includes('১০ম') || lower.includes('ssc'))) return rc.name;
    if (rc.name.includes('11') && (clean.includes('১১') || lower.includes('eleven') || clean.includes('একাদশ') || lower.includes('hsc 1'))) return rc.name;
    if (rc.name.includes('12') && (clean.includes('১২') || lower.includes('twelve') || clean.includes('দ্বাদশ') || lower.includes('hsc 2'))) return rc.name;
    if (rc.name.toLowerCase().includes('play') && (clean.includes('প্লে') || lower.includes('play'))) return rc.name;
    if (rc.name.toLowerCase().includes('nursery') && (clean.includes('নার্সারি') || lower.includes('nursery'))) return rc.name;
    if (rc.name.toLowerCase().includes('kg') && (clean.includes('কেজি') || lower.includes('kg'))) return rc.name;
  }

  // 3. Fallback to specified registered class to prevent rogue classes
  return fallback;
}

/**
 * Normalizes Group / Department (বিভাগ) names against registered groups.
 */
export function normalizeGroupName(
  rawGroup: string | undefined | null,
  registeredGroups: AcademicGroup[],
  fallbackGroup?: string
): string {
  const fallback = fallbackGroup || registeredGroups.find(g => g.isDefault)?.name || registeredGroups[0]?.name || 'প্রযোজ্য নয়';
  if (!rawGroup || typeof rawGroup !== 'string') return fallback;

  const clean = rawGroup.trim();
  if (!clean || clean === '-' || clean.toLowerCase() === 'na' || clean.toLowerCase() === 'n/a' || clean === 'none') {
    return registeredGroups.find(g => g.name === 'প্রযোজ্য নয়')?.name || 'প্রযোজ্য নয়';
  }

  // Exact / case-insensitive match
  const exact = registeredGroups.find(g => g.name.toLowerCase() === clean.toLowerCase());
  if (exact) return exact.name;

  const lower = clean.toLowerCase();
  // Semantic matches
  if (lower.includes('science') || lower.includes('বিজ্ঞান')) {
    const sci = registeredGroups.find(g => g.name.includes('বিজ্ঞান') || g.name.toLowerCase().includes('science'));
    if (sci) return sci.name;
  }
  if (lower.includes('humanities') || lower.includes('arts') || lower.includes('মানবিক')) {
    const hum = registeredGroups.find(g => g.name.includes('মানবিক') || g.name.toLowerCase().includes('humanities'));
    if (hum) return hum.name;
  }
  if (lower.includes('business') || lower.includes('commerce') || lower.includes('বাণিজ্য') || lower.includes('ব্যবসায়') || lower.includes('ব্যবসা')) {
    const bus = registeredGroups.find(g => g.name.includes('ব্যবসায়') || g.name.includes('বাণিজ্য') || g.name.toLowerCase().includes('business') || g.name.toLowerCase().includes('commerce'));
    if (bus) return bus.name;
  }
  if (lower.includes('general') || lower.includes('সাধারণ') || lower.includes('প্রযোজ্য নয়') || lower.includes('none')) {
    const na = registeredGroups.find(g => g.name.includes('প্রযোজ্য নয়') || g.name.includes('সাধারণ'));
    if (na) return na.name;
  }

  // If user typed a custom group name, return trimmed clean string if no direct conflict
  return clean;
}

/**
 * Normalizes Section (শাখা) names against registered sections.
 */
export function normalizeSectionName(
  rawSection: string | undefined | null,
  registeredSections: AcademicSection[],
  fallbackSection?: string
): string {
  const fallback = fallbackSection || registeredSections.find(s => s.isDefault)?.name || registeredSections[0]?.name || 'প্রযোজ্য নয়';
  if (!rawSection || typeof rawSection !== 'string') return fallback;

  const clean = rawSection.trim();
  if (!clean || clean === '-' || clean.toLowerCase() === 'na' || clean.toLowerCase() === 'n/a' || clean === 'none') {
    return registeredSections.find(s => s.name === 'প্রযোজ্য নয়')?.name || 'প্রযোজ্য নয়';
  }

  // Exact / case-insensitive match
  const exact = registeredSections.find(s => s.name.toLowerCase() === clean.toLowerCase());
  if (exact) return exact.name;

  const lower = clean.toLowerCase();
  // Semantic matches (e.g. A -> ক, B -> খ, C -> গ, etc. or direct matches)
  if (lower === 'a' || lower === 'section a' || lower === 'শাখা ক' || clean === 'ক') {
    const s = registeredSections.find(sec => sec.name === 'ক' || sec.name.toLowerCase() === 'a');
    if (s) return s.name;
  }
  if (lower === 'b' || lower === 'section b' || lower === 'শাখা খ' || clean === 'খ') {
    const s = registeredSections.find(sec => sec.name === 'খ' || sec.name.toLowerCase() === 'b');
    if (s) return s.name;
  }
  if (lower === 'c' || lower === 'section c' || lower === 'শাখা গ' || clean === 'গ') {
    const s = registeredSections.find(sec => sec.name === 'গ' || sec.name.toLowerCase() === 'c');
    if (s) return s.name;
  }
  if (lower === 'd' || lower === 'section d' || lower === 'শাখা ঘ' || clean === 'ঘ') {
    const s = registeredSections.find(sec => sec.name === 'ঘ' || sec.name.toLowerCase() === 'd');
    if (s) return s.name;
  }

  return clean;
}

/**
 * Normalizes academic session / year (e.g., "2026", "2025-2026")
 */
export function normalizeSession(
  rawSession: string | undefined | null,
  fallbackSession?: string
): string {
  const fallback = fallbackSession || new Date().getFullYear().toString();
  if (!rawSession || typeof rawSession !== 'string') return fallback;

  const clean = rawSession.trim();
  if (!clean) return fallback;

  return clean;
}
