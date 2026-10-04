// The rules. applyMove(state, move) returns the next state or throws a
// RuleError explaining why the move isn't allowed. No React, no drawing.

import { produce } from 'immer';
import { CARDS, cardDef, type Effect } from './cards';
import { roomLabel, ROOMS, TUNNELS, type Tunnel } from './map';
import { random, shuffle } from './rng';
import { SECRETS } from './secrets';
import { drawCards, HAND_SIZE, MARKET_PRICE, MAX_HEALTH, newTurn, RAGE_TRACK } from './setup';
import type { CardUid, GameState, Move, Player, RoomId, Token } from './types';

export class RuleError extends Error {}

function fail(message: string): never {
  throw new RuleError(message);
}

// ---------- Questions the screens ask ----------

export const currentPlayer = (s: GameState): Player => s.players[s.current];

export const hasArtifact = (p: Player) => p.tokens.some((t) => t.kind === 'artifact');
export const hasToken = (p: Player, kind: Token['kind']) => p.tokens.some((t) => t.kind === kind);
const artifactLimit = (p: Player) => (hasToken(p, 'backpack') ? 2 : 1);

// Skill, Swords and Boots left this turn. Conditional card effects are worked
// out from the current state, so they count whatever order the cards were
// played in (rulebook: "Order of Card Plays").
export function available(s: GameState) {
  const p = currentPlayer(s);
  const t = s.turn;
  const total = { ...t.earned };
  const add = (e?: Effect) => {
    total.skill += e?.skill ?? 0;
    total.swords += e?.swords ?? 0;
    total.boots += e?.boots ?? 0;
  };
  for (const uid of p.playArea) {
    const d = cardDef(uid);
    if (d.ifArtifact && hasArtifact(p)) add(d.ifArtifact);
    if (d.ifCrown && hasToken(p, 'crown')) add(d.ifCrown);
    if (d.skillPerClank) total.skill += t.clankMade;
  }
  return {
    skill: total.skill - t.spent.skill,
    swords: total.swords - t.spent.swords,
    boots: total.boots - t.spent.boots,
  };
}

// The room on the other side of a tunnel when leaving `room`, if allowed
function otherEnd(t: Tunnel, room: RoomId, ignoreDirection: boolean): RoomId | null {
  if (t.from === room) return t.to;
  if (t.to === room && (!t.oneWay || ignoreDirection)) return t.from;
  return null;
}

export interface MoveOption {
  to: RoomId;
  boots: number;
  monsters: number;
  locked: boolean;
  allowed: boolean;
  reason?: string;
  minSwords: number; // Swords needed so the damage doesn't knock you out
}

// Every tunnel out of the current room and whether you can take it now
export function moveOptions(s: GameState): MoveOption[] {
  const p = currentPlayer(s);
  const left = available(s);
  const options: MoveOption[] = [];
  for (const t of TUNNELS) {
    const to = otherEnd(t, p.room, false);
    if (!to) continue;
    const boots = t.boots ?? 1;
    const monsters = t.monsters ?? 0;
    const maxDamage = Math.min(MAX_HEALTH - 1 - p.damage, p.supply);
    const minSwords = Math.max(0, monsters - Math.max(0, maxDamage));
    let reason: string | undefined;
    if (s.turn.exhausted) reason = 'You entered a Crystal Cave this turn';
    else if (left.boots < boots) reason = `Needs ${boots} Boot${boots > 1 ? 's' : ''}`;
    else if (t.locked && !hasToken(p, 'masterKey')) reason = 'Locked: needs a Master Key';
    else if (to === 'entrance' && !hasArtifact(p)) reason = "You can't leave without an Artifact";
    else if (minSwords > left.swords) reason = 'The monster damage would knock you out';
    options.push({ to, boots, monsters, locked: !!t.locked, allowed: !reason, reason, minSwords });
  }
  return options;
}

// Rooms a teleport can reach: every connected room, ignoring tunnel rules
export function teleportOptions(s: GameState): RoomId[] {
  const p = currentPlayer(s);
  if (!s.turn.teleports) return [];
  return [...new Set(TUNNELS.map((t) => otherEnd(t, p.room, true)).filter((r): r is RoomId => !!r))]
    .filter((r) => r !== 'entrance' || hasArtifact(p));
}

