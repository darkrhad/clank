import { describe, expect, it } from 'vitest';
import { cardDef } from './cards';
import { applyMove, available, cardCost, choiceProblem, currentPlayer, moveOptions, placeProblem, RuleError, skipMove, trashOptions } from './engine';
import { finalScores } from './scoring';
import { createGame, CLANK_CUBES, MAX_HEALTH } from './setup';
import type { GameState, Move } from './types';

// A bot that picks a random legal-looking move. Not smart, but it reaches
// every part of the rules, so crashes, stuck games and broken totals show up.
function botMove(s: GameState, rnd: () => number): Move {
  const me = currentPlayer(s);
  const pending = s.pending;
  if (pending) {
    if (pending.kind === 'discardToDraw' || pending.kind === 'discardToChoose') return { type: 'choose', uid: me.hand[0] ?? null };
    if (pending.kind === 'trash') return { type: 'choose', uid: trashOptions(s)[0] ?? null };
    if (pending.kind === 'option') {
      const allowed = cardDef(pending.card).choices!.map((c, i) => (choiceProblem(s, c) ? -1 : i)).filter((i) => i >= 0);
      return { type: 'chooseOption', index: allowed[Math.floor(rnd() * allowed.length)] };
    }
    if (pending.kind === 'replaceRow') {
      const slots = s.dungeonRow.map((c, i) => (c ? i : -1)).filter((i) => i >= 0);
      return { type: 'chooseOption', index: rnd() < 0.5 ? null : slots[Math.floor(rnd() * slots.length)] ?? null };
    }
    return skipMove(s);
  }
  if (me.hand.length) return { type: 'playAll' };

  const left = available(s);
  const options: Move[] = [];
  s.dungeonRow.forEach((uid, slot) => {
    if (!uid) return;
    const d = cardDef(uid);
    if (placeProblem(s, d)) return;
    if (d.banner === 'monster' && left.swords >= (d.defeatSwords ?? 0)) options.push({ type: 'fight', slot });
    else if (d.banner === 'device' && left.skill >= (d.cost ?? 0)) options.push({ type: 'useDevice', slot });
    else if (d.banner === 'dungeon' && left.skill >= cardCost(s, d)) options.push({ type: 'buy', slot });
  });
  if (left.skill >= 2) options.push({ type: 'buyReserve', pile: 'mercenary' });
  if (left.skill >= 3) options.push({ type: 'buyReserve', pile: 'explore' });
  if (left.swords >= 2) options.push({ type: 'fightGoblin' });
  if (s.turn.canTakeToken) (s.roomTokens[me.room] ?? []).forEach((_, index) => options.push({ type: 'takeToken', index }));
  if (me.gold >= 7) options.push({ type: 'buyMarket', item: 'masterKey' }, { type: 'buyMarket', item: 'crown' });
  me.tokens.forEach((t, index) => t.kind === 'kept' && options.push({ type: 'useToken', index }));
  // Prefer moving: head out with an Artifact, otherwise wander
  for (const o of moveOptions(s).filter((o) => o.allowed)) {
    const move: Move = { type: 'move', to: o.to, swords: o.minSwords };
    options.push(move, move, move);
    if (o.to === 'entrance') return move;
  }
  if (!options.length || rnd() < 0.15) return { type: 'endTurn' };
  return options[Math.floor(rnd() * options.length)];
}

function simulate(seed: number, players: number) {
  let s = createGame(['A', 'B', 'C', 'D'].slice(0, players), seed);
  let r = seed;
  const rnd = () => ((r = (r * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
  let steps = 0;
  let rejected = 0;
  while (!s.over && steps < 20000) {
    steps++;
    const move = botMove(s, rnd);
    try {
      s = applyMove(s, move);
    } catch (e) {
      if (!(e instanceof RuleError)) throw e;
      rejected++;
      s = applyMove(s, skipMove(s));
    }
    checkInvariants(s);
  }
  return { s, steps, rejected };
}

// Things that must always hold, whatever happened
function checkInvariants(s: GameState) {
  for (const p of s.players) {
    // Every Loảng xoảng! cube is somewhere: supply, Loảng xoảng! area, bag, health meter or set aside
    expect(p.supply + s.clankArea[p.id] + (s.bag[p.id] ?? 0) + p.damage).toBeLessThanOrEqual(CLANK_CUBES);
    expect(p.supply).toBeGreaterThanOrEqual(0);
    expect(p.damage).toBeLessThanOrEqual(MAX_HEALTH);
    if (p.damage >= MAX_HEALTH) expect(p.status).not.toBe('playing');
    expect(p.tokens.filter((t) => t.kind === 'artifact').length).toBeLessThanOrEqual(2);
  }
  expect(s.dungeonRow).toHaveLength(6);
}

describe('simulated games', () => {
  it('50 random games all finish without errors', () => {
    const results = [];
    for (let seed = 1; seed <= 50; seed++) {
      const { s, steps } = simulate(seed, 2 + (seed % 3));
      expect(s.over, `seed ${seed} did not finish in ${steps} steps`).toBe(true);
      expect(s.players.every((p) => p.status !== 'playing')).toBe(true);
      results.push(finalScores(s));
    }
    // Sanity: the bots sometimes win, sometimes all lose
    expect(results.some((r) => r.winner)).toBe(true);
  });
});
