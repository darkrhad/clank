// Where things go on public/board.png (907x905), read from the board picture.
// Only positions: what goes there comes from the game state.

import type { PlayerColor } from '../engine/types';

// Health meters: 10 spaces each, zigzag from the heart (1) to the skull (10).
// Red and yellow on the left half, green and blue on the right.
const zigzag = (startX: number, low: number, high: number) =>
  [0, 25.5, 51, 77, 102, 128, 153, 179, 207, 229].map((dx, i) => ({ x: startX + dx, y: i % 2 ? high : low }));

export const HEALTH_SPACES: Record<PlayerColor, { x: number; y: number }[]> = {
  red: zigzag(41, 841, 820),
  yellow: zigzag(41, 886, 865),
  green: zigzag(305, 841, 820),
  blue: zigzag(305, 886, 865),
};

// Rage track: 7 spaces from the bottom left (first space with 4 players) up the right side
export const RAGE_SPACES = [
  { x: 615, y: 845 },
  { x: 695, y: 845 },
  { x: 775, y: 800 },
  { x: 830, y: 720 },
  { x: 858, y: 635 },
  { x: 858, y: 550 },
  { x: 858, y: 465 },
];

// Countdown track on the castle battlements: blank, +, ++, +++, skull
export const COUNTDOWN_SPACES = [
  { x: 180, y: 68 },
  { x: 247, y: 68 },
  { x: 318, y: 68 },
  { x: 390, y: 68 },
  { x: 460, y: 68 },
];

// Clank! area: the banner, below the logo
export const CLANK_AREA = { x: 748, y: 232, columns: 9, step: 13, cube: 11 };
