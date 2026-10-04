import type { SecretId } from './types';

export interface SecretDef {
  name: string;
  text: string;
  keep?: boolean; // stays with the player (usable potion or end-game points)
  points?: number;
  // Immediate effects when revealed
  skill?: number;
  gold?: number;
  draw?: number;
  rage?: number;
  trash?: number;
  // Effects when a kept potion is used
  heal?: number;
  boots?: number;
  swords?: number;
}

export const SECRETS: Record<SecretId, SecretDef> = {
  potionGreaterHealing: { name: 'Potion of Greater Healing', text: 'Use during your turn to heal 2 damage.', keep: true, heal: 2 },
  greaterSkillBoost: { name: 'Greater Skill Boost', text: 'Gain 5 Skill.', skill: 5 },
  greaterTreasure: { name: 'Greater Treasure', text: 'Counts as 5 Gold.', gold: 5 },
  flashOfBrilliance: { name: 'Flash of Brilliance', text: 'Draw three cards.', draw: 3 },
  chalice: { name: 'Chalice', text: 'Worth 7 points at the end of the game.', keep: true, points: 7 },

  potionHealing: { name: 'Potion of Healing', text: 'Use during your turn to heal 1 damage.', keep: true, heal: 1 },
  potionSwiftness: { name: 'Potion of Swiftness', text: 'Use during your turn to gain 1 Boot.', keep: true, boots: 1 },
  potionStrength: { name: 'Potion of Strength', text: 'Use during your turn to gain 2 Swords.', keep: true, swords: 2 },
  skillBoost: { name: 'Skill Boost', text: 'Gain 2 Skill.', skill: 2 },
  treasure: { name: 'Treasure', text: 'Counts as 2 Gold.', gold: 2 },
  magicSpring: { name: 'Magic Spring', text: 'At the end of this turn, trash a card from your discard pile or play area.', trash: 1 },
  dragonEgg: { name: 'Dragon Egg', text: 'Worth 3 points. The dragon gets angrier.', keep: true, points: 3, rage: 1 },
};

// The rulebook gives the totals (11 major, 18 minor) but not the mix: assumed
export const MAJOR_SECRETS: Partial<Record<SecretId, number>> = {
  potionGreaterHealing: 3, greaterSkillBoost: 2, greaterTreasure: 3, flashOfBrilliance: 2, chalice: 1,
};
export const MINOR_SECRETS: Partial<Record<SecretId, number>> = {
  potionHealing: 3, potionSwiftness: 3, potionStrength: 2, skillBoost: 3, treasure: 3, magicSpring: 1, dragonEgg: 3,
};
