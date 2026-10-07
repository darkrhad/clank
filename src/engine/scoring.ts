import { cardDef } from './cards';
import { SECRETS } from './secrets';
import type { GameState, Player, Token } from './types';

export interface Score {
  player: Player;
  lost: boolean;
  total: number;
  parts: { label: 'artifacts' | 'otherTokens' | 'gold' | 'cards'; points: number }[]; // label: a key, see score.* in i18n
  bestArtifact: number;
}

const tokenPoints = (t: Token): number => {
  switch (t.kind) {
    case 'artifact': return t.value;
    case 'idol': return 5;
    case 'masterKey':
    case 'backpack': return 5;
    case 'crown': return t.value;
    case 'mastery': return 20;
    case 'kept': return SECRETS[t.secret].points ?? 0;
    default: return 0;
  }
};

const allCards = (p: Player) => [...p.deck, ...p.hand, ...p.discard, ...p.playArea];

// A card's points at the end of the game, including "?" points
export function cardPoints(p: Player, uid: string): number {
  const d = cardDef(uid);
  const base = d.points ?? 0;
  if (!d.bonus) return base;
  const kept = (secret: string) => p.tokens.some((t) => t.kind === 'kept' && t.secret === secret);
  switch (d.bonus.per) {
    case 'fiveGold':
      return base + d.bonus.points * Math.floor(p.gold / 5);
    case 'secretTome':
      return base + d.bonus.points * allCards(p).filter((c) => c.startsWith('secretTome#')).length;
    case 'twoTreasures': {
      const have = [kept('chalice'), kept('dragonEgg'), p.tokens.some((t) => t.kind === 'idol')].filter(Boolean).length;
      return base + (have >= 2 ? d.bonus.points : 0);
    }
    case 'mastery':
      return base + (p.tokens.some((t) => t.kind === 'mastery') ? d.bonus.points : 0);
  }
}

export function scorePlayer(p: Player): Score {
  const cards = allCards(p);
  const parts = [
    { label: 'artifacts' as const, points: p.tokens.filter((t) => t.kind === 'artifact').reduce((a, t) => a + tokenPoints(t), 0) },
    { label: 'otherTokens' as const, points: p.tokens.filter((t) => t.kind !== 'artifact').reduce((a, t) => a + tokenPoints(t), 0) },
    { label: 'gold' as const, points: p.gold },
    { label: 'cards' as const, points: cards.reduce((a, c) => a + cardPoints(p, c), 0) },
  ];
  const bestArtifact = Math.max(0, ...p.tokens.map((t) => (t.kind === 'artifact' ? t.value : 0)));
  // Knocked out in the Depths or without an Artifact: no score
  const lost = p.status === 'dead';
  return { player: p, lost, total: lost ? 0 : parts.reduce((a, b) => a + b.points, 0), parts, bestArtifact };
}

// Highest score wins; on a tie, the most valuable Artifact
export function finalScores(s: GameState): { scores: Score[]; winner: Score | null } {
  const scores = s.players.map(scorePlayer).sort((a, b) =>
    Number(a.lost) - Number(b.lost) || b.total - a.total || b.bestArtifact - a.bestArtifact);
  const winner = scores[0] && !scores[0].lost ? scores[0] : null;
  return { scores, winner };
}
