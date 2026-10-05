// AI players. chooseMove(state, level) looks at the game and returns ONE move;
// the caller applies it and asks again until the bot ends its turn. The bot
// only uses what the engine offers (available, moveOptions, ...), so it plays
// by exactly the same rules as a person.
//
// Levels:
//   easy   — knows the goal, plays sloppily: random buys, wrong turns,
//            ignores Clank! and takes tunnel damage instead of using Swords
//   medium — plans routes, picks the Artifact by value against distance,
//            buys useful cards, blocks monsters, heals, buys Crowns / a Key
//   hard   — medium plus a risk model: chooses the Artifact by expected score
//            (value + 20 x chance to escape − time), values points late in
//            the game and leaves the dungeon early to start the countdown

import { cardDef, CARDS, type CardDef, type Choice, type Effect } from '../engine/cards';
import {
  available, cardCost, choiceProblem, currentPlayer, hasArtifact, hasToken, isExhausted, moveOptions, placeProblem, trashOptions,
  type MoveOption,
} from '../engine/engine';
import { ROOMS } from '../engine/map';
import { SECRETS } from '../engine/secrets';
import { MARKET_PRICE, MAX_HEALTH } from '../engine/setup';
import type { GameState, Move, Player, RoomId } from '../engine/types';
import { bootsPerTurn, distancesTo, dragonRiskPerTurn, tunnelCost, type PathOptions } from './planning';

export type Level = 'easy' | 'medium' | 'hard';
export const LEVELS: Level[] = ['easy', 'medium', 'hard'];
export const LEVEL_NAME: Record<Level, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

type Random = () => number;

export function chooseMove(s: GameState, level: Level, rnd: Random = Math.random): Move {
  const me = currentPlayer(s);
  if (s.pending) return choosePending(s, level);
  if (me.hand.length) return { type: 'playAll' };

  return (
    pickToken(s, level) ??
    pickPotion(s, level) ??
    pickMarket(s, level) ??
    pickStep(s, level, rnd) ??
    pickPurchase(s, level, rnd) ??
    { type: 'endTurn' }
  );
}

// ---------- Planning helpers ----------

const pathOptions = (p: Player, level: Level, withArtifact = hasArtifact(p)): PathOptions => ({
  hasKey: hasToken(p, 'masterKey'),
  hasArtifact: withArtifact,
  // Easy doesn't care about damage; Hard cares more the more hurt it is
  damageWeight: level === 'easy' ? 0.2 : level === 'medium' ? 1.5 : 1 + p.damage / 3,
  cavePenalty: level === 'easy' ? 0 : 1.5,
});

const artifactRooms = (s: GameState) =>
  Object.entries(s.roomTokens)
    .filter(([, tokens]) => tokens.some((t) => t.kind === 'artifact'))
    .map(([room, tokens]) => ({ room, value: Math.max(...tokens.map((t) => (t.kind === 'artifact' ? t.value : 0))) }));

interface Target {
  room: RoomId;
  value: number;
}

// Where the bot wants to go next
function chooseTarget(s: GameState, level: Level): Target | null {
  const me = currentPlayer(s);
  const o = pathOptions(me, level);

  if (hasArtifact(me)) return { room: 'entrance', value: 0 };

  // Badly hurt: detour to a fountain if one is close (not the one we're in)
  if (level !== 'easy' && me.damage >= MAX_HEALTH - 4 && ROOMS[me.room].type !== 'fountain') {
    const fountains = Object.entries(ROOMS).filter(([, r]) => r.type === 'fountain').map(([id]) => id);
    const near = fountains
      .map((room) => ({ room, d: distancesTo(room, o)[me.room] ?? Infinity }))
      .sort((a, b) => a.d - b.d)[0];
    if (near && near.d <= 3) return { room: near.room, value: 0 };
  }

  const options = artifactRooms(s)
    .map((a) => ({ ...a, d: distancesTo(a.room, o)[me.room] ?? Infinity }))
    .filter((a) => a.d < Infinity);
  if (!options.length) return null;

  if (level === 'easy') return options.sort((a, b) => a.d - b.d)[0];
  if (level === 'medium') return options.sort((a, b) => (b.value - 2.5 * b.d) - (a.value - 2.5 * a.d))[0];

  // Hard: expected score of going for each Artifact and getting out again
  const back = distancesTo('entrance', pathOptions(me, level, true));
  const speed = bootsPerTurn(me);
  const risk = dragonRiskPerTurn(s, me);
  const score = (a: { room: RoomId; value: number; d: number }) => {
    const turns = (a.d + (back[a.room] ?? 99)) / speed;
    const expectedDamage = me.damage + turns * risk;
    const escape = Math.max(0, Math.min(1, 1 - expectedDamage / MAX_HEALTH));
    const hurry = s.countdown ? 6 : 1.5; // once the countdown runs, time matters a lot
    return a.value * (0.5 + escape / 2) + 20 * escape - hurry * turns;
  };
  return options.sort((a, b) => score(b) - score(a))[0];
}

