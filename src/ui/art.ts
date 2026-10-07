// Card artwork: one image per card in src/ui/art/, named after the card id
// (e.g. art/monkeyBot.jpg). To use your own art, drop in a file with the
// same name: .jpg, .png or .webp, any size. It fills the picture area,
// cropped to fit. Cards without an image show the plain stone background.
// The Vietnamese art style (see artStyle.ts) uses art/vi/ (e.g. art/vi/burgle.jpg);
// cards without a picture there use the normal art.

import type { ArtStyle } from './artStyle';

const byId = (files: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(files).map(([path, url]) => [path.replace(/^.*\/|\.\w+$/g, ''), url]));

export const ART = byId(import.meta.glob('./art/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>);

export const STYLE_ART: Partial<Record<ArtStyle, Record<string, string>>> = {
  viet: byId(import.meta.glob('./art/vi/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>),
};

export const artFor = (id: string, style: ArtStyle): string | undefined => STYLE_ART[style]?.[id] ?? ART[id];