export function canEndTurn(s: GameState): { ok: boolean; reason?: string } {
  if (s.pending) return { ok: false, reason: 'Finish the current choice first' };
  if (currentPlayer(s).hand.length) return { ok: false, reason: 'Play all the cards in your hand first' };
  return { ok: true };
}

// ---------- Effects ----------

function log(s: GameState, message: string) {
  s.log.push(message);
}

function addClank(s: GameState, p: Player, amount: number) {
  if (p.status !== 'playing' || amount === 0) return;
  const isCurrent = p.id === currentPlayer(s).id;
  if (amount > 0) {
    if (isCurrent) {
      s.turn.clankMade += amount;
      const cancelled = Math.min(s.turn.clankCredit, amount);
      s.turn.clankCredit -= cancelled;
      amount -= cancelled;
    }
    // Out of cubes: you can't be forced to add more
    const added = Math.min(amount, p.supply);
    p.supply -= added;
    s.clankArea[p.id] += added;
  } else {
    const removed = Math.min(-amount, s.clankArea[p.id]);
    s.clankArea[p.id] -= removed;
    p.supply += removed;
    if (isCurrent) s.turn.clankCredit += -amount - removed;
  }
}

function heal(p: Player, amount: number) {
  const healed = Math.min(amount, p.damage);
  p.damage -= healed;
  p.supply += healed;
}

function applyEffect(s: GameState, p: Player, e: Effect) {
  s.turn.earned.skill += e.skill ?? 0;
  s.turn.earned.swords += e.swords ?? 0;
  s.turn.earned.boots += e.boots ?? 0;
  p.gold += e.gold ?? 0;
  s.turn.teleports += e.teleport ?? 0;
  if (e.clank) addClank(s, p, e.clank);
  if (e.heal) heal(p, e.heal);
  if (e.draw) drawCards(s, p, e.draw);
  if (e.allPlayersClank) s.players.forEach((other) => addClank(s, other, e.allPlayersClank!));
}

// "If you have another companion in your play area, draw a card": checked
// after every move, so the order of playing doesn't matter
function checkConditionalDraws(s: GameState) {
  const p = currentPlayer(s);
  for (const uid of p.playArea) {
    const d = cardDef(uid);
    if (!d.ifCompanionDraw || s.turn.conditionalDraws.includes(uid)) continue;
    if (p.playArea.some((other) => other !== uid && cardDef(other).companion)) {
      s.turn.conditionalDraws.push(uid);
      drawCards(s, p, d.ifCompanionDraw);
      log(s, `${p.name} draws a card (${d.name}).`);
    }
  }
}

// ---------- Health, dragon, end of game ----------

function startCountdown(s: GameState, p: Player) {
  if (!s.countdown) {
    s.countdown = { playerId: p.id, space: 1 };
    log(s, `The countdown starts (${p.name} is out of the dungeon).`);
  }
}

function knockOut(s: GameState, p: Player) {
  if (p.status !== 'playing') return;
  const rescued = hasArtifact(p) && !ROOMS[p.room].depths;
  p.status = rescued ? 'rescued' : 'dead';
  log(s, rescued
    ? `${p.name} is knocked out, but rescued by the townsfolk.`
    : `${p.name} is knocked out ${hasArtifact(p) ? 'in the Depths' : 'without an Artifact'} and loses.`);
  startCountdown(s, p);
}

function takeDamage(s: GameState, p: Player, amount: number) {
  p.damage += amount;
  if (p.damage >= MAX_HEALTH) knockOut(s, p);
}

export function dragonAttack(s: GameState, extra = 0) {
  for (const [id, n] of Object.entries(s.clankArea)) {
    s.bag[id] = (s.bag[id] ?? 0) + n;
    s.clankArea[id] = 0;
  }
  const danger = s.dungeonRow.filter((c) => c && cardDef(c).danger).length;
  let draws = RAGE_TRACK[s.rage] + danger + extra;
  const hits: Record<string, number> = {};
  let black = 0;
  while (draws-- > 0) {
    const total = Object.values(s.bag).reduce((a, b) => a + b, 0);
    if (!total) break;
    let pick = Math.floor(random(s) * total);
    const color = Object.keys(s.bag).find((k) => (pick -= s.bag[k]) < 0)!;
    s.bag[color]--;
    const victim = s.players.find((p) => p.id === color);
    // Black cubes and cubes of players out of the dungeon are set aside
    if (!victim || victim.status !== 'playing') {
      black++;
      continue;
    }
    hits[victim.id] = (hits[victim.id] ?? 0) + 1;
    takeDamage(s, victim, 1);
  }
  const summary = Object.entries(hits).map(([id, n]) => `${s.players.find((p) => p.id === id)!.name} ${n}`).join(', ');
  log(s, `🐉 Dragon attack! ${summary ? 'Damage: ' + summary : 'No damage'}${black ? ` (${black} set aside)` : ''}.`);
}