// ---------- Moves ----------

function choosePending(s: GameState, level: Level): Move {
  const me = currentPlayer(s);
  const pending = s.pending!;
  const isBad = (c: string) => c.startsWith('stumble') || c.startsWith('burgle');
  const worst = (cards: string[]) =>
    cards.find((c) => c.startsWith('stumble')) ?? cards.find((c) => c.startsWith('burgle')) ?? cards[0] ?? null;
  switch (pending.kind) {
    case 'discardToDraw': {
      // Discarding a Stumble to draw two is always good; Easy never bothers
      if (level === 'easy') return { type: 'choose', uid: null };
      const stumble = me.hand.find((c) => c.startsWith('stumble'));
      return { type: 'choose', uid: stumble ?? (level === 'hard' ? worst(me.hand) : null) };
    }
    case 'discardToChoose':
      return { type: 'choose', uid: worst(me.hand) };
    case 'trash': {
      const options = trashOptions(s);
      // Magic Spring must trash something; otherwise only get rid of starting cards
      if (pending.reason === 'spring') return { type: 'choose', uid: worst(options) };
      return { type: 'choose', uid: level === 'easy' ? null : worst(options.filter(isBad)) };
    }
    case 'option': {
      const choices = cardDef(pending.card).choices!;
      const allowed = choices.map((c, index) => ({ c, index })).filter(({ c }) => !choiceProblem(s, c));
      if (level === 'easy') return { type: 'chooseOption', index: allowed[0].index };
      const best = allowed.sort((a, b) => choiceValue(s, b.c) - choiceValue(s, a.c))[0];
      return { type: 'chooseOption', index: best.index };
    }
    case 'replaceRow':
      return { type: 'chooseOption', index: null };
    case 'adjacentSecret':
      return { type: 'chooseOption', index: 0 };
  }
}

// How good one option of a "this -OR- that" card is right now
function choiceValue(s: GameState, c: Choice): number {
  const me = currentPlayer(s);
  const hasJunk = [...me.playArea, ...me.discard].some((x) => x.startsWith('stumble') || x.startsWith('burgle'));
  return effectValue(c, me) +
    (c.trash ? (hasJunk ? 3 : 0) : 0) +
    (c.buyTomes ? c.buyTomes * 6 : 0) +
    (c.adjacentSecret ? 2 : 0) +
    (c.attack ? -5 : 0);
}

// A rough value of an effect you get once (not a card in your deck)
function effectValue(e: Effect, me: Player): number {
  return (e.gold ?? 0) * 0.9 +
    (e.skill ?? 0) +
    (e.swords ?? 0) * 0.6 +
    (e.boots ?? 0) +
    (e.draw ?? 0) * 2 +
    (e.teleport ?? 0) +
    (e.heal ? (me.damage ? 2.5 : 0) : 0) -
    (e.clank ?? 0) * 1.2 +
    (e.othersClank ?? 0) * 0.5;
}

