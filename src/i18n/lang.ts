// The current language. No React here, so the rules engine and the tests can
// use the message catalogs too. The UI listens with useLang() (ui/useLang.ts).

export type Lang = 'en' | 'vi';
export const LANGS: Lang[] = ['en', 'vi'];

const KEY = 'lang';

function initial(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'en' || saved === 'vi') return saved;
  } catch { /* no storage: fall through */ }
  // First visit: Vietnamese if the browser is set to Vietnamese
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('vi') ? 'vi' : 'en';
}

let current: Lang = typeof window === 'undefined' ? 'en' : initial();
const listeners = new Set<() => void>();

export const getLang = (): Lang => current;

export function setLang(lang: Lang) {
  current = lang;
  try { localStorage.setItem(KEY, lang); } catch { /* ignore */ }
  if (typeof document !== 'undefined') document.documentElement.lang = lang;
  listeners.forEach((f) => f());
}

export function subscribeLang(f: () => void) {
  listeners.add(f);
  return () => { listeners.delete(f); };
}
