import { useEffect, useMemo, useState } from 'react';
import { applyMove, available, currentPlayer, RuleError, type MoveOption } from '../engine/engine';
import { ROOMS } from '../engine/map';
import { finalScores } from '../engine/scoring';
import { createGame, MAX_HEALTH } from '../engine/setup';
import type { GameState, Move } from '../engine/types';
import { Board } from './Board';
import { Card } from './Card';
import { DungeonPanel } from './DungeonPanel';
import { PlayerPanel, tokenName } from './PlayerPanel';

const STATUS = { playing: 'in the dungeon', escaped: 'escaped', rescued: 'rescued', dead: 'knocked out' };

function Setup({ onStart }: { onStart: (names: string[]) => void }) {
  const [names, setNames] = useState(['Red', 'Yellow', '', '']);
  const chosen = names.map((n) => n.trim()).filter(Boolean);
  return (
    <div className="setup">
      <h1>Clank! <small>demo</small></h1>
      <p>2–4 players at one screen. Names (leave empty to skip):</p>
      {names.map((n, i) => (
        <input key={i} value={n} placeholder={`Player ${i + 1}`} className={`pc-${['red', 'yellow', 'green', 'blue'][i]}`}
          onChange={(e) => setNames(names.map((x, j) => (j === i ? e.target.value : x)))} />
      ))}
      <button className="primary" disabled={chosen.length < 2} onClick={() => onStart(chosen)}>Start game</button>
      <p className="muted small">
        Private learning demo based on the rulebook. The dungeon deck only contains cards shown in the rulebook;
        values marked "assumed" are guesses.
      </p>
    </div>
  );
}

