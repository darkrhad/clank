import { currentPlayer, moveOptions, teleportOptions, type MoveOption } from '../engine/engine';
import { ROOMS, TUNNELS } from '../engine/map';
import { RAGE_TRACK } from '../engine/setup';
import type { GameState, Token } from '../engine/types';
import { CLANK_AREA, COUNTDOWN_SPACES, HEALTH_SPACES, RAGE_SPACES } from './boardLayout';

const PAWN_COLOR = { red: '#e53935', yellow: '#fdd835', green: '#43a047', blue: '#1e88e5' };

function tokenBadge(t: Token): { label: string; cls: string } {
  switch (t.kind) {
    case 'artifact': return { label: String(t.value), cls: 'artifact' };
    case 'majorSecret': return { label: '?', cls: 'major' };
    case 'minorSecret': return { label: '?', cls: 'minor' };
    case 'idol': return { label: '🐒', cls: 'idol' };
    default: return { label: '', cls: '' };
  }
}

interface Props {
  state: GameState;
  showTunnels: boolean;
  onMove: (option: MoveOption) => void;
  onTeleport: (room: string) => void;
}

export function Board({ state, showTunnels, onMove, onTeleport }: Props) {
  const me = currentPlayer(state);
  const options = state.over ? [] : moveOptions(state);
  const teleports = state.over ? [] : teleportOptions(state);
  const here = ROOMS[me.room];

  return (
    <div className="board">
      <img src="/board.png" alt="Clank! board" />
      <svg viewBox="0 0 907 905">
        {showTunnels && TUNNELS.filter((t) => !t.wrap).map((t, i) => {
          const a = ROOMS[t.from], b = ROOMS[t.to];
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="tunnel-line" />;
        })}

        {/* Teleport rings go under the move targets: the ring teleports, the middle walks */}
        {teleports.map((room) => {
          const r = ROOMS[room];
          return (
            <g key={`tp-${room}`} className="target teleport" onClick={() => onTeleport(room)}>
              <circle cx={r.x} cy={r.y} r={27} />
              <title>Teleport here (click the blue ring)</title>
            </g>
          );
        })}

        {/* Where the current player can go */}
        {options.map((o) => {
          const r = ROOMS[o.to];
          return (
            <g key={o.to} className={`target ${o.allowed ? 'ok' : 'blocked'}`} onClick={() => o.allowed && onMove(o)}>
              <line x1={here.x} y1={here.y} x2={r.x} y2={r.y} />
              <circle cx={r.x} cy={r.y} r={21} />
              <text x={r.x} y={r.y - 26}>{o.boots}👢{o.monsters ? ` ${o.monsters}👹` : ''}{o.locked ? ' 🔒' : ''}</text>
              <title>{o.allowed ? `Move here: ${o.boots} Boot${o.boots > 1 ? 's' : ''}${o.monsters ? `, ${o.monsters} monster damage (Swords block)` : ''}` : o.reason}</title>
            </g>
          );
        })}
        {/* Tokens still on the board */}
        {Object.entries(state.roomTokens).map(([room, tokens]) =>
          tokens.map((t, i) => {
            const r = ROOMS[room];
            const b = tokenBadge(t);
            const x = r.x - 16 + i * 14, y = r.y + 16;
            return (
              <g key={`${room}-${i}`} className={`token ${b.cls}`}>
                <circle cx={x} cy={y} r={9} />
                <text x={x} y={y + 4}>{b.label}</text>
              </g>
            );
          }),
        )}

        {/* Health meters: damage cubes from the heart towards the skull */}
        {state.players.map((p) =>
          HEALTH_SPACES[p.color].slice(0, p.damage).map((pos, i) => (
            <rect key={`hp-${p.id}-${i}`} className="cube" x={pos.x - 9} y={pos.y - 9} width={18} height={18} rx={3} fill={PAWN_COLOR[p.color]}>
              <title>{p.name}: {p.damage} damage</title>
            </rect>
          )),
        )}

        {/* Clank! area: everyone's cubes, until the next dragon attack */}
        {state.players
          .flatMap((p) => Array.from({ length: state.clankArea[p.id] }, () => p))
          .map((p, i) => (
            <rect key={`clank-${i}`} className="cube"
              x={CLANK_AREA.x + (i % CLANK_AREA.columns) * CLANK_AREA.step}
              y={CLANK_AREA.y + Math.floor(i / CLANK_AREA.columns) * CLANK_AREA.step}
              width={CLANK_AREA.cube} height={CLANK_AREA.cube} rx={1} fill={PAWN_COLOR[p.color]}>
              <title>{p.name}: {state.clankArea[p.id]} Clank! in the Clank! area</title>
            </rect>
          ))}

        {/* Dragon marker on the rage track */}
        <g className="dragon-marker">
          <circle cx={RAGE_SPACES[state.rage].x} cy={RAGE_SPACES[state.rage].y} r={17} />
          <text x={RAGE_SPACES[state.rage].x} y={RAGE_SPACES[state.rage].y + 7}>🐉</text>
          <title>Dragon rage: draws {RAGE_TRACK[state.rage]} cubes per attack</title>
        </g>

        {/* Pawns: in the dungeon, outside (escaped), or on the countdown track */}
        {state.players.map((p, i) => {
          let pos: { x: number; y: number } | null = null;
          if (state.countdown?.playerId === p.id) pos = COUNTDOWN_SPACES[Math.min(state.countdown.space, 5) - 1];
          else if (p.status === 'playing' || p.status === 'escaped') pos = ROOMS[p.room];
          if (!pos) return null;
          const x = pos.x - 12 + (i % 2) * 24, y = pos.y - 8 + Math.floor(i / 2) * 16;
          return (
            <g key={p.id} className={`pawn${p === me ? ' active' : ''}`}>
              <circle cx={x} cy={y} r={10} fill={PAWN_COLOR[p.color]} />
              <title>{p.name}{state.countdown?.playerId === p.id ? ` (countdown space ${state.countdown.space})` : ''}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
