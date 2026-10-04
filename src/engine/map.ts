// Clank! front-side board as data. Positions are pixels in public/board.png
// (907x905), read from the rulebook's setup picture and checked by eye.
//
// Room types: entrance, room, cave (Crystal Cave: entering ends Boot movement),
// market, fountain (heal 1 on entering), shrine (Monkey Shrine).
// tokens: what is placed here at setup. depths: below ground.

import type { RoomId } from './types';

export type RoomType = 'entrance' | 'room' | 'cave' | 'market' | 'fountain' | 'shrine';
export type SetupToken = 'majorSecret' | 'minorSecret' | 'idol' | { artifact: number };

export interface Room {
  x: number;
  y: number;
  type: RoomType;
  name?: string;
  tokens?: SetupToken[];
  depths?: boolean;
}

// boots: 2 = footprints. monsters: damage (each Sword blocks 1). locked: needs
// a Master Key. oneWay: only from -> to. wrap: off one edge, back on the other.
export interface Tunnel {
  from: RoomId;
  to: RoomId;
  boots?: number;
  monsters?: number;
  locked?: boolean;
  oneWay?: boolean;
  wrap?: boolean;
}

const ROOM_LABEL: Record<RoomType, string> = {
  entrance: 'outside the dungeon', room: 'a room', cave: 'a Crystal Cave', market: 'the Market',
  fountain: 'a Fountain of Healing', shrine: 'the Monkey Shrine',
};

// "a Crystal Cave in the Depths", for the log and the screens
export const roomLabel = (id: RoomId): string =>
  `${ROOM_LABEL[ROOMS[id].type]}${ROOMS[id].depths ? ' in the Depths' : ''}`;

export const ROOMS: Record<RoomId, Room> = {
  entrance: { x: 50, y: 58, type: 'entrance', name: 'Outside the dungeon' },

  // Castle (above ground)
  r1: { x: 57, y: 120, type: 'room' },
  r2: { x: 188, y: 120, type: 'room' },
  r3: { x: 318, y: 120, type: 'room', tokens: ['minorSecret'] },
  r4: { x: 440, y: 120, type: 'room', tokens: ['majorSecret'] },
  r5: { x: 578, y: 97, type: 'room', tokens: ['majorSecret'] },
  c1: { x: 80, y: 215, type: 'cave', tokens: ['majorSecret'] },
  c2: { x: 220, y: 230, type: 'cave' },
  r6: { x: 322, y: 225, type: 'room', tokens: ['majorSecret'] },
  c3: { x: 438, y: 240, type: 'cave', tokens: ['minorSecret'] },
  r11: { x: 559, y: 205, type: 'room' },
  r7: { x: 58, y: 325, type: 'fountain' },
  r8: { x: 172, y: 335, type: 'room', tokens: ['minorSecret'] },
  c4: { x: 313, y: 345, type: 'cave' },
  r9: { x: 448, y: 350, type: 'room' },
  r12: { x: 573, y: 320, type: 'room', tokens: ['minorSecret'] },

  // Depths (below ground)
  r10: { x: 82, y: 432, type: 'room', depths: true },
  c5: { x: 215, y: 442, type: 'cave', tokens: [{ artifact: 5 }], depths: true },
  c7: { x: 142, y: 512, type: 'cave', tokens: [{ artifact: 15 }], depths: true },
  m1: { x: 340, y: 470, type: 'market', tokens: ['minorSecret'], depths: true },
  m2: { x: 480, y: 470, type: 'market', tokens: ['minorSecret'], depths: true },
  m3: { x: 340, y: 567, type: 'market', depths: true },
  m4: { x: 480, y: 567, type: 'market', tokens: [{ artifact: 10 }], depths: true },
  a7: { x: 575, y: 420, type: 'room', tokens: [{ artifact: 7 }], depths: true },
  c6: { x: 690, y: 445, type: 'cave', tokens: ['minorSecret'], depths: true },
  c9: { x: 582, y: 532, type: 'cave', tokens: ['majorSecret'], depths: true },
  r18: { x: 742, y: 555, type: 'room', tokens: ['majorSecret'], depths: true },
  shrine: { x: 62, y: 620, type: 'shrine', tokens: ['idol', 'idol', 'idol'], depths: true },
  r13: { x: 207, y: 590, type: 'room', tokens: ['majorSecret'], depths: true },
  r19: { x: 657, y: 622, type: 'fountain', depths: true },
  a30: { x: 742, y: 650, type: 'room', tokens: [{ artifact: 30 }], depths: true },
  r14: { x: 195, y: 665, type: 'room', tokens: ['minorSecret'], depths: true },
  a20: { x: 320, y: 677, type: 'room', tokens: [{ artifact: 20 }], depths: true },
  c8: { x: 435, y: 690, type: 'cave', tokens: ['minorSecret'], depths: true },
  a25: { x: 557, y: 705, type: 'room', tokens: [{ artifact: 25 }], depths: true },
  c10: { x: 680, y: 732, type: 'cave', tokens: ['majorSecret'], depths: true },
  r15: { x: 95, y: 757, type: 'room', depths: true },
  r16: { x: 245, y: 762, type: 'room', tokens: ['majorSecret'], depths: true },
  r17: { x: 397, y: 765, type: 'fountain', depths: true },
};

