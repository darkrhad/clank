// Card definitions. The Dungeon deck (100 cards) was read from photos of the
// real cards (assets/deck1-5.jpeg); the starting deck and Reserve from the rulebook.
//
// source:
//   'photo'         read from a photo of the real card
//   'rulebook'      values read from a card pictured in the rulebook
//   'assumed'       not shown anywhere (values are our guess)

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
  othersClank?: number; // each other player
  returnCubes?: number; // dragon cubes set aside go back into the bag
}

// One option of a "this -OR- that" card
export interface Choice extends Effect {
  label: string;
  attack?: boolean; // the dragon attacks
  trash?: boolean; // trash a card from your play area or discard pile
  buyTomes?: number; // spend 7 Gold to take this many Secret Tomes
  adjacentSecret?: boolean; // take a secret from an adjacent room
}

export type Banner = 'starter' | 'reserve' | 'dungeon' | 'device' | 'monster';

export interface CardDef extends Effect {
  id: string;
  name: string;
  banner: Banner;
  companion?: boolean;
  gem?: boolean;
  cost?: number; // Skill to acquire (or to use a Device)
  defeatSwords?: number; // Swords to defeat a Monster
  points?: number;
  // "?" points, counted at the end of the game
  bonus?: { per: 'fiveGold' | 'secretTome' | 'twoTreasures' | 'mastery'; points: number };
  text?: string; // rules text shown on the card
  // Effects that depend on the rest of the turn (checked whatever the play order)
  ifCompanionDraw?: number;
  ifArtifact?: Effect;
  ifCrown?: Effect;
  ifIdol?: Effect;
  skillPerClank?: boolean;
  discardToDraw?: number;
  choices?: Choice[]; // when played (or used, for a Device): pick one
  discardToChoose?: boolean; // Apothecary: discard a card first
  goldBonus?: number; // Search: +1 Gold each time you gain Gold this turn
  gemDiscount?: number; // Gem Collector
  trashBurgle?: boolean; // Master Burglar
  replaceRow?: boolean; // Treasure Hunter
  noCaveStop?: boolean; // Dead Run, Flying Carpet
  ignoreTunnelMonsters?: boolean; // Flying Carpet
  acquire?: Effect; // when bought
  use?: Effect; // Device
  defeat?: Effect; // Monster reward
  arrive?: Effect; // when revealed in the Dungeon Row
  onlyInCrystalCave?: boolean;
  deep?: boolean; // buy, use or fight only in the Depths
  stays?: boolean; // Goblin: not discarded after fighting
  dragonAttack?: boolean;
  danger?: boolean;
  source: 'photo' | 'rulebook' | 'assumed';
}

const P = 'photo' as const;
const draw = 'Draw a card.';
const companionDraw = 'If you have another companion in your play area, draw a card.';
const gem = (id: string, name: string, cost: number): CardDef =>
  ({ id, name, banner: 'dungeon', gem: true, cost, points: cost, draw: 1, acquire: { clank: 2 }, dragonAttack: true,
    text: 'Draw a card.', source: P });

