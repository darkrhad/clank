import { available, canEndTurn, currentPlayer, hasArtifact } from '../engine/engine';
import { ROOMS } from '../engine/map';
import { SECRETS } from '../engine/secrets';
import { MARKET_PRICE, MAX_HEALTH } from '../engine/setup';
import type { GameState, Move, Token } from '../engine/types';
import { Card } from './Card';

export function tokenName(t: Token): string {
  switch (t.kind) {
    case 'artifact': return `Artifact ${t.value}`;
    case 'idol': return 'Monkey Idol (5)';
    case 'majorSecret': return 'Major Secret';
    case 'minorSecret': return 'Minor Secret';
    case 'masterKey': return 'Master Key (5)';
    case 'backpack': return 'Backpack (5)';
    case 'crown': return `Crown (${t.value})`;
    case 'mastery': return 'Mastery (20)';
    case 'kept': return SECRETS[t.secret].name;
  }
}

const ROOM_TYPE = { entrance: 'Outside', room: 'Room', cave: 'Crystal Cave', market: 'Market', fountain: 'Fountain', shrine: 'Monkey Shrine' };

interface Props {
  state: GameState;
  dispatch: (move: Move) => void;
  canUndo: boolean;
  onUndo: () => void;
}

export function PlayerPanel({ state, dispatch, canUndo, onUndo }: Props) {
  const me = currentPlayer(state);
  const left = available(state);
  const room = ROOMS[me.room];
  const roomTokens = state.roomTokens[me.room] ?? [];
  const end = canEndTurn(state);

  return (
    <section className={`panel player-panel pc-${me.color}`}>
      <header>
        <h2>{me.name}'s turn</h2>
        <span className="where">
          {ROOM_TYPE[room.type]}{room.depths ? ' · Depths' : ''}{state.turn.exhausted ? ' · exhausted' : ''}
        </span>
      </header>

      <div className="resources">
        <span title="Skill: buy cards">◆ {left.skill}</span>
        <span title="Swords: fight monsters, block tunnel damage">🗡️ {left.swords}</span>
        <span title="Boots: move through tunnels">👢 {state.turn.exhausted ? 0 : left.boots}</span>
        <span title="Gold">🪙 {me.gold}</span>
        <span title="Damage on your health meter">❤ {MAX_HEALTH - me.damage}/{MAX_HEALTH}</span>
        <span title="Your cubes in the Clank! area / in your supply">🔔 {state.clankArea[me.id]} <small>({me.supply} left)</small></span>
        {state.turn.teleports ? <span title="Teleports">🌀 {state.turn.teleports}</span> : null}
      </div>

      <h3>Hand <small>(click to play)</small></h3>
      <div className="cards">
        {me.hand.map((uid) => (
          <Card key={uid} uid={uid} onClick={() => dispatch({ type: 'play', uid })} disabled={!!state.pending} />
        ))}
        {!me.hand.length && <p className="muted">All cards played.</p>}
      </div>

      {me.playArea.length > 0 && (
        <>
          <h3>Played this turn</h3>
          <div className="cards">{me.playArea.map((uid) => <Card key={uid} uid={uid} small />)}</div>
        </>
      )}

      {roomTokens.length > 0 && (
        <>
          <h3>In this room {state.turn.canTakeToken ? '' : <small>(leave and come back to take another)</small>}</h3>
          <div className="buttons">
            {roomTokens.map((t, i) => (
              <button key={i} disabled={!state.turn.canTakeToken} onClick={() => dispatch({ type: 'takeToken', index: i })}>
                Take {tokenName(t)}
              </button>
            ))}
          </div>
          {roomTokens.some((t) => t.kind === 'artifact') && hasArtifact(me) && (
            <p className="muted">You already carry an Artifact.</p>
          )}
        </>
      )}

      {room.type === 'market' && (
        <>
          <h3>Market <small>({MARKET_PRICE} Gold each)</small></h3>
          <div className="buttons">
            <button disabled={me.gold < MARKET_PRICE || !state.market.masterKey} onClick={() => dispatch({ type: 'buyMarket', item: 'masterKey' })}>
              Master Key ({state.market.masterKey})
            </button>
            <button disabled={me.gold < MARKET_PRICE || !state.market.backpack} onClick={() => dispatch({ type: 'buyMarket', item: 'backpack' })}>
              Backpack ({state.market.backpack})
            </button>
            <button disabled={me.gold < MARKET_PRICE || !state.market.crowns.length} onClick={() => dispatch({ type: 'buyMarket', item: 'crown' })}>
              Crown {state.market.crowns[0] ? `(${state.market.crowns[0]})` : '(none)'}
            </button>
          </div>
        </>
      )}

      {me.tokens.length > 0 && (
        <>
          <h3>Your tokens</h3>
          <div className="buttons">
            {me.tokens.map((t, i) => {
              const usable = t.kind === 'kept' && (SECRETS[t.secret].heal || SECRETS[t.secret].boots || SECRETS[t.secret].swords);
              return usable
                ? <button key={i} onClick={() => dispatch({ type: 'useToken', index: i })} title={SECRETS[t.secret].text}>Use {tokenName(t)}</button>
                : <span key={i} className="chip">{tokenName(t)}</span>;
            })}
          </div>
        </>
      )}

      <div className="actions">
        <button onClick={() => dispatch({ type: 'playAll' })} disabled={!me.hand.length || !!state.pending}>Play all</button>
        <button onClick={onUndo} disabled={!canUndo}>Undo</button>
        <button className="primary" onClick={() => dispatch({ type: 'endTurn' })} disabled={!end.ok} title={end.reason}>
          End turn
        </button>
      </div>
      <p className="muted small">
        Deck {me.deck.length} · Discard {me.discard.length}
      </p>
    </section>
  );
}
