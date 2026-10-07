// Card artwork: one image per card in src/ui/art/, named after the card id
// (e.g. art/monkeyBot.jpg). To use your own art, drop in a file with the
// same name: .jpg, .png or .webp, any size. It fills the picture area,
// cropped to fit. Cards without an image show the plain stone background.
// A language can have its own art in art/<lang>/ (e.g. art/vi/burgle.jpg);
// cards without one there use the normal art.

import type { Lang } from '../i18n/lang';

const byId = (files: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(files).map(([path, url]) => [path.replace(/^.*\/|\.\w+$/g, ''), url]));

export const ART = byId(import.meta.glob('./art/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>);

const LANG_ART: Partial<Record<Lang, Record<string, string>>> = {
  vi: byId(import.meta.glob('./art/vi/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>),
};

export const artFor = (id: string, lang: Lang): string | undefined => LANG_ART[lang]?.[id] ?? ART[id];
