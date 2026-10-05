// Where everything sits on a full-card image (AI-made card with empty slots).
// All values are percentages of the card's width (x, w) and height (y, h).
// The layout template image is drawn from these numbers, and the game uses
// them to write names, numbers and text onto the image.

export interface Box { x: number; y: number; w: number; h: number }

export const CARD_SIZE = { width: 750, height: 1050 }; // 5:7, like a real card

export const LAYOUT = {
  banner: { x: 4, y: 2, w: 92, h: 10 }, // ribbon; the name goes in the middle
  name: { x: 15, y: 3, w: 70, h: 8 },
  points: { x: 83, y: 3, w: 12, h: 8 }, // green hexagon at the right end of the banner
  tab: { x: 34, y: 12, w: 32, h: 4 }, // Companion / Monster / Device / Gem
  picture: { x: 5, y: 16, w: 90, h: 44 },
  slot: { x: 6, y: 18, w: 11, h: 7.8, step: 8.5 }, // left column of symbols, top to bottom (max 4)
  dragon: { x: 77, y: 47, w: 16, h: 11.4 },
  danger: { x: 6, y: 50, w: 10, h: 8 }, // bottom-left of the picture
  arrive: { x: 83, y: 50, w: 9, h: 7 }, // bottom-right of the picture (cards with Arrive have no dragon)
  strip: { x: 5, y: 60, w: 90, h: 6 }, // DANGER / ARRIVE strip
  text: { x: 8, y: 62, w: 84, h: 28 }, // parchment text box
  acquire: { x: 4, y: 90, w: 92, h: 6 }, // ACQUIRE bar
  cost: { x: 80, y: 86, w: 20, h: 14 }, // blue triangle; the number goes at its lower right
  swords: { x: 60, y: 90, w: 35, h: 7 }, // monsters: Sword circles, right-aligned
};
