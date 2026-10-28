import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import en from './en.json';
import te from './te.json';
import hi from './hi.json';
import { PLATFORM_TRANSLATIONS } from './translations';

export type Lang = 'en' | 'te' | 'hi';
export type FontScale = 'sm' | 'md' | 'lg';

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'hi', label: 'हिन्दी' },
];

const DICTS: Record<Lang, unknown> = { en, te, hi };
const PREF_KEY = 'kmc-ui:prefs';

const LOWER_MAPS: Record<Lang, Record<string, string>> = {
  en: {},
  te: Object.entries(PLATFORM_TRANSLATIONS.te || {}).reduce<Record<string, string>>((acc, [k, v]) => {
    acc[k.toLowerCase()] = v;
    return acc;
  }, {}),
  hi: Object.entries(PLATFORM_TRANSLATIONS.hi || {}).reduce<Record<string, string>>((acc, [k, v]) => {
    acc[k.toLowerCase()] = v;
    return acc;
  }, {}),
};

interface PrefsContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;
  /** Translates a dotted key (e.g. "report.q1"); `{name}` placeholders are filled from vars. */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Same lookup for list values such as star labels. */
  tList: (key: string) => string[];
  /** English-only lookup, for staff screens that share citizen components but keep deck labels. */
  tEn: (key: string, vars?: Record<string, string | number>) => string;
}

const PrefsContext = createContext<PrefsContextType | undefined>(undefined);

const lookup = (dict: unknown, key: string): unknown =>
  key.split('.').reduce<unknown>((node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined), dict);

const fill = (value: unknown, key: string, vars?: Record<string, string | number>) => {
  let text = typeof value === 'string' ? value : key;
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      text = text.split(`{{${k}}}`).join(String(v));
      text = text.split(`{${k}}`).join(String(v));
    });
  }
  return text;
};

const tEn = (key: string, vars?: Record<string, string | number>) => fill(lookup(DICTS.en, key), key, vars);

const readPrefs = (): { lang: Lang; fontScale: FontScale } => {
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { lang: parsed.lang in DICTS ? parsed.lang : 'en', fontScale: ['sm', 'md', 'lg'].includes(parsed.fontScale) ? parsed.fontScale : 'md' };
    }
  } catch {
    // private mode or blocked storage: use defaults
  }
  return { lang: 'en', fontScale: 'md' };
};

