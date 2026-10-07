import { CARDS, DUNGEON_DECK, RESERVE, STARTING_DECK, cardDef } from './cards';
import { ROOMS } from './map';
import { shuffle } from './rng';
import { MAJOR_SECRETS, MINOR_SECRETS } from './secrets';
import type { CardUid, GameState, Player, PlayerColor, SecretId, Token, Turn } from './types';

export const COLORS: PlayerColor[] = ['red', 'yellow', 'green', 'blue'];
export const RAGE_TRACK = [2, 2, 3, 3, 4, 4, 5]; // cubes drawn per dragon attack
export const MAX_HEALTH = 10;
export const CLANK_CUBES = 30;
export const MARKET_PRICE = 7;
export const HAND_SIZE = 5;
export const ROW_SIZE = 6;
export const BLACK_CUBES = 24;

const copies = (counts: Record<string, number>, prefix = ''): CardUid[] =>
  Object.entries(counts).flatMap(([id, n]) => {
    if (!CARDS[id]) throw new Error(`Unknown card ${id}`);
    return Array.from({ length: n }, (_, i) => `${id}#${prefix}${i + 1}`);
  });

const expand = (counts: Partial<Record<SecretId, number>>): SecretId[] =>
  Object.entries(counts).flatMap(([id, n]) => Array(n).fill(id as SecretId));

export function newTurn(): Turn {
  return {
    earned: { skill: 0, swords: 0, boots: 0 },
    spent: { skill: 0, swords: 0, boots: 0 },
    teleports: 0,
    clankMade: 0,
    clankCredit: 0,
    exhausted: false,
    canTakeToken: false,
    conditionalDraws: [],
    trashes: 0,
    goldBonus: 0,
    gemDiscount: 0,
    noCaveStop: false,
    ignoreMonsters: false,
  };
}

export function drawCards(state: { seed: number }, player: Player, n: number): number {
  let drawn = 0;
  for (let i = 0; i < n; i++) {
    if (player.deck.length === 0) {
      // The play area is not reshuffled, only the discard pile
      player.deck = shuffle(state, player.discard);
      player.discard = [];
    }
    const card = player.deck.shift();
    if (!card) break;
    player.hand.push(card);
    drawn++;
  }
  return drawn;
}

export function createGame(names: string[], seed = Date.now()): GameState {
  if (names.length < 2 || names.length > 4) throw new Error('Loảng xoảng! is for 2 to 4 players');
  const rng = { seed };

  const players: Player[] = names.map((name, i) => {
    const player: Player = {
      id: COLORS[i],
      name,
      color: COLORS[i],
      deck: shuffle(rng, copies(STARTING_DECK, `${COLORS[i]}-`)),
      hand: [],
      discard: [],
      playArea: [],
      room: 'entrance',
      status: 'playing',
      damage: 0,
      supply: CLANK_CUBES,
      gold: 0,
      tokens: [],
    };
    drawCards(rng, player, HAND_SIZE);
    return player;
  });

  // Tokens on the board. With fewer than 4 players some Artifacts are removed.
  const roomTokens: Record<string, Token[]> = {};
  const artifactRooms = Object.entries(ROOMS).filter(([, r]) => r.tokens?.some((t) => typeof t === 'object'));
  const removed = new Set(shuffle(rng, artifactRooms.map(([id]) => id)).slice(0, Math.max(0, 4 - names.length)));
  const majors = shuffle(rng, expand(MAJOR_SECRETS));
  const minors = shuffle(rng, expand(MINOR_SECRETS));
  for (const [id, room] of Object.entries(ROOMS)) {
    const tokens: Token[] = [];
    for (const t of room.tokens ?? []) {
      if (typeof t === 'object') {
        if (!removed.has(id)) tokens.push({ kind: 'artifact', value: t.artifact });
      } else if (t === 'idol') tokens.push({ kind: 'idol' });
      else if (t === 'majorSecret') tokens.push({ kind: 'majorSecret', secret: majors.pop()! });
      else tokens.push({ kind: 'minorSecret', secret: minors.pop()! }, { kind: 'minorSecret', secret: minors.pop()! });
    }
    if (tokens.length) roomTokens[id] = tokens;
  }

  // Dungeon Row: no Dragon Attack cards at the start
  const deck = shuffle(rng, copies(DUNGEON_DECK));
  const row: CardUid[] = [];
  const setAside: CardUid[] = [];
  while (row.length < ROW_SIZE) {
    const card = deck.shift()!;
    (cardDef(card).dragonAttack ? setAside : row).push(card);
  }
  const dungeonDeck = shuffle(rng, [...deck, ...setAside]);

  // First player 3 Loảng xoảng!, second 2, third 1, fourth 0
  const clankArea: Record<string, number> = {};
  players.forEach((p, i) => {
    const n = Math.max(0, 3 - i);
    clankArea[p.id] = n;
    p.supply -= n;
  });

  return {
    seed: rng.seed,
    players,
    current: 0,
    turn: newTurn(),
    dungeonDeck,
    dungeonRow: row,
    dungeonDiscard: [],
    reserve: {
      mercenary: copies({ mercenary: RESERVE.mercenary }),
      explore: copies({ explore: RESERVE.explore }),
      secretTome: copies({ secretTome: RESERVE.secretTome }),
    },
    roomTokens,
    market: { masterKey: 2, backpack: 2, crowns: [10, 9, 8] },
    clankArea,
    bag: { black: BLACK_CUBES },
    rage: 4 - names.length, // 4 players: first space, 3: second, 2: third
    countdown: null,
    pending: null,
    log: [{ k: 'starts', p: { player: players[0].name } }],
    over: false,
  };
}
