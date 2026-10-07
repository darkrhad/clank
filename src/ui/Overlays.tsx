import { useEffect, useState } from 'react';
import type { GameState } from '../engine/types';
import { t, type Msg } from '../i18n';
import { Card } from './Card';
import { Cube } from './DragonPanel';
import { PART_FILES } from './parts';
import { TokenIcon, type TokenLike } from './TokenIcon';

// The dragon attack: the screen shakes, then the drawn cubes come out of the bag one by one
export function DragonAttack({ attack, state, onDone }: { attack: Msg; state: GameState; onDone: () => void }) {
  const drawn = String(attack.p?.drawn ?? '').split(',').filter(Boolean);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= drawn.length) {
      const done = setTimeout(onDone, 2600);
      return () => clearTimeout(done);
    }
    const next = setTimeout(() => setShown(shown + 1), shown === 0 ? 900 : 480);
    return () => clearTimeout(next);
  }, [shown, drawn.length, onDone]);
  const hits = state.players.map((p) => ({ p, n: drawn.slice(0, shown).filter((c) => c === p.id).length })).filter((h) => h.n);
  return (
    <div className="overlay dragon-attack" onClick={onDone}>
      <div className="da-flash" />
      <div className="da-box" onClick={(e) => e.stopPropagation()}>
        {PART_FILES.dragon ? <img className="da-dragon" src={PART_FILES.dragon} alt="" /> : <div className="da-dragon">🐉</div>}
        <h2>{t('dragonAttackTitle')}</h2>
        <p>{t('drawsCubes', { n: drawn.length })}</p>
        <div className="da-cubes">
          {drawn.map((c, i) => <span key={i} className={i < shown ? 'out' : 'hidden'}><Cube color={c} big /></span>)}
        </div>
        <div className="da-damage">
          {shown >= drawn.length && !hits.length && <p>{t('noHarm')}</p>}
          {hits.map(({ p, n }) => <p key={p.id} className={`c-${p.color}`}>{t('dmgLine', { player: p.name, n })}</p>)}
        </div>
        <button onClick={onDone}>{t('clickContinue')}</button>
      </div>
    </div>
  );
}

export interface Found { by: string; mine: boolean; tok: TokenLike; name: string; text?: string; note?: string }

// "You found …": shown when a person picks up a secret, a Treasure, an idol, a Market item or the Mastery badge
export function FoundReveal({ found, onDone }: { found: Found; onDone: () => void }) {
  useEffect(() => { const x = setTimeout(onDone, 4200); return () => clearTimeout(x); }, [found, onDone]);
  return (
    <div className="found" onClick={onDone}>
      <TokenIcon tok={found.tok} size={64} />
      <div>
        <small>{found.mine ? t('youFound') : t('foundBy', { player: found.by })}</small>
        <h3>{found.name}</h3>
        {found.text && <p>{found.text}</p>}
        {found.note && <p className="muted small">{found.note}</p>}
      </div>
    </div>
  );
}

// Your discard pile (open information); the deck stays face down
export function DiscardDialog({ state, onClose }: { state: GameState; onClose: () => void }) {
  const me = state.players[state.current];
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="rules-head"><h2>{t('discardTitle')}</h2><button onClick={onClose}>{t('close')}</button></div>
        <p className="muted small">{t('discardNote')}</p>
        <div className="cards">{me.discard.map((uid) => <Card key={uid} uid={uid} small />)}</div>
        {!me.discard.length && <p>{t('emptyPile')}</p>}
        <p className="muted small">{t('deckFaceDown', { n: me.deck.length })}</p>
      </div>
    </div>
  );
}

