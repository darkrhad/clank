import { CARDS, cardDef } from '../engine/cards';
import { available, cardCost, placeProblem } from '../engine/engine';
import { RAGE_TRACK } from '../engine/setup';
import type { GameState, Move } from '../engine/types';
import { Card } from './Card';

interface Props {
  state: GameState;
  dispatch: (move: Move) => void;
  readOnly?: boolean; // an AI is playing: show, but no buttons to press
}

export function DungeonPanel({ state, dispatch, readOnly }: Props) {
  const left = available(state);
  const busy = !!state.pending || state.over || !!readOnly;

  return (
    <section className="panel dungeon-panel">
      <div className="row-header">
        <h3>Dungeon Row <small>({state.dungeonDeck.length} cards left in the deck)</small></h3>
      </div>
      <div className="cards row">
        {state.dungeonRow.map((uid, slot) => {
          if (!uid) return <div key={slot} className="card empty">empty</div>;
          const d = cardDef(uid);
          const monster = d.banner === 'monster';
          const device = d.banner === 'device';
          const need = monster ? d.defeatSwords ?? 0 : device ? d.cost ?? 0 : cardCost(state, d);
          const have = monster ? left.swords : left.skill;
          const blockedHere = placeProblem(state, d);
          const action: Move = monster ? { type: 'fight', slot } : device ? { type: 'useDevice', slot } : { type: 'buy', slot };
          return (
            <Card key={uid} uid={uid} cost={need}>
              <button disabled={busy || have < need || !!blockedHere} title={blockedHere} onClick={() => dispatch(action)}>
                {monster ? 'Fight' : device ? 'Use' : 'Acquire'}
              </button>
            </Card>
          );
        })}
      </div>

      <div className="reserve-and-dragon">
        <div>
          <h3>Reserve</h3>
          <div className="cards row">
            {(['mercenary', 'explore', 'secretTome'] as const).map((pile) => (
              <Card key={pile} id={pile} small>
                <button disabled={busy || !state.reserve[pile].length || left.skill < (CARDS[pile].cost ?? 0)} onClick={() => dispatch({ type: 'buyReserve', pile })}>
                  Acquire ({state.reserve[pile].length})
                </button>
              </Card>
            ))}
            <Card id="goblin" small>
              <button disabled={busy || left.swords < 2} onClick={() => dispatch({ type: 'fightGoblin' })}>Fight</button>
            </Card>
          </div>
        </div>

        <div className="dragon">
          <h3>🐉 The dragon</h3>
          <div className="rage">
            {RAGE_TRACK.map((n, i) => (
              <span key={i} className={i === state.rage ? 'on' : i < state.rage ? 'past' : ''} title={`Rage space ${i + 1}: draws ${n} cubes`}>{n}</span>
            ))}
          </div>
          <p className="small">
            Loảng xoảng! area: {state.players.map((p) => <b key={p.id} className={`c-${p.color}`}>{state.clankArea[p.id]} </b>)}
            <br />
            Bag: {state.bag.black} black{state.players.map((p) => (state.bag[p.id] ? <b key={p.id} className={`c-${p.color}`}> · {state.bag[p.id]}</b> : null))}
          </p>
          {state.countdown && (
            <p className="countdown">Countdown: space {state.countdown.space} of 5</p>
          )}
        </div>
      </div>
    </section>
  );
}