const defs: CardDef[] = [
  // Starting deck
  { id: 'burgle', name: 'Burgle', banner: 'starter', skill: 1, source: 'rulebook' },
  { id: 'stumble', name: 'Stumble', banner: 'starter', clank: 1, text: '+1 Clank!', source: 'rulebook' },
  { id: 'sidestep', name: 'Sidestep', banner: 'starter', boots: 1, source: 'assumed' },
  { id: 'scramble', name: 'Scramble', banner: 'starter', skill: 1, boots: 1, source: 'assumed' },

  // Reserve
  { id: 'mercenary', name: 'Mercenary', banner: 'reserve', companion: true, skill: 1, swords: 2, cost: 2, source: 'rulebook' },
  { id: 'explore', name: 'Explore', banner: 'reserve', skill: 2, boots: 1, cost: 3, source: 'rulebook' },
  { id: 'secretTome', name: 'Secret Tome', banner: 'reserve', points: 7, cost: 7, source: 'photo' },
  { id: 'goblin', name: 'Goblin', banner: 'monster', defeatSwords: 2, defeat: { gold: 1 }, stays: true,
    text: "Don't discard after fighting.", source: 'rulebook' },

  // ----- Dungeon deck: actions and items -----
  { id: 'amuletOfVigor', name: 'Amulet of Vigor', banner: 'dungeon', skill: 4, cost: 7, points: 3, acquire: { heal: 1 },
    source: P },
  { id: 'sleightOfHand', name: 'Sleight of Hand', banner: 'dungeon', cost: 2, discardToDraw: 2,
    text: 'Discard a card to draw two cards.', source: P },
  { id: 'luckyCoin', name: 'Lucky Coin', banner: 'dungeon', skill: 1, clank: 1, draw: 1, cost: 1, points: 1,
    text: '+1 Clank! Draw a card.', source: P },
  { id: 'swagger', name: 'Swagger', banner: 'dungeon', boots: 1, cost: 2, skillPerClank: true,
    text: 'For each Clank! you make this turn, +{skill:1}.', source: P },
  { id: 'tattle', name: 'Tattle', banner: 'dungeon', skill: 2, othersClank: 1, cost: 3,
    text: 'Each other player gets +1 Clank!', source: P },
  { id: 'moveSilently', name: 'Move Silently', banner: 'dungeon', boots: 2, clank: -2, cost: 3, text: '-2 Clank!', source: P },
  { id: 'search', name: 'Search', banner: 'dungeon', skill: 2, boots: 1, goldBonus: 1, cost: 4,
    text: 'Each time you gain gold this turn, increase the amount you gain by {gold:1}.', source: P },
  { id: 'singingSword', name: 'Singing Sword', banner: 'dungeon', skill: 3, swords: 2, clank: 1, cost: 5, points: 2,
    dragonAttack: true, text: '+1 Clank!', source: P },
  { id: 'treasureMap', name: 'Treasure Map', banner: 'dungeon', gold: 5, cost: 6, source: P },
  { id: 'bootsOfSwiftness', name: 'Boots of Swiftness', banner: 'dungeon', boots: 3, cost: 5, points: 3, acquire: { boots: 1 },
    source: P },
  { id: 'wandOfRecall', name: 'Wand of Recall', banner: 'dungeon', skill: 2, ifArtifact: { teleport: 1 }, cost: 5, points: 1,
    text: 'If you have an artifact, teleport to an adjacent room.', source: P },
  { id: 'deadRun', name: 'Dead Run', banner: 'dungeon', boots: 2, clank: 2, noCaveStop: true, cost: 3,
    text: "+2 Clank! You don't have to stop in Crystal Caves this turn.", source: P },
  { id: 'scepterOfTheApeLord', name: 'Scepter of the Ape Lord', banner: 'dungeon', skill: 3, clank: 3, cost: 3, points: 3,
    text: '+3 Clank!', source: P },
  { id: 'silverSpear', name: 'Silver Spear', banner: 'dungeon', swords: 3, cost: 3, points: 2, acquire: { swords: 1 },
    source: P },
  { id: 'flyingCarpet', name: 'Flying Carpet', banner: 'dungeon', boots: 2, noCaveStop: true, ignoreTunnelMonsters: true,
    cost: 6, points: 2, text: "This turn, ignore monsters in tunnels, and you don't have to stop in Crystal Caves.", source: P },
  { id: 'underworldDealing', name: 'Underworld Dealing', banner: 'dungeon', cost: 1,
    choices: [{ label: '1 Gold', gold: 1 }, { label: 'Spend 7 Gold: two Secret Tomes', buyTomes: 2 }],
    source: P },
  { id: 'bracersOfAgility', name: 'Bracers of Agility', banner: 'dungeon', draw: 2, cost: 5, points: 2,
    text: 'Draw two cards.', source: P },
  { id: 'pickaxe', name: 'Pickaxe', banner: 'dungeon', swords: 2, gold: 2, cost: 4, points: 2, dragonAttack: true, source: P },
  { id: 'elvenBoots', name: 'Elven Boots', banner: 'dungeon', skill: 1, boots: 1, draw: 1, cost: 4, points: 2, text: draw, source: P },
  { id: 'wandOfWind', name: 'Wand of Wind', banner: 'dungeon', cost: 6, points: 3,
    choices: [{ label: 'Teleport', teleport: 1 }, { label: 'Take a secret from an adjacent room', adjacentSecret: true }],
    source: P },
  { id: 'sneak', name: 'Sneak', banner: 'dungeon', skill: 1, boots: 1, clank: -2, cost: 2, text: '-2 Clank!', source: P },
  { id: 'elvenCloak', name: 'Elven Cloak', banner: 'dungeon', skill: 1, clank: -2, draw: 1, cost: 4, points: 2,
    text: '-2 Clank! Draw a card.', source: P },
  { id: 'elvenDagger', name: 'Elven Dagger', banner: 'dungeon', skill: 1, swords: 1, draw: 1, cost: 4, points: 2, text: draw, source: P },
  { id: 'brilliance', name: 'Brilliance', banner: 'dungeon', draw: 3, cost: 6, text: 'Draw three cards.', source: P },

  // ----- Dungeon deck: companions -----
  { id: 'monkeyBot', name: 'MonkeyBot 3000', banner: 'dungeon', companion: true, clank: 3, draw: 3, cost: 5, points: 1,
    dragonAttack: true, text: '+3 Clank! Draw three cards.', source: P },
  { id: 'rebelCaptain', name: 'Rebel Captain', banner: 'dungeon', companion: true, skill: 2, ifCompanionDraw: 1, cost: 3, points: 1,
    text: companionDraw, source: P },
  { id: 'rebelScout', name: 'Rebel Scout', banner: 'dungeon', companion: true, boots: 2, ifCompanionDraw: 1, cost: 3, points: 1,
    text: companionDraw, source: P },
  { id: 'rebelSoldier', name: 'Rebel Soldier', banner: 'dungeon', companion: true, swords: 2, ifCompanionDraw: 1, cost: 2, points: 1,
    text: companionDraw, source: P },
  { id: 'rebelMiner', name: 'Rebel Miner', banner: 'dungeon', companion: true, gold: 2, ifCompanionDraw: 1, cost: 2, points: 1,
    text: companionDraw, source: P },
  { id: 'tunnelGuide', name: 'Tunnel Guide', banner: 'dungeon', companion: true, swords: 1, boots: 1, cost: 1, points: 1, source: P },
  { id: 'treasureHunter', name: 'Treasure Hunter', banner: 'dungeon', companion: true, skill: 2, swords: 2, replaceRow: true,
    cost: 3, points: 1, text: 'Replace a card in the dungeon row. (If the new card has a dragon attack symbol, ignore it.)', source: P },
  { id: 'gemCollector', name: 'Gem Collector', banner: 'dungeon', companion: true, skill: 2, clank: -2, gemDiscount: 2, cost: 4,
    points: 2, text: '-2 Clank! Gems cost {skill:2} less this turn.', source: P },
  { id: 'theDuke', name: 'The Duke', banner: 'dungeon', companion: true, skill: 2, swords: 2, cost: 5,
    bonus: { per: 'fiveGold', points: 1 }, text: 'Worth {points:1} for every 5 gold you have.', source: P },
  { id: 'masterBurglar', name: 'Master Burglar', banner: 'dungeon', companion: true, skill: 2, trashBurgle: true, cost: 3, points: 2,
    text: 'Trash a Burgle in your play area or discard pile.', source: P },
  { id: 'clericOfTheSun', name: 'Cleric of the Sun', banner: 'dungeon', companion: true, skill: 2, swords: 1, cost: 3, points: 1,
    acquire: { heal: 1 }, source: P },
  { id: 'wizard', name: 'Wizard', banner: 'dungeon', companion: true, skill: 3, cost: 6,
    bonus: { per: 'secretTome', points: 2 }, text: 'Worth {points:2} for each Secret Tome you have.', source: P },
  { id: 'invoker', name: 'Invoker of the Ancients', banner: 'dungeon', companion: true, clank: 1, teleport: 1, cost: 4, points: 1,
    text: '+1 Clank! Teleport to an adjacent room.', source: P },
  { id: 'archaeologist', name: 'Archaeologist', banner: 'dungeon', companion: true, draw: 1, ifIdol: { skill: 2 }, cost: 2, points: 1,
    text: 'Draw a card. If you have a monkey idol, +{skill:2}.', source: P },
  { id: 'apothecary', name: 'Apothecary', banner: 'dungeon', companion: true, discardToChoose: true, cost: 3, points: 2,
    choices: [{ label: '3 Swords', swords: 3 }, { label: '2 Gold', gold: 2 }, { label: 'Heal 1', heal: 1 }],
    text: 'Discard a card to choose:', source: P },
  { id: 'dwarvenPeddler', name: 'Dwarven Peddler', banner: 'dungeon', companion: true, boots: 1, gold: 2, cost: 4,
    bonus: { per: 'twoTreasures', points: 4 },
    text: 'Worth {points:4} if you have 2 of: chalice, dragon egg, monkey idol.', source: P },
  { id: 'misterWhiskers', name: 'Mister Whiskers', banner: 'dungeon', companion: true, cost: 1, points: 1, dragonAttack: true,
    choices: [{ label: 'The dragon attacks', attack: true }, { label: '-2 Clank!', clank: -2 }],
    source: P },
  { id: 'koboldMerchant', name: 'Kobold Merchant', banner: 'dungeon', companion: true, gold: 2, ifArtifact: { skill: 2 }, cost: 3,
    points: 1, text: 'If you have an artifact, +{skill:2}.', source: P },
  { id: 'mountainKing', name: 'The Mountain King', banner: 'dungeon', companion: true, skill: 2, ifCrown: { swords: 1, boots: 1 },
    cost: 6, points: 3, text: 'If you have a crown, +{sword} and +{boot}.', source: P },
  { id: 'queenOfHearts', name: 'The Queen of Hearts', banner: 'dungeon', companion: true, skill: 3, swords: 1, ifCrown: { heal: 1 },
    cost: 6, points: 3, text: 'If you have a crown, {heart}.', source: P },

  // ----- Dungeon deck: gems -----
  gem('sapphire', 'Sapphire', 4),
  gem('emerald', 'Emerald', 5),
  gem('ruby', 'Ruby', 6),
  gem('diamond', 'Diamond', 8),
  { ...gem('dragonsEye', "Dragon's Eye", 5), points: 0, deep: true, bonus: { per: 'mastery', points: 10 },
    text: 'Deep: buy only in the Depths. Draw a card. Worth {points:10} with a mastery token.' },

  // ----- Dungeon deck: devices (cost = Skill to use) -----
  { id: 'ladder', name: 'Ladder', banner: 'device', cost: 3, use: { boots: 2 }, source: P },
  { id: 'teleporter', name: 'Teleporter', banner: 'device', cost: 4, use: { teleport: 1 }, source: P },
  { id: 'shrine', name: 'Shrine', banner: 'device', cost: 2, arrive: { returnCubes: 3 },
    choices: [{ label: '1 Gold', gold: 1 }, { label: 'Heal 1', heal: 1 }],
    source: P },
  { id: 'dragonShrine', name: 'Dragon Shrine', banner: 'device', cost: 4, danger: true,
    choices: [{ label: '2 Gold', gold: 2 }, { label: 'Trash a card', trash: true }],
    source: P },
  { id: 'theVault', name: 'The Vault', banner: 'device', cost: 3, deep: true, use: { gold: 5, clank: 3 }, dragonAttack: true,
    text: 'Deep (Use only in the Depths.)', source: P },

  // ----- Dungeon deck: monsters -----
  { id: 'orcGrunt', name: 'Orc Grunt', banner: 'monster', defeatSwords: 2, defeat: { gold: 3 }, dragonAttack: true, source: P },
  { id: 'crystalGolem', name: 'Crystal Golem', banner: 'monster', defeatSwords: 3, defeat: { skill: 3 },
    onlyInCrystalCave: true, text: 'Fight this only in a Crystal Cave.', source: P },
  { id: 'kobold', name: 'Kobold', banner: 'monster', defeatSwords: 1, defeat: { skill: 1 }, danger: true, dragonAttack: true,
    source: P },
  { id: 'overlord', name: 'Overlord', banner: 'monster', defeatSwords: 2, defeat: { draw: 2 }, arrive: { allPlayersClank: 1 },
    source: P },
  { id: 'watcher', name: 'Watcher', banner: 'monster', defeatSwords: 3, defeat: { gold: 3, othersClank: 1 },
    arrive: { allPlayersClank: 1 }, source: P },
  { id: 'animatedDoor', name: 'Animated Door', banner: 'monster', defeatSwords: 1, defeat: { boots: 1 }, dragonAttack: true, source: P },
  { id: 'belcher', name: 'Belcher', banner: 'monster', defeatSwords: 2, defeat: { gold: 4, clank: 2 }, dragonAttack: true,
    source: P },
  { id: 'ogre', name: 'Ogre', banner: 'monster', defeatSwords: 3, defeat: { gold: 5 }, dragonAttack: true, source: P },
  { id: 'caveTroll', name: 'Cave Troll', banner: 'monster', defeatSwords: 4, defeat: { gold: 3, draw: 2 }, deep: true,
    dragonAttack: true, text: 'Deep (Fight only in the Depths.)', source: P },
];

