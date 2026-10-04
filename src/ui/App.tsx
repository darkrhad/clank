import { useEffect, useMemo, useState } from 'react';
import { chooseMove, LEVEL_NAME, LEVELS, type Level } from '../ai/bot';
import { applyMove, available, currentPlayer, RuleError, type MoveOption } from '../engine/engine';
import { ROOMS } from '../engine/map';
import { finalScores } from '../engine/scoring';
import { COLORS, createGame, MAX_HEALTH } from '../engine/setup';
import type { GameState, Move } from '../engine/types';
import { Board } from './Board';
import { BotPanel } from './BotPanel';
import { Card } from './Card';
import { DungeonPanel } from './DungeonPanel';
import { PlayerPanel, tokenName } from './PlayerPanel';

const STATUS = { playing: 'in the dungeon', escaped: 'escaped', rescued: 'rescued', dead: 'knocked out' };

// Who plays each seat. Not part of the game state: the rules don't care.
export type Controller = 'human' | Level;
type SeatKind = 'off' | Controller;

const SPEEDS = { slow: 1200, normal: 600, fast: 200 };
type Speed = keyof typeof SPEEDS;

const controllerLabel = (c: Controller) => (c === 'human' ? '' : `🤖 ${LEVEL_NAME[c]}`);

function Setup({ onStart }: { onStart: (names: string[], controllers: Controller[]) => void }) {
  const [seats, setSeats] = useState<{ name: string; kind: SeatKind }[]>([
    { name: 'Player 1', kind: 'human' },
    { name: 'Nicki', kind: 'medium' },
    { name: '', kind: 'off' },
    { name: '', kind: 'off' },
  ]);
  const used = seats.filter((s) => s.kind !== 'off');
  const update = (i: number, change: Partial<{ name: string; kind: SeatKind }>) =>
    setSeats(seats.map((s, j) => (j === i ? { ...s, ...change } : s)));

  return (
    <div className="setup">
      <h1>Clank! <small>demo</small></h1>
      <p>2–4 players. Each seat can be a person or an AI.</p>
      {seats.map((seat, i) => (
        <div key={i} className={`seat pc-${COLORS[i]}`}>
          <select value={seat.kind} onChange={(e) => {
            const kind = e.target.value as SeatKind;
            const name = seat.name || (kind === 'off' ? '' : kind === 'human' ? `Player ${i + 1}` : `Bot ${i + 1}`);
            update(i, { kind, name });
          }}>
            <option value="off">— empty —</option>
            <option value="human">Human</option>
            {LEVELS.map((l) => <option key={l} value={l}>AI: {LEVEL_NAME[l]}</option>)}
          </select>
          <input value={seat.name} disabled={seat.kind === 'off'} placeholder={`Player ${i + 1}`}
            onChange={(e) => update(i, { name: e.target.value })} />
        </div>
      ))}
      <button className="primary" disabled={used.length < 2}
        onClick={() => onStart(used.map((s, i) => s.name.trim() || `Player ${i + 1}`), used.map((s) => s.kind as Controller))}>
        Start game
      </button>
      <ul className="muted small levels">
        <li><b>Easy</b>: knows the goal but plays sloppily. Grabs the nearest Artifact, ignores noise.</li>
        <li><b>Medium</b>: plans routes, picks Artifacts by value and distance, blocks monsters, heals.</li>
        <li><b>Hard</b>: weighs risk: the dragon, its health and time. Leaves early to start the countdown.</li>
      </ul>
      <p className="muted small">
        Learning demo based on the rulebook. The dungeon deck only contains cards shown in the rulebook;
        values marked "assumed" are guesses. All seats AI = watch the bots play.
      </p>
    </div>
  );
}