// boots: 2 = footprints. monsters: damage (each Sword blocks 1).
// locked: needs a Master Key. oneWay: only from -> to. wrap: goes off one edge
// and comes back on the other (still 1 Boot).
export const TUNNELS: Tunnel[] = [
  // Castle
  { from: 'entrance', to: 'r1' },
  { from: 'r1', to: 'r2' },
  { from: 'r2', to: 'r3', boots: 2 },
  { from: 'r3', to: 'r4', boots: 2 },
  { from: 'r5', to: 'r4', oneWay: true },
  { from: 'c1', to: 'r2', oneWay: true, boots: 2 },
  { from: 'r2', to: 'c2' },
  { from: 'r3', to: 'r6', locked: true },
  { from: 'r3', to: 'c3' },
  { from: 'r4', to: 'c3', monsters: 1 },
  { from: 'c1', to: 'r7', monsters: 1 },
  { from: 'c2', to: 'r8', boots: 2 },
  { from: 'c2', to: 'c4', monsters: 1 },
  { from: 'r6', to: 'c4', locked: true },
  { from: 'c3', to: 'r9', monsters: 1 },
  { from: 'c4', to: 'r9' },
  { from: 'r5', to: 'r11', locked: true },
  { from: 'r11', to: 'c3', boots: 2 },
  { from: 'r11', to: 'r12' },
  { from: 'r9', to: 'r12' },

  // Castle -> Depths
  { from: 'r7', to: 'r10', boots: 2 },
  { from: 'r8', to: 'r10', monsters: 1 },
  { from: 'r8', to: 'c5' },
  { from: 'c4', to: 'c5', boots: 2 },
  { from: 'c4', to: 'm1', monsters: 2 },
  { from: 'r9', to: 'a7', locked: true },
  { from: 'r12', to: 'a7' },

  // Depths
  { from: 'a7', to: 'c6' },
  { from: 'c6', to: 'r10', wrap: true },
  { from: 'r10', to: 'c5' },
  { from: 'r10', to: 'shrine', oneWay: true, monsters: 1 },
  { from: 'r10', to: 'c7' },
  { from: 'c5', to: 'r13', boots: 2, monsters: 1 },
  { from: 'c5', to: 'm3' },
  { from: 'shrine', to: 'c7', oneWay: true },
  { from: 'r14', to: 'shrine', oneWay: true, boots: 2 },
  { from: 'shrine', to: 'r15', oneWay: true },
  { from: 'r13', to: 'm3', locked: true },
  { from: 'r14', to: 'a20', monsters: 2 },
  { from: 'm3', to: 'a20', monsters: 2 },
  { from: 'r14', to: 'm3', boots: 2 },
  { from: 'r15', to: 'r14' },
  { from: 'r15', to: 'r16', locked: true },
  { from: 'a20', to: 'r16', monsters: 1 },
  { from: 'a20', to: 'r17', boots: 2 },
  { from: 'a20', to: 'c8', locked: true },
  { from: 'c8', to: 'm4', locked: true },
  { from: 'm1', to: 'm3' },
  { from: 'm3', to: 'm4' },
  { from: 'm2', to: 'm4' },
  { from: 'a7', to: 'm2' },
  { from: 'm2', to: 'c9', monsters: 1 },
  { from: 'c6', to: 'r18', locked: true },
  { from: 'r18', to: 'a30', monsters: 1 },
  { from: 'r19', to: 'c9', oneWay: true },
  { from: 'r19', to: 'a25', boots: 2, monsters: 1 },
  { from: 'c8', to: 'a25', monsters: 2 },
  { from: 'a25', to: 'c10' },
  { from: 'r17', to: 'a25', monsters: 2 },
  { from: 'r17', to: 'c10', boots: 2, monsters: 1 },
];