function GameOver({ state, onRestart }: { state: GameState; onRestart: () => void }) {
  const { scores, winner } = finalScores(state);
  return (
    <div className="overlay">
      <div className="modal">
        <h2>{winner ? `🏆 ${winner.player.name} is the Greatest Thief in the Realm!` : 'Nobody made it out…'}</h2>
        <table>
          <thead><tr><th>Player</th><th>Status</th>{scores[0].parts.map((p) => <th key={p.label}>{p.label}</th>)}<th>Total</th></tr></thead>
          <tbody>
            {scores.map((s) => (
              <tr key={s.player.id} className={`pc-${s.player.color}`}>
                <td>{s.player.name}</td>
                <td>{STATUS[s.player.status]}</td>
                {s.parts.map((p) => <td key={p.label}>{s.lost ? '–' : p.points}</td>)}
                <td><b>{s.lost ? 'lost' : s.total}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="primary" onClick={onRestart}>New game</button>
      </div>
    </div>
  );
}

export default function App() {
  const [state, setState] = useState<GameState | null>(null);
  const [history, setHistory] = useState<GameState[]>([]); // this turn's earlier states, for Undo
  const [error, setError] = useState<string | null>(null);
  const [shownTo, setShownTo] = useState<number | null>(null); // whose hand is visible
  const [swordPrompt, setSwordPrompt] = useState<MoveOption | null>(null);
  const [showTunnels, setShowTunnels] = useState(false);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(t);
  }, [error]);

  const dispatch = (move: Move) => {
    if (!state) return;
    try {
      const next = applyMove(state, move);
      // Undo only within a turn: once the turn passes, new cards were drawn
      setHistory(next.current === state.current && !next.over ? [...history, state] : []);
      setState(next);
      setError(null);
    } catch (e) {
      if (e instanceof RuleError) setError(e.message);
      else throw e;
    }
  };

  const undo = () => {
    setState(history[history.length - 1]);
    setHistory(history.slice(0, -1));
  };

  const recent = useMemo(() => (state ? state.log.slice(-14).reverse() : []), [state]);

  if (!state) {
    return <Setup onStart={(names) => { setState(createGame(names)); setShownTo(0); setHistory([]); }} />;
  }

  const me = currentPlayer(state);
  const handHidden = !state.over && shownTo !== state.current;

  const onMove = (o: MoveOption) => {
    // Ask how many Swords to use when there is a choice
    if (o.monsters && available(state).swords > o.minSwords) setSwordPrompt(o);
    else dispatch({ type: 'move', to: o.to, swords: o.minSwords });
  };

  return (
    <div className="game">
      <header className="topbar">
        <h1>Clank! <small>demo</small></h1>
        <div className="players">
          {state.players.map((p, i) => (
            <div key={p.id} className={`player-chip pc-${p.color}${i === state.current ? ' current' : ''}`}>
              <b>{p.name}</b>
              <span>{STATUS[p.status]}</span>
              <span title="Health">❤ {MAX_HEALTH - p.damage}</span>
              <span title="Gold">🪙 {p.gold}</span>
              <span title="Cubes in the Clank! area">🔔 {state.clankArea[p.id]}</span>
              {p.tokens.filter((t) => t.kind === 'artifact').map((t, j) => <span key={j} className="chip">{tokenName(t)}</span>)}
            </div>
          ))}
        </div>
        <label className="toggle"><input type="checkbox" checked={showTunnels} onChange={(e) => setShowTunnels(e.target.checked)} /> tunnels</label>
        <button onClick={() => { if (confirm('Quit this game?')) setState(null); }}>Quit</button>
      </header>

      <main>
        <Board
          state={state}
          showTunnels={showTunnels}
          onMove={onMove}
          onTeleport={(room) => dispatch({ type: 'move', to: room, teleport: true })}
        />
        <div className="side">
          {handHidden ? (
            <section className={`panel handoff pc-${me.color}`}>
              <h2>{me.name}'s turn</h2>
              <p>Pass the screen to {me.name}.</p>
              <button className="primary" onClick={() => setShownTo(state.current)}>Show my hand</button>
            </section>
          ) : (
            <PlayerPanel state={state} dispatch={dispatch} canUndo={history.length > 0} onUndo={undo} />
          )}
          <section className="panel log">
            <h3>What happened</h3>
            <ul>{recent.map((l, i) => <li key={i}>{l}</li>)}</ul>
          </section>
        </div>
      </main>

      {!handHidden && <DungeonPanel state={state} dispatch={dispatch} />}

      {error && <div className="toast" onClick={() => setError(null)}>{error}</div>}

      {swordPrompt && (
        <div className="overlay" onClick={() => setSwordPrompt(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Monster tunnel: {swordPrompt.monsters} damage</h3>
            <p>Each Sword you use blocks 1 damage. You have {available(state).swords} Swords.</p>
            <div className="buttons">
              {Array.from({ length: Math.min(swordPrompt.monsters, available(state).swords) - swordPrompt.minSwords + 1 }, (_, i) => i + swordPrompt.minSwords).map((n) => (
                <button key={n} onClick={() => { dispatch({ type: 'move', to: swordPrompt.to, swords: n }); setSwordPrompt(null); }}>
                  Use {n} Sword{n === 1 ? '' : 's'} → take {swordPrompt.monsters - n} damage
                </button>
              ))}
            </div>
            <p className="muted small">Going to: {ROOMS[swordPrompt.to].type} ({swordPrompt.to})</p>
          </div>
        </div>
      )}

      {state.pending && !handHidden && (
        <div className="overlay">
          <div className="modal">
            {state.pending.kind === 'discardToDraw' ? (
              <>
                <h3>Discard a card to draw {state.pending.draw}</h3>
                <p>The discarded card has no effect.</p>
                <div className="cards">
                  {me.hand.map((uid) => <Card key={uid} uid={uid} small onClick={() => dispatch({ type: 'choose', uid })} />)}
                </div>
                <button onClick={() => dispatch({ type: 'choose', uid: null })}>Don't discard</button>
              </>
            ) : (
              <>
                <h3>Magic Spring: trash a card</h3>
                <p>It leaves your deck for good. Good for Stumbles!</p>
                <div className="cards">
                  {[...me.playArea, ...me.discard].map((uid) => (
                    <Card key={uid} uid={uid} small onClick={() => dispatch({ type: 'choose', uid })} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {state.over && <GameOver state={state} onRestart={() => setState(null)} />}
    </div>
  );
}