function refillRow(s: GameState) {
  let attack = false;
  for (let i = 0; i < s.dungeonRow.length; i++) {
    if (s.dungeonRow[i]) continue;
    // House rule: this demo's deck has 35 cards instead of 100, so it runs
    // out. Without new cards the dragon never attacks again and the game can
    // go on forever, so the Dungeon discard pile becomes the new deck.
    if (!s.dungeonDeck.length && s.dungeonDiscard.length) {
      s.dungeonDeck = shuffle(s, s.dungeonDiscard);
      s.dungeonDiscard = [];
      log(s, 'The Dungeon Deck is empty: the discard pile is shuffled into a new deck.');
    }
    const card = s.dungeonDeck.shift();
    if (!card) break;
    s.dungeonRow[i] = card;
    const d = cardDef(card);
    if (d.arrive) {
      log(s, `${d.name} arrives: ${d.text}`);
      applyEffect(s, currentPlayer(s), { allPlayersClank: d.arrive.allPlayersClank });
    }
    if (d.dragonAttack) attack = true;
  }
  // Only one attack, however many Dragon Attack cards were revealed
  if (attack) dragonAttack(s);
}

function checkGameOver(s: GameState) {
  if (s.players.every((p) => p.status !== 'playing')) {
    s.over = true;
    log(s, 'Everyone is out of the dungeon. Game over!');
  }
}

function advanceToNextPlayer(s: GameState) {
  s.turn = newTurn();
  for (let guard = 0; guard < s.players.length * 6; guard++) {
    checkGameOver(s);
    if (s.over) return;
    s.current = (s.current + 1) % s.players.length;
    const p = currentPlayer(s);
    if (p.status === 'playing') {
      log(s, `${p.name}'s turn.`);
      return;
    }
    // The first player out moves the countdown instead of taking a turn
    if (s.countdown?.playerId === p.id) {
      s.countdown.space++;
      if (s.countdown.space <= 4) {
        log(s, `Countdown space ${s.countdown.space}: instant dragon attack (+${s.countdown.space - 1} cubes).`);
        dragonAttack(s, s.countdown.space - 1);
      } else {
        log(s, 'Countdown space 5: the dragon knocks out everyone still in the dungeon!');
        s.players.forEach((other) => knockOut(s, other));
      }
    }
  }
}

function finishTurn(s: GameState) {
  const p = currentPlayer(s);
  p.discard.push(...p.playArea, ...p.hand);
  p.playArea = [];
  p.hand = [];
  if (p.status === 'playing') drawCards(s, p, HAND_SIZE);
  refillRow(s);
  advanceToNextPlayer(s);
}

// ---------- Moves ----------

function enterRoom(s: GameState, p: Player, to: RoomId) {
  p.room = to;
  const room = ROOMS[to];
  s.turn.canTakeToken = !!s.roomTokens[to]?.length;
  if (room.type === 'cave') s.turn.exhausted = true;
  if (room.type === 'fountain' && p.damage) {
    heal(p, 1);
    log(s, `${p.name} heals 1 at the fountain.`);
  }
  if (to === 'entrance') {
    p.status = 'escaped';
    p.tokens.push({ kind: 'mastery' });
    log(s, `${p.name} escapes the dungeon with an Artifact! (+20 Mastery)`);
    startCountdown(s, p);
    finishTurn(s);
  }
}

