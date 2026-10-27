import { DECK_SLIDES } from '../data/deckText';
import { PLATFORM_TRANSLATIONS } from './translations';

export interface AuditReport {
  totalDeckSlides: number;
  translatedDeckSlidesTe: number;
  translatedDeckSlidesHi: number;
  totalRoles: number;
  verifiedRoles: string[];
  totalKeysTe: number;
  totalKeysHi: number;
  missingKeysTe: string[];
  missingKeysHi: string[];
  status: 'PASS' | 'FAIL';
}

export const KMC_ROLES = [
  'Super Admin',
  'Mayor / Commissioner',
  'Ward Corporator (Ward 27)',
  'Department Officer (Engineering)',
  'Field Staff (Ground Operations)',
  'Verified Citizen',
  'Governance Auditor'
] as const;

export const KMC_ROLE_ROUTES: Record<string, string[]> = {
  'super_admin': ['/admin', '/qa-audit', '/present', '/implementation'],
  'mayor_commissioner': ['/leadership', '/performance', '/monitoring', '/present'],
  'corporator': ['/ward', '/performance'],
  'department_officer': ['/departments', '/workflow'],
  'field_staff': ['/field-tasks'],
  'citizen': ['/citizen', '/citizen/report', '/citizen/track', '/citizen/projects'],
  'auditor': ['/monitoring', '/workflow', '/qa-audit']
};

export function runLocalizationAudit(): AuditReport {
  const teDict = PLATFORM_TRANSLATIONS.te;
  const hiDict = PLATFORM_TRANSLATIONS.hi;

  const missingKeysTe: string[] = [];
  const missingKeysHi: string[] = [];

  let translatedDeckSlidesTe = 0;
  let translatedDeckSlidesHi = 0;

  // 1. Audit all 26 Deck Slides
  for (const slide of DECK_SLIDES) {
    const hasTeTitle = Boolean(teDict[slide.title]);
    const hasHiTitle = Boolean(hiDict[slide.title]);

    if (hasTeTitle) translatedDeckSlidesTe++;
    else missingKeysTe.push(`Slide ${slide.page}: ${slide.title}`);

    if (hasHiTitle) translatedDeckSlidesHi++;
    else missingKeysHi.push(`Slide ${slide.page}: ${slide.title}`);
  }

  // 2. Audit all 7 RBAC roles
  for (const role of KMC_ROLES) {
    if (!teDict[role]) missingKeysTe.push(`Role (TE): ${role}`);
    if (!hiDict[role]) missingKeysHi.push(`Role (HI): ${role}`);
  }

  const isPassing = missingKeysTe.length === 0 && missingKeysHi.length === 0;

  return {
    totalDeckSlides: DECK_SLIDES.length,
    translatedDeckSlidesTe,
    translatedDeckSlidesHi,
    totalRoles: KMC_ROLES.length,
    verifiedRoles: [...KMC_ROLES],
    totalKeysTe: Object.keys(teDict).length,
    totalKeysHi: Object.keys(hiDict).length,
    missingKeysTe,
    missingKeysHi,
    status: isPassing ? 'PASS' : 'FAIL'
  };
}