export const CARDS: Record<string, CardDef> = Object.fromEntries(defs.map((d) => [d.id, d]));

export const cardDef = (uid: string): CardDef => {
  const def = CARDS[uid.split('#')[0]];
  if (!def) throw new Error(`Unknown card ${uid}`);
  return def;
};

// The real Dungeon deck: 100 cards, counted from the photos
export const DUNGEON_DECK: Record<string, number> = {
  amuletOfVigor: 1, sleightOfHand: 2, luckyCoin: 2, swagger: 2, tattle: 2, moveSilently: 2, search: 2, singingSword: 1,
  treasureMap: 1, bootsOfSwiftness: 1, wandOfRecall: 2, deadRun: 2, scepterOfTheApeLord: 1, silverSpear: 2, flyingCarpet: 1,
  underworldDealing: 1, bracersOfAgility: 2, pickaxe: 2, elvenBoots: 1, wandOfWind: 1, sneak: 2, elvenCloak: 1, elvenDagger: 1,
  brilliance: 1,
  monkeyBot: 1, rebelCaptain: 1, rebelScout: 1, rebelSoldier: 1, rebelMiner: 1, tunnelGuide: 2, treasureHunter: 2,
  gemCollector: 1, theDuke: 1, masterBurglar: 2, clericOfTheSun: 2, wizard: 1, invoker: 1, archaeologist: 2, apothecary: 1,
  dwarvenPeddler: 1, misterWhiskers: 1, koboldMerchant: 1, mountainKing: 1, queenOfHearts: 1,
  sapphire: 3, emerald: 2, ruby: 2, diamond: 1, dragonsEye: 1,
  ladder: 2, teleporter: 2, shrine: 3, dragonShrine: 2, theVault: 1,
  orcGrunt: 3, crystalGolem: 2, kobold: 3, overlord: 2, watcher: 3, animatedDoor: 2, belcher: 2, ogre: 2, caveTroll: 1,
};

export const STARTING_DECK: Record<string, number> = { burgle: 6, stumble: 2, sidestep: 1, scramble: 1 };

export const RESERVE: Record<'mercenary' | 'explore' | 'secretTome', number> = { mercenary: 15, explore: 15, secretTome: 12 };