function GameOver({ state, controllers, onRestart }: { state: GameState; controllers: Controller[]; onRestart: () => void }) {
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
                <td>{s.player.name} <small>{controllerLabel(controllers[state.players.indexOf(s.player)])}</small></td>
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
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [history, setHistory] = useState<GameState[]>([]); // this turn's earlier states, for Undo
  const [error, setError] = useState<string | null>(null);
  const [shownTo, setShownTo] = useState<number | null>(null); // whose hand is visible
  const [swordPrompt, setSwordPrompt] = useState<MoveOption | null>(null);
  const [showTunnels, setShowTunnels] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<Speed>('normal');

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(t);
  }, [error]);

  const controller = state ? controllers[state.current] : 'human';
  const botTurn = !!state && !state.over && controller !== 'human';

  // AI turns: one move at a time, with a pause so people can follow
  useEffect(() => {
    if (!state || !botTurn || paused) return;
    const t = setTimeout(() => {
      const level = controller as Level;
      try {
        setState(applyMove(state, chooseMove(state, level)));
      } catch (e) {
        if (!(e instanceof RuleError)) throw e;
        // A bot should never do this; don't get stuck if it does
        console.warn(`AI (${level}) tried an illegal move: ${e.message}`);
        setState(applyMove(state, state.pending ? { type: 'choose', uid: null } : { type: 'endTurn' }));
      }
      setHistory([]);
    }, SPEEDS[speed]);
    return () => clearTimeout(t);
  }, [state, botTurn, paused, speed, controller]);

  const dispatch = (move: Move) => {
    if (!state || botTurn) return;
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

  const recent = useMemo(() => (state ? state.log.slice(-16).reverse() : []), [state]);

  if (!state) {
    return (
      <Setup onStart={(names, ctrl) => {
        setControllers(ctrl);
        setState(createGame(names));
        setShownTo(ctrl.findIndex((c) => c === 'human'));
        setHistory([]);
        setPaused(false);
      }} />
    );
  }

  const me = currentPlayer(state);
  const humans = controllers.filter((c) => c === 'human').length;
  const hasBots = humans < controllers.length;
  // Pass-the-screen only matters when two or more people share it
  const handHidden = !state.over && !botTurn && humans > 1 && shownTo !== state.current;

  const onMove = (o: MoveOption) => {
    if (botTurn) return;
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
              {controllers[i] !== 'human' && <span className="bot-badge">{controllerLabel(controllers[i])}</span>}
              <span>{STATUS[p.status]}</span>
              <span title="Health">❤ {MAX_HEALTH - p.damage}</span>
              <span title="Gold">🪙 {p.gold}</span>
              <span title="Cubes in the Clank! area">🔔 {state.clankArea[p.id]}</span>
              {p.tokens.filter((t) => t.kind === 'artifact').map((t, j) => <span key={j} className="chip">{tokenName(t)}</span>)}
            </div>
          ))}
        </div>
        {hasBots && (
          <div className="bot-controls">
            <button onClick={() => setPaused(!paused)} title="Pause or resume the AI players">{paused ? '▶ Resume' : '⏸ Pause'}</button>
            <select value={speed} onChange={(e) => setSpeed(e.target.value as Speed)} title="AI speed">
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
          </div>
        )}
        <label className="toggle"><input type="checkbox" checked={showTunnels} onChange={(e) => setShowTunnels(e.target.checked)} /> tunnels</label>
        <button onClick={() => { if (confirm('Quit this game?')) setState(null); }}>Quit</button>
      </header>

      <main>
        <Board
          state={state}
          interactive={!botTurn}
          showTunnels={showTunnels}
          onMove={onMove}
          onTeleport={(room) => dispatch({ type: 'move', to: room, teleport: true })}
        />
        <div className="side">
          {botTurn ? (
            <BotPanel state={state} level={controller as Level} paused={paused} />
          ) : handHidden ? (
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

      {!handHidden && <DungeonPanel state={state} dispatch={dispatch} readOnly={botTurn} />}

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

      {state.pending && !handHidden && !botTurn && (
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

      {state.over && <GameOver state={state} controllers={controllers} onRestart={() => setState(null)} />}
    </div>
  );
}
