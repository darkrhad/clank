import { cardDef } from './cards';
import { SECRETS } from './secrets';
import type { GameState, Player, Token } from './types';

export interface Score {
  player: Player;
  lost: boolean;
  total: number;
  parts: { label: string; points: number }[];
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

export function scorePlayer(p: Player): Score {
  const cards = [...p.deck, ...p.hand, ...p.discard, ...p.playArea];
  const parts = [
    { label: 'Artifacts', points: p.tokens.filter((t) => t.kind === 'artifact').reduce((a, t) => a + tokenPoints(t), 0) },
    { label: 'Other tokens', points: p.tokens.filter((t) => t.kind !== 'artifact').reduce((a, t) => a + tokenPoints(t), 0) },
    { label: 'Gold', points: p.gold },
    { label: 'Cards', points: cards.reduce((a, c) => a + (cardDef(c).points ?? 0), 0) },
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
