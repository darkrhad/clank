import { describe, expect, it } from 'vitest';
import { applyMove, RuleError, skipMove } from '../engine/engine';
import { finalScores } from '../engine/scoring';
import { createGame } from '../engine/setup';
import type { GameState } from '../engine/types';
import { chooseMove, type Level } from './bot';

function seeded(seed: number) {
  let r = seed;
  return () => ((r = (r * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
}

// Bots play a whole game. Returns the final state, the winner's seat (or -1)
// and how many moves the engine refused (should be 0).
export function playBots(levels: Level[], seed: number) {
  let s: GameState = createGame(levels.map((l, i) => `${l}-${i}`), seed);
  const rnd = seeded(seed);
  let illegal = 0;
  let moves = 0;
  while (!s.over && moves < 5000) {
    moves++;
    const move = chooseMove(s, levels[s.current], rnd);
    try {
      s = applyMove(s, move);
    } catch (e) {
      if (!(e instanceof RuleError)) throw e;
      illegal++;
      s = applyMove(s, skipMove(s));
    }
  }
  const { winner } = finalScores(s);
  return { s, moves, illegal, winner: winner ? s.players.indexOf(winner.player) : -1 };
}

// Head to head over many games, swapping seats every game
function duel(a: Level, b: Level, games: number) {
  let winsA = 0, winsB = 0;
  for (let g = 0; g < games; g++) {
    const swap = g % 2 === 1;
    const { winner } = playBots(swap ? [b, a] : [a, b], 1000 + g);
    if (winner < 0) continue;
    const winnerIsA = swap ? winner === 1 : winner === 0;
    if (winnerIsA) winsA++; else winsB++;
  }
  return { winsA, winsB, rateA: winsA / Math.max(1, winsA + winsB) };
}

describe('AI players', () => {
  for (const level of ['easy', 'medium', 'hard'] as Level[]) {
    it(`${level}: plays 20 complete games without illegal moves`, () => {
      for (let seed = 1; seed <= 20; seed++) {
        const { s, illegal, moves } = playBots([level, level, level].slice(0, 2 + (seed % 2)), seed);
        expect(illegal, `seed ${seed}`).toBe(0);
        expect(s.over, `seed ${seed} stuck after ${moves} moves`).toBe(true);
      }
    });
  }

  it('Medium beats Easy most of the time', () => {
    const r = duel('medium', 'easy', 60);
    console.log('medium vs easy', r);
    expect(r.rateA).toBeGreaterThan(0.65);
  });

  it('Hard beats Medium more often than not', () => {
    const r = duel('hard', 'medium', 80);
    console.log('hard vs medium', r);
    expect(r.rateA).toBeGreaterThan(0.55);
  });
});
