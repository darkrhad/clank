import { available, canEndTurn, currentPlayer, hasArtifact, isExhausted } from '../engine/engine';
import { ROOMS } from '../engine/map';
import { SECRETS } from '../engine/secrets';
import { format, secretName, secretText, t, type Key } from '../i18n';
import { MARKET_PRICE, MAX_HEALTH } from '../engine/setup';
import type { GameState, Move, Token } from '../engine/types';
import { Card } from './Card';
import { Boot, Gold, Heart, Skill, Sword } from './Symbols';
import { TokenIcon } from './TokenIcon';

// A token's name in the current language, e.g. "Crown (9)"
export function tokenName(tok: Token): string {
  if (tok.kind === 'kept') return secretName(tok.secret);
  return t(`token.${tok.kind}` as Key, 'value' in tok ? { value: tok.value } : {});
}

interface Props {
  state: GameState;
  dispatch: (move: Move) => void;
  canUndo: boolean;
  onUndo: () => void;
  onShowDiscard: () => void;
}

export function PlayerPanel({ state, dispatch, canUndo, onUndo, onShowDiscard }: Props) {
  const me = currentPlayer(state);
  const left = available(state);
  const room = ROOMS[me.room];
  const roomTokens = state.roomTokens[me.room] ?? [];
  const end = canEndTurn(state);

  return (
    <section className={`panel player-panel pc-${me.color}`}>
      <header>
        <h2>{t('turnOf', { player: me.name })}</h2>
        <span className="where">
          {t(`roomType.${room.type}` as Key)}{room.depths ? t('depthsTag') : ''}{isExhausted(state) ? t('exhaustedTag') : ''}
        </span>
      </header>

      <div className="resources">
        <span title={t('skillTitle')}><Skill n={left.skill} /></span>
        <span title={t('swordsTitle')}><Sword /> {left.swords}</span>
        <span title={t('bootsTitle')}><Boot /> {isExhausted(state) ? 0 : left.boots}</span>
        <span title={t('gold')}><Gold n={me.gold} /></span>
        <span title={t('damageTitle')}><Heart /> {MAX_HEALTH - me.damage}/{MAX_HEALTH}</span>
        <span title={t('clankYours')}>🔔 {state.clankArea[me.id]} <small>{t('cubesLeft', { n: me.supply })}</small></span>
        {state.turn.teleports ? <span title={t('teleportsTitle')}>🌀 {state.turn.teleports}</span> : null}
      </div>

      <h3>{t('hand')} <small>{t('clickToPlay')}</small></h3>
      <div className="cards">
        {me.hand.map((uid) => (
          <Card key={uid} uid={uid} onClick={() => dispatch({ type: 'play', uid })} disabled={!!state.pending} />
        ))}
        {!me.hand.length && <p className="muted">{t('allPlayed')}</p>}
      </div>

      {me.playArea.length > 0 && (
        <>
          <h3>{t('playedThisTurn')}</h3>
          <div className="cards">{me.playArea.map((uid) => <Card key={uid} uid={uid} small />)}</div>
        </>
      )}

      {roomTokens.length > 0 && (
        <>
          <h3>{t('inThisRoom')} {state.turn.canTakeToken ? '' : <small>{t('comeBack')}</small>}</h3>
          <div className="buttons">
            {roomTokens.map((tok, i) => (
              <button key={i} disabled={!state.turn.canTakeToken} onClick={() => dispatch({ type: 'takeToken', index: i })}>
                <TokenIcon tok={tok} size={22} /> {t('take', { token: tokenName(tok) })}
              </button>
            ))}
          </div>
          {roomTokens.some((t) => t.kind === 'artifact') && hasArtifact(me) && (
            <p className="muted">{t('alreadyArtifact')}</p>
          )}
        </>
      )}

      {room.type === 'market' && (
        <>
          <h3>{t('market')} <small>{t('goldEach', { n: MARKET_PRICE })}</small></h3>
          {/* What each item does, how many are left, and Buy (or why you can't yet) */}
          <div className="token-list">
            {([
              { item: 'masterKey', left: state.market.masterKey, what: t('masterKeyWhat') },
              { item: 'backpack', left: state.market.backpack, what: t('backpackWhat') },
              { item: 'crown', left: state.market.crowns.length, what: t('crownWhat', { n: state.market.crowns[0] ?? 0 }), value: state.market.crowns[0] },
            ] as const).map(({ item, left, what, ...rest }) => {
              const value = 'value' in rest ? rest.value : undefined;
              const short = me.gold < MARKET_PRICE;
              return (
                <div key={item} className="token-item">
                  <TokenIcon tok={{ kind: item, value }} size={30} />
                  <div className="token-info">
                    <b>{t(item)} <small>{t('leftN', { n: left })}</small></b>
                    <small>{what}</small>
                    {short && left > 0 && <small className="need">{t('needGold', { n: MARKET_PRICE, have: me.gold })}</small>}
                  </div>
                  <button disabled={short || !left || !!state.pending} onClick={() => dispatch({ type: 'buyMarket', item })}>
                    {left ? t('buyFor', { n: MARKET_PRICE }) : t('soldOut')}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {me.tokens.length > 0 && (
        <>
          <h3>{t('yourTokens')}</h3>
          {/* Each token with what it does, so you know before using it */}
          <div className="token-list">
            {me.tokens.map((tok, i) => {
              const usable = tok.kind === 'kept' && (SECRETS[tok.secret].heal || SECRETS[tok.secret].boots || SECRETS[tok.secret].swords);
              return (
                <div key={i} className="token-item">
                  <TokenIcon tok={tok} size={30} />
                  <div className="token-info">
                    <b>{tokenName(tok)}</b>
                    {tok.kind === 'kept' && <small>{secretText(tok.secret)}</small>}
                  </div>
                  {usable && <button onClick={() => dispatch({ type: 'useToken', index: i })} disabled={!!state.pending}>{t('useBtn')}</button>}
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="actions">
        <button onClick={() => dispatch({ type: 'playAll' })} disabled={!me.hand.length || !!state.pending}>{t('playAll')}</button>
        <button onClick={onUndo} disabled={!canUndo}>{t('undo')}</button>
        <button className="primary" onClick={() => dispatch({ type: 'endTurn' })} disabled={!end.ok} title={end.reason && format(end.reason)}>
          {t('endTurn')}
        </button>
      </div>
      <p className="muted small deck-line">
        {t('deckFaceDown', { n: me.deck.length })}
        <button className="discard-btn" onClick={onShowDiscard}>{t('discardBtn', { n: me.discard.length })}</button>
      </p>
    </section>
  );
}
