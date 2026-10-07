import type { SecretId, Token } from '../engine/types';
import { PART_FILES } from './parts';

// A token as a picture: the painted token images where we have them,
// otherwise a clear symbol in a gold-rimmed circle
const ART: Partial<Record<Token['kind'], string>> = {
  artifact: 'token-artifact', majorSecret: 'token-major', minorSecret: 'token-minor', idol: 'token-idol',
};
const SYMBOL: Partial<Record<Token['kind'], string>> = { masterKey: '🗝️', backpack: '🎒', crown: '👑', mastery: '🏅' };
const SECRET_SYMBOL: Partial<Record<SecretId, string>> = {
  potionGreaterHealing: '🧪', potionHealing: '🧪', potionSwiftness: '🧪', potionStrength: '🧪', chalice: '🏆', dragonEgg: '🥚',
};

export type TokenLike = { kind: Token['kind']; secret?: SecretId; value?: number };

export function TokenIcon({ tok, size = 30 }: { tok: TokenLike; size?: number }) {
  const art = ART[tok.kind] && PART_FILES[ART[tok.kind]!];
  const symbol = tok.kind === 'kept' ? SECRET_SYMBOL[tok.secret!] ?? '📜' : SYMBOL[tok.kind];
  return (
    <span className="token-icon" style={{ width: size, height: size, fontSize: size * 0.55 }}>
      {art ? <img src={art} alt="" /> : <span>{symbol ?? '?'}</span>}
      {tok.value !== undefined && tok.kind !== 'mastery' && <b>{tok.value}</b>}
    </span>
  );
}
