// Card definitions. Only cards shown or quoted in the rulebook; the real
// dungeon deck has 100 cards that the rulebook doesn't list.
//
// source:
//   'rulebook'      values read from a card pictured in the rulebook
//   'rulebook-text' effect quoted in the rulebook text; cost/points assumed
//   'assumed'       not shown in the rulebook (values are our guess)

export interface Effect {
  skill?: number;
  swords?: number;
  boots?: number;
  gold?: number;
  clank?: number;
  draw?: number;
  heal?: number;
  teleport?: number;
  allPlayersClank?: number;
}

export type Banner = 'starter' | 'reserve' | 'dungeon' | 'device' | 'monster';

export interface CardDef extends Effect {
  id: string;
  name: string;
  banner: Banner;
  companion?: boolean;
  cost?: number; // Skill to acquire (or to use a Device)
  defeatSwords?: number; // Swords to defeat a Monster
  points?: number;
  text?: string; // rules text shown on the card
  // Effects that depend on the rest of the turn (checked whatever the play order)
  ifCompanionDraw?: number;
  ifArtifact?: Effect;
  ifCrown?: Effect;
  skillPerClank?: boolean;
  discardToDraw?: number;
  use?: Effect; // Device
  defeat?: Effect; // Monster reward
  arrive?: Effect; // when revealed in the Dungeon Row
  onlyInCrystalCave?: boolean;
  stays?: boolean; // Goblin: not discarded after fighting
  dragonAttack?: boolean;
  danger?: boolean;
  source: 'rulebook' | 'rulebook-text' | 'assumed';
}

const defs: CardDef[] = [
  // Starting deck
  { id: 'burgle', name: 'Burgle', banner: 'starter', skill: 1, source: 'rulebook' },
  { id: 'stumble', name: 'Stumble', banner: 'starter', clank: 1, source: 'rulebook' },
  { id: 'sidestep', name: 'Sidestep', banner: 'starter', boots: 1, source: 'assumed' },
  { id: 'scramble', name: 'Scramble', banner: 'starter', skill: 1, boots: 1, source: 'assumed' },

  // Reserve
  { id: 'mercenary', name: 'Mercenary', banner: 'reserve', companion: true, skill: 1, swords: 2, cost: 2, source: 'rulebook' },
  { id: 'explore', name: 'Explore', banner: 'reserve', skill: 2, boots: 1, cost: 3, source: 'rulebook' },
  { id: 'secretTome', name: 'Secret Tome', banner: 'reserve', points: 7, cost: 7, source: 'rulebook' },
  { id: 'goblin', name: 'Goblin', banner: 'monster', defeatSwords: 2, defeat: { gold: 1 }, stays: true,
    text: "Don't discard after fighting.", source: 'rulebook' },

  // Dungeon cards pictured in the rulebook
  { id: 'rebelCaptain', name: 'Rebel Captain', banner: 'dungeon', companion: true, skill: 2, points: 1, cost: 3,
    ifCompanionDraw: 1, text: 'If you have another companion in your play area, draw a card.', source: 'rulebook' },
  { id: 'koboldMerchant', name: 'Kobold Merchant', banner: 'dungeon', companion: true, gold: 2, points: 1, cost: 3,
    ifArtifact: { skill: 2 }, text: 'If you have an artifact, +2 Skill.', source: 'rulebook' },
  { id: 'brilliance', name: 'Brilliance', banner: 'dungeon', draw: 3, cost: 6, text: 'Draw three cards.', source: 'rulebook' },
  { id: 'elvenBoots', name: 'Elven Boots', banner: 'dungeon', skill: 1, boots: 1, draw: 1, points: 2, cost: 4,
    text: 'Draw a card.', source: 'rulebook' },
  { id: 'moveSilently', name: 'Move Silently', banner: 'dungeon', boots: 2, clank: -2, cost: 3, source: 'rulebook' },
  { id: 'ladder', name: 'Ladder', banner: 'device', cost: 3, use: { boots: 2 }, source: 'rulebook' },
  { id: 'orcGrunt', name: 'Orc Grunt', banner: 'monster', defeatSwords: 2, defeat: { gold: 3 }, dragonAttack: true,
    source: 'rulebook' },
  // The Defeat icon is small in the rulebook picture; read as Teleport
  { id: 'crystalGolem', name: 'Crystal Golem', banner: 'monster', defeatSwords: 3, defeat: { teleport: 1 },
    onlyInCrystalCave: true, text: 'Fight this only in a Crystal Cave.', source: 'rulebook' },

  // Dungeon cards quoted in the rulebook text (cost, points and base values assumed)
  { id: 'rebelScout', name: 'Rebel Scout', banner: 'dungeon', companion: true, boots: 1, cost: 3, ifCompanionDraw: 1,
    text: 'If you have another companion in your play area, draw a card.', source: 'rulebook-text' },
  { id: 'sleightOfHand', name: 'Sleight of Hand', banner: 'dungeon', cost: 2, discardToDraw: 2,
    text: 'Discard a card to draw two cards.', source: 'rulebook-text' },
  { id: 'swagger', name: 'Swagger', banner: 'dungeon', cost: 2, skillPerClank: true,
    text: 'For each Clank! you make this turn, +1 Skill.', source: 'rulebook-text' },
  { id: 'mountainKing', name: 'The Mountain King', banner: 'dungeon', companion: true, swords: 1, points: 2, cost: 4,
    ifCrown: { swords: 1, boots: 1 }, text: 'If you have a crown, +1 Sword and +1 Boot.', source: 'rulebook-text' },

  // The rulebook shows these two only as examples of Arrive and Danger, without names
  { id: 'arriveMonster', name: 'Lurker (Arrive example)', banner: 'monster', defeatSwords: 2, defeat: { gold: 2 },
    arrive: { allPlayersClank: 1 }, text: 'ARRIVE: All players get +1 Clank!', source: 'assumed' },
  { id: 'dangerMonster', name: 'Watcher (Danger example)', banner: 'monster', defeatSwords: 3, defeat: { gold: 4 },
    danger: true, dragonAttack: true, text: 'DANGER: Pull +1 cube for dragon attacks.', source: 'assumed' },
];

export const CARDS: Record<string, CardDef> = Object.fromEntries(defs.map((d) => [d.id, d]));

export const cardDef = (uid: string): CardDef => {
  const def = CARDS[uid.split('#')[0]];
  if (!def) throw new Error(`Unknown card ${uid}`);
  return def;
};

// 35 cards built from the cards above (the real deck has 100 different ones)
export const DUNGEON_DECK: Record<string, number> = {
  rebelCaptain: 3, rebelScout: 3, koboldMerchant: 3, brilliance: 2, elvenBoots: 2, moveSilently: 3,
  ladder: 3, orcGrunt: 4, crystalGolem: 2, sleightOfHand: 3, swagger: 2, mountainKing: 1,
  arriveMonster: 2, dangerMonster: 2,
};

export const STARTING_DECK: Record<string, number> = { burgle: 6, stumble: 2, sidestep: 1, scramble: 1 };

export const RESERVE: Record<'mercenary' | 'explore' | 'secretTome', number> = { mercenary: 15, explore: 15, secretTome: 12 };