function takeToken(s: GameState, p: Player, index: number) {
  if (!s.turn.canTakeToken) fail('You can take one token each time you enter a room');
  const tokens = s.roomTokens[p.room] ?? [];
  const token = tokens[index] ?? fail('No such token here');
  if (token.kind === 'artifact') {
    if (p.tokens.filter((t) => t.kind === 'artifact').length >= artifactLimit(p)) {
      fail(hasToken(p, 'backpack') ? 'You already carry two Artifacts' : 'You already carry an Artifact (a Backpack allows a second)');
    }
    s.rage = Math.min(s.rage + 1, RAGE_TRACK.length - 1);
    p.tokens.push(token);
    log(s, `${p.name} takes the Artifact (${token.value})! The dragon gets angrier.`);
  } else if (token.kind === 'majorSecret' || token.kind === 'minorSecret') {
    const secret = SECRETS[token.secret];
    log(s, `${p.name} finds ${secret.name}: ${secret.text}`);
    s.turn.earned.skill += secret.skill ?? 0;
    p.gold += secret.gold ?? 0;
    if (secret.draw) drawCards(s, p, secret.draw);
    if (secret.rage) s.rage = Math.min(s.rage + secret.rage, RAGE_TRACK.length - 1);
    s.turn.trashes += secret.trash ?? 0;
    if (secret.keep) p.tokens.push({ kind: 'kept', secret: token.secret });
  } else {
    p.tokens.push(token);
    log(s, `${p.name} takes a ${token.kind === 'idol' ? 'Monkey Idol' : token.kind}.`);
  }
  tokens.splice(index, 1);
  s.turn.canTakeToken = false;
}

function rowCard(s: GameState, slot: number): CardUid {
  return s.dungeonRow[slot] ?? fail('That space in the Dungeon Row is empty');
}

function pay(s: GameState, resource: 'skill' | 'swords', amount: number, what: string) {
  if (available(s)[resource] < amount) fail(`${what} needs ${amount} ${resource === 'skill' ? 'Skill' : 'Swords'}`);
  s.turn.spent[resource] += amount;
}

function playCard(s: GameState, p: Player, uid: CardUid) {
  const i = p.hand.indexOf(uid);
  if (i < 0) fail('That card is not in your hand');
  p.hand.splice(i, 1);
  p.playArea.push(uid);
  const d = cardDef(uid);
  applyEffect(s, p, d);
  if (d.discardToDraw && p.hand.length) s.pending = { kind: 'discardToDraw', draw: d.discardToDraw };
}

