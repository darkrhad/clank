import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { getAudio, LOG_SOUND, play, setMusic, setMusicScene, setSfx, subscribeAudio, unlock } from './audio';
import { chooseMove, LEVELS, type Level } from '../ai/bot';
import { applyMove, available, currentPlayer, RuleError, skipMove, type MoveOption } from '../engine/engine';
import { finalScores } from '../engine/scoring';
import { COLORS, createGame, MAX_HEALTH } from '../engine/setup';
import type { GameState, Move } from '../engine/types';
import { Board } from './Board';
import { BotPanel } from './BotPanel';
import { DungeonPanel } from './DungeonPanel';
import { PendingDialog } from './PendingDialog';
import { RulesDialog } from './Rules';
import { DragonPanel } from './DragonPanel';
import { DiscardDialog, DragonAttack, FoundReveal, type Found } from './Overlays';
import { SECRETS } from '../engine/secrets';
import type { SecretId, Token } from '../engine/types';
import { Gold, Heart } from './Symbols';
import { PlayerPanel, tokenName } from './PlayerPanel';
import { cardName, format, LANGS, roomName, secretName, secretText, setLang, t, type Key, type Msg } from '../i18n';
import { useLang } from './useLang';
import { ART_STYLES, setArtStyle, useArtStyle } from './artStyle';

const status = (s: GameState['players'][number]['status']) => t(`status.${s}` as Key);

// Who plays each seat. Not part of the game state: the rules don't care.
export type Controller = 'human' | Level;
type SeatKind = 'off' | Controller;

const SPEEDS = { slow: 1200, normal: 600, fast: 200 };
type Speed = keyof typeof SPEEDS;

const levelName = (l: Level) => t(`level.${l}` as Key);
const controllerLabel = (c: Controller) => (c === 'human' ? '' : `🤖 ${levelName(c)}`);

// Music and effects on/off (remembered)
export function AudioButtons() {
  const a = useSyncExternalStore(subscribeAudio, getAudio, getAudio);
  return (
    <div className="audio-buttons">
      <button className={a.music ? 'on' : ''} aria-pressed={a.music} title={t('musicTitle')} onClick={() => setMusic(!a.music)}>♪</button>
      <button className={a.sfx ? 'on' : ''} aria-pressed={a.sfx} title={t('sfxTitle')} onClick={() => setSfx(!a.sfx)}>🔔</button>
    </div>
  );
}

