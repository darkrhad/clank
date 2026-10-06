// Route planning for the AI: how far is every room from a goal?
// Multi-turn planning, so Crystal Caves only add a penalty (they end a turn's
// movement) instead of blocking the way.

import { cardDef } from '../engine/cards';
import { ROOMS, TUNNELS } from '../engine/map';
import { CLANK_CUBES, RAGE_TRACK } from '../engine/setup';
import type { GameState, Player, RoomId } from '../engine/types';

export interface PathOptions {
  hasKey: boolean;
  hasArtifact: boolean; // the entrance can only be entered with one
  damageWeight: number; // how many Boots one point of monster damage is "worth"
  cavePenalty: number;
}

// Cost of going through a tunnel into `to`
const stepCost = (boots: number, monsters: number, to: RoomId, o: PathOptions) =>
  boots + monsters * o.damageWeight + (ROOMS[to].type === 'cave' ? o.cavePenalty : 0);

// Distance from every room to `goal` (Dijkstra over the reversed tunnels)
export function distancesTo(goal: RoomId, o: PathOptions): Record<RoomId, number> {
  // Edges that can be walked: from -> to (and back unless one-way)
  const edges: { from: RoomId; to: RoomId; boots: number; monsters: number }[] = [];
  for (const t of TUNNELS) {
    if (t.locked && !o.hasKey) continue;
    const e = { boots: t.boots ?? 1, monsters: t.monsters ?? 0 };
    edges.push({ from: t.from, to: t.to, ...e });
    if (!t.oneWay) edges.push({ from: t.to, to: t.from, ...e });
  }
  const usable = edges.filter((e) => e.to !== 'entrance' || o.hasArtifact);

  const dist: Record<RoomId, number> = { [goal]: 0 };
  const queue: RoomId[] = [goal];
  while (queue.length) {
    queue.sort((a, b) => dist[a] - dist[b]);
    const room = queue.shift()!;
    // Walk backwards: which rooms lead into `room`?
    for (const e of usable) {
      if (e.to !== room) continue;
      const d = dist[room] + stepCost(e.boots, e.monsters, e.to, o);
      if (d < (dist[e.from] ?? Infinity)) {
        dist[e.from] = d;
        if (!queue.includes(e.from)) queue.push(e.from);
      }
    }
  }
  return dist;
}

export const tunnelCost = stepCost;

// Average Boots per turn the player's whole deck produces (5 cards per hand)
export function bootsPerTurn(p: Player): number {
  const cards = [...p.deck, ...p.hand, ...p.discard, ...p.playArea];
  const boots = cards.reduce((sum, c) => sum + (cardDef(c).boots ?? 0), 0);
  return Math.max(1, (boots / Math.max(1, cards.length)) * 5);
}

// Expected damage to `p` per own turn from dragon attacks (rough model):
// share of the player's cubes in the bag x cubes drawn x attacks per turn
export function dragonRiskPerTurn(s: GameState, p: Player): number {
  const mine = (s.bag[p.id] ?? 0) + s.clankArea[p.id];
  const total = Object.values(s.bag).reduce((a, b) => a + b, 0) + Object.values(s.clankArea).reduce((a, b) => a + b, 0);
  if (!total) return 0;
  const attacksPerTurn = 0.2 * s.players.filter((x) => x.status === 'playing').length;
  return (mine / total) * RAGE_TRACK[s.rage] * attacksPerTurn;
}

// Cubes the player still has to make Loảng xoảng! with (or to take tunnel damage)
export const cubesLeft = (p: Player) => Math.min(p.supply, CLANK_CUBES);