export const PrefsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefs] = useState(readPrefs);

  useEffect(() => {
    try {
      window.localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
    document.documentElement.lang = prefs.lang;
    document.documentElement.dataset.font = prefs.fontScale;
  }, [prefs]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      if (!key) return '';
      if (typeof key !== 'string') return String(key);

      if (prefs.lang === 'en') {
        const fromDict = lookup(DICTS.en, key);
        return fill(typeof fromDict === 'string' ? fromDict : key, key, vars);
      }

      const platformDict = PLATFORM_TRANSLATIONS[prefs.lang] || {};
      const lowerMap = LOWER_MAPS[prefs.lang] || {};

      // 1. Direct platform translation check
      if (platformDict[key]) {
        return fill(platformDict[key], key, vars);
      }

      // 2. Dotted dictionary lookup
      const dictVal = lookup(DICTS[prefs.lang], key);
      if (typeof dictVal === 'string') {
        return fill(dictVal, key, vars);
      }

      // 3. Trimmed match
      const trimmed = key.trim();
      if (platformDict[trimmed]) {
        return fill(platformDict[trimmed], key, vars);
      }

      // 4. Case-insensitive match
      const lower = trimmed.toLowerCase();
      if (lowerMap[lower]) {
        return fill(lowerMap[lower], key, vars);
      }

      // 5. Compound: Colon split (e.g. "Drainage: Drain Overflow near main intersection" or "Live Update: 10:30 AM")
      if (trimmed.includes(': ')) {
        const colonIdx = trimmed.indexOf(': ');
        const prefix = trimmed.slice(0, colonIdx);
        const suffix = trimmed.slice(colonIdx + 2);
        const transPrefix = platformDict[prefix] || lowerMap[prefix.toLowerCase()];
        const transSuffix = platformDict[suffix] || lowerMap[suffix.toLowerCase()] || suffix;
        if (transPrefix) {
          return `${transPrefix}: ${transSuffix}`;
        }
      }

      // 6. Compound: Dash/Hyphen split (e.g. "Ward Management Dashboard – Green Park Colony" or "Ward 27 – Green Park Colony")
      if (trimmed.includes(' – ') || trimmed.includes(' - ')) {
        const sep = trimmed.includes(' – ') ? ' – ' : ' - ';
        const parts = trimmed.split(sep);
        if (parts.length === 2) {
          const p0 = platformDict[parts[0]] || lowerMap[parts[0].toLowerCase()] || (
            /^Ward (\d+)$/i.test(parts[0]) ? (prefs.lang === 'te' ? `వార్డు ${parts[0].replace(/Ward /i, '')}` : `वार्ड ${parts[0].replace(/Ward /i, '')}`) : parts[0]
          );
          const p1 = platformDict[parts[1]] || lowerMap[parts[1].toLowerCase()] || parts[1];
          return `${p0} – ${p1}`;
        }
      }

      // 7. Compound: Dot / Bullet separator " · " or " • " (e.g. "Ward 27 • Green Park Colony" or "GRV-2024-27-0045 · Ward 27 · Ramakrishna Nagar")
      if (trimmed.includes(' · ') || trimmed.includes(' • ')) {
        const sep = trimmed.includes(' · ') ? ' · ' : ' • ';
        const parts = trimmed.split(sep);
        const translatedParts = parts.map((part) => {
          const p = part.trim();
          if (platformDict[p]) return platformDict[p];
          if (lowerMap[p.toLowerCase()]) return lowerMap[p.toLowerCase()];
          const wardMatch = p.match(/^Ward (\d+)$/i);
          if (wardMatch) return prefs.lang === 'te' ? `వార్డు ${wardMatch[1]}` : `वार्ड ${wardMatch[1]}`;
          return p;
        });
        return translatedParts.join(sep);
      }

      // 8. Parenthesis role match (e.g. "Mahesh (Field Staff)" or "Suresh (Electrician)")
      const parenMatch = trimmed.match(/^(.+?)\s*\((.+?)\)$/);
      if (parenMatch) {
        const namePart = parenMatch[1].trim();
        const rolePart = parenMatch[2].trim();
        const transName = platformDict[namePart] || lowerMap[namePart.toLowerCase()] || namePart;
        const transRole = platformDict[rolePart] || lowerMap[rolePart.toLowerCase()] || (lookup(DICTS[prefs.lang], rolePart) as string) || rolePart;
        if (transRole !== rolePart || transName !== namePart) {
          return `${transName} (${transRole})`;
        }
      }

      // 9. Dynamic regex matchers
      const wardOnly = trimmed.match(/^Ward (\d+)$/i);
      if (wardOnly) {
        return prefs.lang === 'te' ? `వార్డు ${wardOnly[1]}` : `वार्ड ${wardOnly[1]}`;
      }
      const wPrefix = trimmed.match(/^W(\d+)$/i);
      if (wPrefix) {
        return prefs.lang === 'te' ? `వార్డు ${wPrefix[1]}` : `वार्ड ${wPrefix[1]}`;
      }

      const showMoreMatch = trimmed.match(/^Show more(?: \((.+)\))?$/i);
      if (showMoreMatch) {
        const count = showMoreMatch[1];
        if (prefs.lang === 'te') return count ? `మరిన్ని చూపించు (${count})` : 'మరిన్ని చూపించు';
        return count ? `और दिखाएं (${count})` : 'और दिखाएं';
      }

      // Audited by X matcher
      const auditedByMatch = trimmed.match(/^Audited by (.+)$/i);
      if (auditedByMatch) {
        const reviewer = auditedByMatch[1].trim();
        const transReviewer = platformDict[reviewer] || lowerMap[reviewer.toLowerCase()] || reviewer;
        return prefs.lang === 'te' ? `${transReviewer} చే తనిఖీ చేయబడింది` : `${transReviewer} द्वारा जाँचा गया`;
      }

      // Solved by X matcher
      const solvedByMatch = trimmed.match(/^Solved by:?\s*(.+)$/i);
      if (solvedByMatch) {
        const solved = solvedByMatch[1].trim();
        const transSolved = platformDict[solved] || lowerMap[solved.toLowerCase()] || solved;
        return prefs.lang === 'te' ? `పరిష్కరించిన వారు: ${transSolved}` : `हलकर्ता: ${transSolved}`;
      }

      // Fallback to English dictionary or key itself
      const fallback = lookup(DICTS.en, key);
      return fill(typeof fallback === 'string' ? fallback : key, key, vars);
    },
    [prefs.lang]
  );

  const tList = useCallback(
    (key: string) => {
      const value = lookup(DICTS[prefs.lang], key) ?? lookup(DICTS.en, key);
      return Array.isArray(value) ? (value as string[]) : [];
    },
    [prefs.lang]
  );

  return (
    <PrefsContext.Provider
      value={{
        lang: prefs.lang,
        setLang: (lang) => setPrefs((p) => ({ ...p, lang })),
        fontScale: prefs.fontScale,
        setFontScale: (fontScale) => setPrefs((p) => ({ ...p, fontScale })),
        t,
        tList,
        tEn,
      }}
    >
      {children}
    </PrefsContext.Provider>
  );
};

export const usePrefs = () => {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePrefs must be used within PrefsProvider');
  return ctx;
};
