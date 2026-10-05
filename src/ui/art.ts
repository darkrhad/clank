// Card artwork: one image per card in src/ui/art/, named after the card id
// (e.g. art/monkeyBot.jpg). To use your own art, drop in a file with the
// same name: .jpg, .png or .webp, any size. It fills the picture area,
// cropped to fit. Cards without an image show the plain stone background.

const files = import.meta.glob('./art/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

export const ART: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.replace(/^.*\/|\.\w+$/g, ''), url]),
);
