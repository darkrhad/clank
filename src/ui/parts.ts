// Card parts made by an artist or AI: frame, banners, text box, symbols…
// One image per part in src/ui/parts/, named as in PARTS below (e.g.
// parts/banner-blue.png). A part that exists replaces the drawn version on
// every card; a missing part keeps the drawn version. See parts/PROMPTS.md.

const files = import.meta.glob('./parts/*.{png,webp,jpg,jpeg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

export const PART_FILES: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.replace(/^.*\/|\.\w+$/g, ''), url]),
);

// Every part the cards can use, with what it is (shown in the card studio)
export const PARTS: { name: string; what: string }[] = [
  { name: 'frame', what: 'Stone frame around the whole card (center transparent)' },
  { name: 'banner-blue', what: 'Banner of Dungeon cards' },
  { name: 'banner-red', what: 'Banner of Monsters' },
  { name: 'banner-purple', what: 'Banner of Devices' },
  { name: 'banner-gold', what: 'Banner of Reserve cards' },
  { name: 'banner-yellow', what: 'Banner of the Secret Tome' },
  { name: 'banner-grey', what: 'Banner of starting cards' },
  { name: 'tab', what: 'Black tab: Companion / Monster / Device / Gem' },
  { name: 'stone', what: 'Picture area of cards without art' },
  { name: 'parchment', what: 'Text box' },
  { name: 'strip', what: 'DANGER / ARRIVE strip' },
  { name: 'acquire', what: 'ACQUIRE bar' },
  { name: 'cost', what: 'Cost corner (bottom right)' },
  { name: 'skill', what: 'Skill diamond (number added by the game)' },
  { name: 'sword', what: 'Sword circle' },
  { name: 'boot', what: 'Boot square' },
  { name: 'gold', what: 'Gold coin (number added by the game)' },
  { name: 'points', what: 'Points hexagon (number added by the game)' },
  { name: 'heart', what: 'Heal heart' },
  { name: 'dragon', what: 'Dragon attack badge' },
  { name: 'danger', what: 'Danger shield' },
  { name: 'arrive', what: 'Arrive badge' },
  { name: 'companion', what: 'Companion icon' },
  { name: 'back', what: 'Card back' },
];

// Makes the parts available to the CSS: a variable with the image
// (--part-banner-blue: url(...)) and a class (part-banner-blue) on <html>.
// styles.css uses the image only when the class is there.
export function applyParts(root = document.documentElement) {
  for (const [name, url] of Object.entries(PART_FILES)) {
    root.style.setProperty(`--part-${name}`, `url("${url}")`);
    root.classList.add(`part-${name}`);
  }
}