// EN | VI: switches every text at once, also in the middle of a game
export function LangSwitch() {
  const lang = useLang();
  return (
    <div className="lang-switch" role="group" aria-label={t('language')}>
      {LANGS.map((l) => (
        <button key={l} className={l === lang ? 'on' : ''} aria-pressed={l === lang} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}

// Fantasy | Viet: which card art to show, whatever the language
export function ArtSwitch() {
  const style = useArtStyle();
  return (
    <div className="lang-switch" role="group" aria-label={t('artStyle')} title={t('artStyle')}>
      {ART_STYLES.map((s) => (
        <button key={s} className={s === style ? 'on' : ''} aria-pressed={s === style} onClick={() => setArtStyle(s)}>{t(s === 'viet' ? 'artViet' : 'artFantasy')}</button>
      ))}
    </div>
  );
}

function Setup({ onStart }: { onStart: (names: string[], controllers: Controller[]) => void }) {
  const [rules, setRules] = useState(false);
  const [seats, setSeats] = useState<{ name: string; kind: SeatKind }[]>(() => [
    { name: t('playerN', { n: 1 }), kind: 'human' },
    { name: 'Nicki', kind: 'medium' },
    { name: '', kind: 'off' },
    { name: '', kind: 'off' },
  ]);
  const used = seats.filter((s) => s.kind !== 'off');
  const update = (i: number, change: Partial<{ name: string; kind: SeatKind }>) =>
    setSeats(seats.map((s, j) => (j === i ? { ...s, ...change } : s)));

  return (
    <div className="setup-screen">
    <div className="setup">
      <div className="setup-head">
        <h1>Loảng xoảng! <small>demo</small></h1>
        <div className="head-buttons"><button onClick={() => setRules(true)}>{t('rules')}</button><AudioButtons /><LangSwitch /></div>
      </div>
      <p>{t('subtitle')}</p>
      {seats.map((seat, i) => (
        <div key={i} className={`seat pc-${COLORS[i]}`}>
          <select value={seat.kind} onChange={(e) => {
            const kind = e.target.value as SeatKind;
            const name = seat.name || (kind === 'off' ? '' : kind === 'human' ? t('playerN', { n: i + 1 }) : t('botN', { n: i + 1 }));
            update(i, { kind, name });
          }}>
            <option value="off">{t('seatEmpty')}</option>
            <option value="human">{t('seatHuman')}</option>
            {LEVELS.map((l) => <option key={l} value={l}>{t('seatAi', { level: levelName(l) })}</option>)}
          </select>
          <input value={seat.name} disabled={seat.kind === 'off'} placeholder={t('playerN', { n: i + 1 })}
            onChange={(e) => update(i, { name: e.target.value })} />
        </div>
      ))}
      <button className="primary" disabled={used.length < 2}
        onClick={() => onStart(used.map((s, i) => s.name.trim() || t('playerN', { n: i + 1 })), used.map((s) => s.kind as Controller))}>
        {t('startGame')}
      </button>
      <p className="small"><a href="#studio" style={{ color: 'var(--accent)' }}>{t('studioLink')}</a>{t('studioDesc')}</p>
      <ul className="muted small levels">
        <li><b>{levelName('easy')}</b>: {t('levelEasyDesc')}</li>
        <li><b>{levelName('medium')}</b>: {t('levelMediumDesc')}</li>
        <li><b>{levelName('hard')}</b>: {t('levelHardDesc')}</li>
      </ul>
      <p className="muted small">{t('demoNote')}</p>
      <p className="credits">Made by ama coffee studio ☕️🇻🇳 🇷🇸</p>
    </div>
    {/* Outside the panel: its backdrop blur would trap the full-screen window inside it */}
    {rules && <RulesDialog onClose={() => setRules(false)} />}
    </div>
  );
}

function GameOver({ state, controllers, onRestart }: { state: GameState; controllers: Controller[]; onRestart: () => void }) {
  const { scores, winner } = finalScores(state);
  return (
    <div className="overlay">
      <div className="modal">
        <h2>{winner ? t('winner', { player: winner.player.name }) : t('nobodyOut')}</h2>
        <table>
          <thead><tr><th>{t('thPlayer')}</th><th>{t('thStatus')}</th>{scores[0].parts.map((p) => <th key={p.label}>{t(`score.${p.label}`)}</th>)}<th>{t('thTotal')}</th></tr></thead>
          <tbody>
            {scores.map((s) => (
              <tr key={s.player.id} className={`pc-${s.player.color}`}>
                <td>{s.player.name} <small>{controllerLabel(controllers[state.players.indexOf(s.player)])}</small></td>
                <td>{status(s.player.status)}</td>
                {s.parts.map((p) => <td key={p.label}>{s.lost ? '–' : p.points}</td>)}
                <td><b>{s.lost ? t('lost') : s.total}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="primary" onClick={onRestart}>{t('newGame')}</button>
      </div>
    </div>
  );
}

export default function App() {
  const [state, setState] = useState<GameState | null>(null);
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [history, setHistory] = useState<GameState[]>([]); // this turn's earlier states, for Undo
  const [error, setError] = useState<Msg | null>(null);
  const [shownTo, setShownTo] = useState<number | null>(null); // whose hand is visible
  const [swordPrompt, setSwordPrompt] = useState<MoveOption | null>(null);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<Speed>('normal');
  const [rules, setRules] = useState(false);
  const [dragonShow, setDragonShow] = useState<Msg | null>(null); // the dragon attack being shown
  const [found, setFound] = useState<Found[]>([]); // "you found …" popups, one after another
  const [notice, setNotice] = useState<string | null>(null); // short info line, e.g. where a bought card went
  const [showDiscard, setShowDiscard] = useState(false);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(t);
  }, [error]);

  // Menu music on the start menu, game music in a game
  const playing = !!state;
  useEffect(() => { setMusicScene(playing ? 'game' : 'menu'); }, [playing]);

  // Browsers only allow sound after a click: start the audio on the first one
  useEffect(() => {
    const first = () => unlock();
    window.addEventListener('pointerdown', first, { once: true });
    return () => window.removeEventListener('pointerdown', first);
  }, []);

  // Sounds for what just happened: new log lines, cards played, new Loảng xoảng! cubes
  const prev = useRef<GameState | null>(null);
  useEffect(() => {
    const before = prev.current;
    prev.current = state;
    if (!state || !before || before.players.length !== state.players.length) return;
    const fresh = state.log.slice(before.log.length);
    fresh.slice(-3).forEach((m, i) => { const s = LOG_SOUND[m.k]; if (s) play(s, i * 0.12); });

    // What people (not the AI) should see: the dragon attack, what they found, where a bought card went
    const human = (name: unknown) => {
      const i = state.players.findIndex((p) => p.name === name);
      return i >= 0 && controllers[i] === 'human';
    };
    const finds: Found[] = [];
    for (const m of fresh) {
      const p = m.p ?? {};
      if (m.k === 'dragonAttack') setDragonShow(m);
      if (!human(p.player)) continue;
      const by = String(p.player), mine = true;
      if (m.k === 'findsSecret') {
        const id = p.secret as SecretId, keep = SECRETS[id].keep;
        finds.push({ by, mine, tok: { kind: keep ? 'kept' : p.major ? 'majorSecret' : 'minorSecret', secret: id }, name: secretName(id), text: secretText(id), note: keep ? t('keptNote') : undefined });
      } else if (m.k === 'takesArtifact') {
        finds.push({ by, mine, tok: { kind: 'artifact', value: Number(p.value) }, name: t('token.artifact', { value: p.value }) });
      } else if (m.k === 'takesToken' || m.k === 'buys') {
        const kind = String(p.token ?? p.item) as Token['kind'];
        finds.push({ by, mine, tok: { kind }, name: kind === 'idol' ? t('tokenName.idol') : t(`${kind}` as Key) });
      } else if (m.k === 'escapes') {
        finds.push({ by, mine, tok: { kind: 'mastery' }, name: t('token.mastery'), note: t('masteryNote') });
      } else if (m.k === 'acquires') {
        setNotice(t('toDiscard', { card: cardName(String(p.card)) }));
      }
    }
    if (finds.length) setFound((q) => [...q, ...finds]);
    const played = state.players.reduce((n, p) => n + p.playArea.length, 0) - before.players.reduce((n, p) => n + p.playArea.length, 0);
    if (played > 0) play('card');
    const cubes = (g: GameState) => Object.values(g.clankArea).reduce((a, b) => a + b, 0);
    if (cubes(state) > cubes(before)) play('clank', 0.05);
  }, [state]);

  useEffect(() => { if (error) play('nope'); }, [error]);
  useEffect(() => {
    if (!notice) return;
    const x = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(x);
  }, [notice]);

  const controller = state ? controllers[state.current] : 'human';
  const botTurn = !!state && !state.over && controller !== 'human';

  // AI turns: one move at a time, with a pause so people can follow
  useEffect(() => {
    if (!state || !botTurn || paused || dragonShow) return; // wait while the dragon attack is shown
    const t = setTimeout(() => {
      const level = controller as Level;
      try {
        setState(applyMove(state, chooseMove(state, level)));
      } catch (e) {
        if (!(e instanceof RuleError)) throw e;
        // A bot should never do this; don't get stuck if it does
        console.warn(`AI (${level}) tried an illegal move: ${e.message}`);
        setState(applyMove(state, skipMove(state)));
      }
      setHistory([]);
    }, SPEEDS[speed]);
    return () => clearTimeout(t);
  }, [state, botTurn, paused, speed, controller, dragonShow]);

  const dispatch = (move: Move) => {
    if (!state || botTurn) return;
    try {
      const next = applyMove(state, move);
      // Undo only within a turn: once the turn passes, new cards were drawn
      setHistory(next.current === state.current && !next.over ? [...history, state] : []);
      setState(next);
      setError(null);
    } catch (e) {
      if (e instanceof RuleError) setError(e.msg);
      else throw e;
    }
  };

  const undo = () => {
    setState(history[history.length - 1]);
    setHistory(history.slice(0, -1));
  };

  const lang = useLang();
  const recent = useMemo(() => (state ? state.log.slice(-16).reverse().map((m) => format(m, lang)) : []), [state, lang]);

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
    <div className={`game${dragonShow ? ' shake' : ''}`}>
      <header className="topbar">
        <h1>Loảng xoảng! <small>demo</small></h1>
        <div className="players">
          {state.players.map((p, i) => (
            <div key={p.id} className={`player-chip pc-${p.color}${i === state.current ? ' current' : ''}`}>
              <b>{p.name}</b>
              {controllers[i] !== 'human' && <span className="bot-badge">{controllerLabel(controllers[i])}</span>}
              <span>{status(p.status)}</span>
              <span title={t('health')}><Heart /> {MAX_HEALTH - p.damage}</span>
              <span title={t('gold')}><Gold n={p.gold} /></span>
              <span title={t('clankCubes')}>🔔 {state.clankArea[p.id]}</span>
              {p.tokens.filter((t) => t.kind === 'artifact').map((t, j) => <span key={j} className="chip">{tokenName(t)}</span>)}
            </div>
          ))}
        </div>
        {hasBots && (
          <div className="bot-controls">
            <button onClick={() => setPaused(!paused)} title={t('pauseTitle')}>{paused ? t('resume') : t('pause')}</button>
            <select value={speed} onChange={(e) => setSpeed(e.target.value as Speed)} title={t('speedTitle')}>
              <option value="slow">{t('speedSlow')}</option>
              <option value="normal">{t('speedNormal')}</option>
              <option value="fast">{t('speedFast')}</option>
            </select>
          </div>
        )}
        <button onClick={() => setRules(true)}>{t('rules')}</button>
        <AudioButtons />
        <ArtSwitch />
        <LangSwitch />
        <button onClick={() => { if (confirm(t('quitConfirm'))) setState(null); }}>{t('quit')}</button>
      </header>

      <main>
        <div className="left">
          <Board
            state={state}
            interactive={!botTurn}
            onMove={onMove}
            onTeleport={(room) => dispatch({ type: 'move', to: room, teleport: true })}
          />
          <DragonPanel state={state} />
        </div>
        <div className="side">
          {botTurn ? (
            <BotPanel state={state} level={controller as Level} paused={paused} />
          ) : handHidden ? (
            <section className={`panel handoff pc-${me.color}`}>
              <h2>{t('turnOf', { player: me.name })}</h2>
              <p>{t('passScreen', { player: me.name })}</p>
              <button className="primary" onClick={() => setShownTo(state.current)}>{t('showHand')}</button>
            </section>
          ) : (
            <PlayerPanel state={state} dispatch={dispatch} canUndo={history.length > 0} onUndo={undo} onShowDiscard={() => setShowDiscard(true)} />
          )}
          <section className="panel log">
            <h3>{t('logTitle')}</h3>
            <ul>{recent.map((l, i) => <li key={i}>{l}</li>)}</ul>
          </section>
        </div>
      </main>

      {!handHidden && <DungeonPanel state={state} dispatch={dispatch} readOnly={botTurn} />}

      {error && <div className="toast" onClick={() => setError(null)}>{format(error, lang)}</div>}

      {swordPrompt && (
        <div className="overlay" onClick={() => setSwordPrompt(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t('monsterTunnel', { n: swordPrompt.monsters })}</h3>
            <p>{t('swordsBlock', { n: available(state).swords })}</p>
            <div className="buttons">
              {Array.from({ length: Math.min(swordPrompt.monsters, available(state).swords) - swordPrompt.minSwords + 1 }, (_, i) => i + swordPrompt.minSwords).map((n) => (
                <button key={n} onClick={() => { dispatch({ type: 'move', to: swordPrompt.to, swords: n }); setSwordPrompt(null); }}>
                  {t('useSwords', { n, damage: swordPrompt.monsters - n })}
                </button>
              ))}
            </div>
            <p className="muted small">{t('goingTo', { room: roomName(swordPrompt.to) })}</p>
          </div>
        </div>
      )}

      {state.pending && !handHidden && !botTurn && <PendingDialog state={state} dispatch={dispatch} />}

      {rules && <RulesDialog onClose={() => setRules(false)} />}
      {showDiscard && <DiscardDialog state={state} onClose={() => setShowDiscard(false)} />}
      {notice && <div className="toast info" onClick={() => setNotice(null)}>{notice}</div>}
      {found[0] && <FoundReveal key={found.length} found={found[0]} onDone={() => setFound((q) => q.slice(1))} />}
      {dragonShow && <DragonAttack attack={dragonShow} state={state} onDone={() => setDragonShow(null)} />}

      {state.over && <GameOver state={state} controllers={controllers} onRestart={() => setState(null)} />}
    </div>
  );
}
