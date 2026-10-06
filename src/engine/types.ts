// The whole game state is plain data: easy to save, send over the network,
// replay and test. Rules live in engine.ts; screens only read this.

export type RoomId = string;
export type CardUid = string; // e.g. "burgle#3"; the part before "#" is the card id

export type PlayerColor = 'red' | 'yellow' | 'green' | 'blue';

export type SecretId =
  | 'potionGreaterHealing' | 'greaterSkillBoost' | 'greaterTreasure' | 'flashOfBrilliance' | 'chalice'
  | 'potionHealing' | 'potionSwiftness' | 'potionStrength' | 'skillBoost' | 'treasure' | 'magicSpring' | 'dragonEgg';

export type Token =
  | { kind: 'artifact'; value: number }
  | { kind: 'idol' }
  | { kind: 'majorSecret'; secret: SecretId }
  | { kind: 'minorSecret'; secret: SecretId }
  | { kind: 'masterKey' }
  | { kind: 'backpack' }
  | { kind: 'crown'; value: number }
  | { kind: 'mastery' }
  | { kind: 'kept'; secret: SecretId }; // a revealed secret the player keeps (potions, chalice, dragon egg)

export type PlayerStatus = 'playing' | 'escaped' | 'rescued' | 'dead';

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  deck: CardUid[];
  hand: CardUid[];
  discard: CardUid[];
  playArea: CardUid[];
  room: RoomId;
  status: PlayerStatus;
  damage: number; // cubes on the health meter
  supply: number; // Loảng xoảng! cubes still in the personal supply
  gold: number;
  tokens: Token[];
}

export interface Turn {
  earned: { skill: number; swords: number; boots: number };
  spent: { skill: number; swords: number; boots: number };
  teleports: number;
  clankMade: number; // Loảng xoảng! gained this turn, for Swagger
  clankCredit: number; // leftover negative Loảng xoảng! that cancels later Loảng xoảng! this turn
  exhausted: boolean; // entered a Crystal Cave: no more Boots this turn
  canTakeToken: boolean; // only once per entering a room
  conditionalDraws: CardUid[]; // "if ... draw a card" cards that already drew
  trashes: number; // Magic Spring: trash a card before the turn ends
  goldBonus: number; // Search: extra Gold each time you gain Gold
  gemDiscount: number; // Gem Collector: Gems cost less
  noCaveStop: boolean; // Dead Run, Flying Carpet: Crystal Caves don't stop you
  ignoreMonsters: boolean; // Flying Carpet: no damage in tunnels
}

// A choice the current player must make before anything else.
// 'choose' answers the ones that pick a card, 'chooseOption' the others.
export type Pending =
  | { kind: 'discardToDraw'; draw: number } // Sleight of Hand
  | { kind: 'discardToChoose'; card: CardUid } // Apothecary: discard first, then 'option'
  | { kind: 'option'; card: CardUid } // pick one of the card's choices
  | { kind: 'trash'; reason: 'spring' | 'burgle' | 'card' } // Magic Spring (end of turn), Master Burglar, Dragon Shrine
  | { kind: 'replaceRow' } // Treasure Hunter: pick a Dungeon Row space, or skip
  | { kind: 'adjacentSecret' }; // Wand of Wind: pick one of adjacentSecrets(state)

export interface GameState {
  seed: number;
  players: Player[];
  current: number;
  turn: Turn;
  dungeonDeck: CardUid[];
  dungeonRow: (CardUid | null)[];
  dungeonDiscard: CardUid[];
  reserve: Record<'mercenary' | 'explore' | 'secretTome', CardUid[]>;
  roomTokens: Record<RoomId, Token[]>;
  market: { masterKey: number; backpack: number; crowns: number[] };
  clankArea: Record<string, number>; // player id -> cubes
  bag: Record<string, number>; // 'black' or player id -> cubes
  rage: number; // index on the rage track
  countdown: { playerId: string; space: number } | null;
  pending: Pending | null;
  log: string[];
  over: boolean;
}

export type Move =
  | { type: 'play'; uid: CardUid }
  | { type: 'playAll' }
  | { type: 'buy'; slot: number }
  | { type: 'buyReserve'; pile: keyof GameState['reserve'] }
  | { type: 'fight'; slot: number }
  | { type: 'fightGoblin' }
  | { type: 'useDevice'; slot: number }
  | { type: 'move'; to: RoomId; swords?: number; teleport?: boolean }
  | { type: 'takeToken'; index: number }
  | { type: 'buyMarket'; item: 'masterKey' | 'backpack' | 'crown' }
  | { type: 'useToken'; index: number }
  | { type: 'choose'; uid: CardUid | null }
  | { type: 'chooseOption'; index: number | null }
  | { type: 'endTurn' };