function pickToken(s: GameState, level: Level): Move | null {
  if (!s.turn.canTakeToken) return null;
  const me = currentPlayer(s);
  const tokens = s.roomTokens[me.room] ?? [];
  const artifact = tokens.findIndex((t) => t.kind === 'artifact');
  if (artifact >= 0 && !hasArtifact(me)) {
    const value = (tokens[artifact] as { value: number }).value;
    const target = chooseTarget(s, level);
    const isTarget = target?.room === me.room;
    if (level === 'easy' || isTarget || value >= (target?.value ?? 0) - (level === 'hard' ? 5 : 8)) {
      return { type: 'takeToken', index: artifact };
    }
  }
  const other = tokens.findIndex((t) => t.kind !== 'artifact');
  return other >= 0 ? { type: 'takeToken', index: other } : null;
}

function pickPotion(s: GameState, level: Level): Move | null {
  const me = currentPlayer(s);
  const index = me.tokens.findIndex((t) => {
    if (t.kind !== 'kept') return false;
    const secret = SECRETS[t.secret];
    if (secret.heal) return me.damage >= (level === 'easy' ? 1 : secret.heal + 1);
    // Boots and Swords potions: Easy drinks them right away, others when stuck
    if (secret.boots || secret.swords) return level === 'easy' || stuckFor(s, level, secret.boots ? 'boots' : 'swords');
    return false;
  });
  return index >= 0 ? { type: 'useToken', index } : null;
}

// Would one more Boot / two more Swords let the bot take its next step?
function stuckFor(s: GameState, level: Level, what: 'boots' | 'swords'): boolean {
  if (isExhausted(s)) return false;
  const target = chooseTarget(s, level);
  if (!target) return false;
  const me = currentPlayer(s);
  const o = pathOptions(me, level);
  const dist = distancesTo(target.room, o);
  const left = available(s);
  return moveOptions(s).some((m) => {
    if ((dist[m.to] ?? Infinity) >= (dist[me.room] ?? Infinity)) return false;
    if (what === 'boots') return !m.allowed && m.reason?.startsWith('Needs') && left.boots + 1 >= m.boots;
    // Swords only help on a monster tunnel the bot can otherwise walk now
    return left.boots >= m.boots && (!m.locked || hasToken(me, 'masterKey')) && m.monsters > left.swords;
  });
}

function pickMarket(s: GameState, level: Level): Move | null {
  const me = currentPlayer(s);
  if (level === 'easy' || ROOMS[me.room].type !== 'market' || me.gold < MARKET_PRICE) return null;
  // A Master Key if it makes the way to the goal clearly shorter
  if (!hasToken(me, 'masterKey') && s.market.masterKey) {
    const target = chooseTarget(s, level);
    if (target) {
      const o = pathOptions(me, level);
      const without = distancesTo(target.room, o)[me.room] ?? Infinity;
      const withKey = distancesTo(target.room, { ...o, hasKey: true })[me.room] ?? Infinity;
      if (withKey + 2 <= without) return { type: 'buyMarket', item: 'masterKey' };
    }
  }
  // A Crown is worth more points than the 7 Gold it costs
  if (s.market.crowns.length) return { type: 'buyMarket', item: 'crown' };
  return null;
}

function pickStep(s: GameState, level: Level, rnd: Random): Move | null {
  const me = currentPlayer(s);
  const target = chooseTarget(s, level);
  const options = moveOptions(s).filter((o) => o.allowed);
  if (!target || !options.length) return null;

  const o = pathOptions(me, level);
  const dist = distancesTo(target.room, o);
  const here = dist[me.room] ?? Infinity;

  // Easy sometimes takes a wrong turn
  if (level === 'easy' && rnd() < 0.25) return walk(s, level, options[Math.floor(rnd() * options.length)]);

  let best: MoveOption | null = null;
  let bestScore = Infinity;
  for (const m of options) {
    const score = tunnelCost(m.boots, m.monsters, m.to, o) + (dist[m.to] ?? Infinity);
    if ((dist[m.to] ?? Infinity) < here && score < bestScore) {
      best = m;
      bestScore = score;
    }
  }
  return best ? walk(s, level, best) : null;
}

function walk(s: GameState, level: Level, m: MoveOption): Move {
  // Easy takes the damage; the others block as much as they can with Swords
  const swords = level === 'easy' ? m.minSwords : Math.max(m.minSwords, Math.min(m.monsters, available(s).swords));
  return { type: 'move', to: m.to, swords };
}

// ---------- Buying and fighting ----------