function step(s: GameState, move: Move) {
  const p = currentPlayer(s);
  if (s.over) fail('The game is over');
  if (s.pending && move.type !== 'choose') fail('Finish the current choice first');

  switch (move.type) {
    case 'play':
      playCard(s, p, move.uid);
      break;

    case 'playAll':
      while (p.hand.length && !s.pending) playCard(s, p, p.hand[0]);
      break;

    case 'choose': {
      const pending = s.pending ?? fail('Nothing to choose');
      if (pending.kind === 'discardToDraw') {
        if (move.uid) {
          const i = p.hand.indexOf(move.uid);
          if (i < 0) fail('Pick a card from your hand');
          p.discard.push(...p.hand.splice(i, 1));
          drawCards(s, p, pending.draw);
          log(s, `${p.name} discards ${cardDef(move.uid).name} and draws ${pending.draw}.`);
        }
        s.pending = null;
      } else {
        const options = [...p.playArea, ...p.discard];
        if (move.uid) {
          const pile = p.playArea.includes(move.uid) ? p.playArea : p.discard;
          const i = pile.indexOf(move.uid);
          if (i < 0) fail('Pick a card from your play area or discard pile');
          pile.splice(i, 1);
          log(s, `${p.name} trashes ${cardDef(move.uid).name}.`);
        } else if (options.length) fail('You must trash a card');
        s.turn.trashes--;
        s.pending = null;
      }
      break;
    }

    case 'buy': {
      const card = rowCard(s, move.slot);
      const d = cardDef(card);
      if (d.banner === 'monster') fail('Monsters are fought with Swords, not bought');
      if (d.banner === 'device') fail('Devices are used, not kept');
      pay(s, 'skill', d.cost ?? 0, d.name);
      p.discard.push(card);
      s.dungeonRow[move.slot] = null;
      log(s, `${p.name} acquires ${d.name}.`);
      break;
    }

    case 'buyReserve': {
      const pile = s.reserve[move.pile];
      if (!pile.length) fail('That Reserve pile is empty');
      const d = CARDS[move.pile];
      pay(s, 'skill', d.cost ?? 0, d.name);
      p.discard.push(pile.pop()!);
      log(s, `${p.name} acquires ${d.name}.`);
      break;
    }

    case 'fight': {
      const card = rowCard(s, move.slot);
      const d = cardDef(card);
      if (d.banner !== 'monster') fail('Only Monsters can be fought');
      if (d.onlyInCrystalCave && ROOMS[p.room].type !== 'cave') fail(`${d.name} can only be fought in a Crystal Cave`);
      pay(s, 'swords', d.defeatSwords ?? 0, `Defeating ${d.name}`);
      applyEffect(s, p, d.defeat ?? {});
      s.dungeonDiscard.push(card);
      s.dungeonRow[move.slot] = null;
      log(s, `${p.name} defeats ${d.name}.`);
      break;
    }

    case 'fightGoblin': {
      const d = CARDS.goblin;
      pay(s, 'swords', d.defeatSwords!, 'Defeating the Goblin');
      applyEffect(s, p, d.defeat!);
      log(s, `${p.name} defeats the Goblin.`);
      break;
    }

    case 'useDevice': {
      const card = rowCard(s, move.slot);
      const d = cardDef(card);
      if (d.banner !== 'device') fail('That card is not a Device');
      pay(s, 'skill', d.cost ?? 0, d.name);
      applyEffect(s, p, d.use ?? {});
      s.dungeonDiscard.push(card);
      s.dungeonRow[move.slot] = null;
      log(s, `${p.name} uses ${d.name}.`);
      break;
    }

    case 'move': {
      if (move.teleport) {
        if (!teleportOptions(s).includes(move.to)) fail("You can't teleport there");
        s.turn.teleports--;
        log(s, `${p.name} teleports.`);
        enterRoom(s, p, move.to);
        break;
      }
      const option = moveOptions(s).find((o) => o.to === move.to) ?? fail('No tunnel leads there');
      if (!option.allowed) fail(option.reason!);
      const swords = Math.min(move.swords ?? option.minSwords, option.monsters);
      if (swords < option.minSwords) fail('The monster damage would knock you out');
      if (swords > available(s).swords) fail('Not enough Swords');
      s.turn.spent.boots += option.boots;
      s.turn.spent.swords += swords;
      const damage = option.monsters - swords;
      if (move.to !== 'entrance') log(s, `${p.name} moves into ${roomLabel(move.to)}.`);
      if (damage) {
        p.supply -= damage;
        takeDamage(s, p, damage);
        log(s, `${p.name} takes ${damage} damage in the tunnel.`);
      }
      enterRoom(s, p, move.to);
      break;
    }

    case 'takeToken':
      takeToken(s, p, move.index);
      break;

    case 'buyMarket': {
      if (ROOMS[p.room].type !== 'market') fail('You can only buy in a Market room');
      if (p.gold < MARKET_PRICE) fail(`Market items cost ${MARKET_PRICE} Gold`);
      if (move.item === 'crown') {
        const value = s.market.crowns.shift() ?? fail('No Crowns left');
        p.tokens.push({ kind: 'crown', value });
      } else {
        if (!s.market[move.item]) fail('None left');
        s.market[move.item]--;
        p.tokens.push({ kind: move.item });
      }
      p.gold -= MARKET_PRICE;
      log(s, `${p.name} buys a ${move.item === 'masterKey' ? 'Master Key' : move.item === 'backpack' ? 'Backpack' : 'Crown'}.`);
      break;
    }

    case 'useToken': {
      const token = p.tokens[move.index];
      if (token?.kind !== 'kept') fail('That token can\'t be used');
      const secret = SECRETS[token.secret];
      if (!secret.heal && !secret.boots && !secret.swords) fail(`${secret.name} is kept for points`);
      if (secret.heal) heal(p, secret.heal);
      s.turn.earned.boots += secret.boots ?? 0;
      s.turn.earned.swords += secret.swords ?? 0;
      p.tokens.splice(move.index, 1);
      log(s, `${p.name} uses ${secret.name}.`);
      break;
    }

    case 'endTurn': {
      const check = canEndTurn(s);
      if (!check.ok) fail(check.reason!);
      if (s.turn.trashes > 0 && p.playArea.length + p.discard.length) {
        s.pending = { kind: 'trash' };
        return;
      }
      finishTurn(s);
      return;
    }
  }
  checkConditionalDraws(s);
}

export function applyMove(state: GameState, move: Move): GameState {
  return produce(state, (draft) => {
    step(draft, move);
  });
}