function cardValue(d: CardDef, s: GameState, level: Level): number {
  const me = currentPlayer(s);
  const late = hasArtifact(me) || !!s.countdown;
  let v =
    (d.skill ?? 0) * 1.5 +
    (d.swords ?? 0) * 1.2 +
    (d.boots ?? 0) * (late ? 2.5 : 2) +
    (d.draw ?? 0) * 2.2 +
    (d.gold ?? 0) * 0.9 -
    Math.max(0, d.clank ?? 0) * 2 +
    Math.max(0, -(d.clank ?? 0)) * 1.2 +
    (d.points ?? 0) * (level === 'hard' && late ? 1.4 : 0.6);
  if (d.ifCompanionDraw) v += 1;
  if (d.ifArtifact) v += 1.5;
  if (d.ifCrown) v += hasToken(me, 'crown') ? 2 : 0.5;
  if (d.skillPerClank) v += 1;
  if (d.discardToDraw) v += 1.2;
  if (d.ifIdol) v += hasToken(me, 'idol') ? 3 : 0.5;
  if (d.ifArtifact?.teleport) v += 0.5;
  if (d.choices) v += 1.5;
  if (d.goldBonus) v += 1.5;
  if (d.gemDiscount) v += 0.5;
  if (d.trashBurgle) v += 1.5;
  if (d.noCaveStop) v += 0.5;
  if (d.ignoreTunnelMonsters) v += 1;
  v += (d.teleport ?? 0) * 1.5 + (d.othersClank ? 0.5 : 0);
  if (d.acquire) v += effectValue(d.acquire, me) * 0.5;
  if (d.bonus) {
    const tomes = [...me.deck, ...me.hand, ...me.discard, ...me.playArea].filter((c) => c.startsWith('secretTome')).length;
    const expected = { fiveGold: (me.gold + 5) / 5, secretTome: tomes + 0.5, twoTreasures: 0.3, mastery: hasArtifact(me) ? 0.8 : 0.4 }[d.bonus.per];
    v += d.bonus.points * expected * (level === 'hard' && late ? 1.4 : 0.6);
  }
  return v;
}

function pickPurchase(s: GameState, level: Level, rnd: Random): Move | null {
  const me = currentPlayer(s);
  const left = available(s);
  const wantsToMove = !isExhausted(s) && !!chooseTarget(s, level);
  const options: { move: Move; value: number }[] = [];

  s.dungeonRow.forEach((uid, slot) => {
    if (!uid) return;
    const d = cardDef(uid);
    if (placeProblem(s, d)) return;
    if (d.banner === 'monster') {
      if (left.swords >= (d.defeatSwords ?? 0)) {
        options.push({ move: { type: 'fight', slot }, value: effectValue(d.defeat ?? {}, me) + 0.5 });
      }
    } else if (d.banner === 'device') {
      if (left.skill >= (d.cost ?? 0)) {
        const use = d.use ?? {};
        const move = wantsToMove ? (use.boots ?? 0) * 1.5 + (use.teleport ?? 0) : 0;
        const best = d.choices ? Math.max(...d.choices.map((c) => choiceValue(s, c))) : 0;
        options.push({ move: { type: 'useDevice', slot }, value: move + (use.gold ?? 0) * 0.9 - (use.clank ?? 0) * 0.5 + best });
      }
    } else if (left.skill >= cardCost(s, d)) {
      options.push({ move: { type: 'buy', slot }, value: cardValue(d, s, level) });
    }
  });
  for (const pile of ['mercenary', 'explore', 'secretTome'] as const) {
    const d = CARDS[pile];
    if (s.reserve[pile].length && left.skill >= (d.cost ?? 0)) options.push({ move: { type: 'buyReserve', pile }, value: cardValue(d, s, level) });
  }
  if (left.swords >= (CARDS.goblin.defeatSwords ?? 2)) options.push({ move: { type: 'fightGoblin' }, value: 1 });

  if (!options.length) return null;
  if (level === 'easy') return rnd() < 0.6 ? options[Math.floor(rnd() * options.length)].move : null;
  const best = options.sort((a, b) => b.value - a.value)[0];
  return best.value >= 1 ? best.move : null;
}
