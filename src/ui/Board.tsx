import { currentPlayer, moveOptions, teleportOptions, type MoveOption } from '../engine/engine';
import { ROOMS, TUNNELS, type Room, type Tunnel } from '../engine/map';
import type { GameState, Token } from '../engine/types';
import boardImage from './parts/board.jpg';

// The board: a painted background (the citadel above, the catacombs below,
// no rooms on it) with the rooms and tunnels drawn on top from map.ts.
// Health, Loảng xoảng!, the dragon's rage and the countdown are shown in the panels.

const PAWN_COLOR = { red: '#e53935', yellow: '#fdd835', green: '#43a047', blue: '#1e88e5' };
const SIZE = { w: 907, h: 905 };

function tokenBadge(t: Token): { label: string; cls: string } {
  switch (t.kind) {
    case 'artifact': return { label: String(t.value), cls: 'artifact' };
    case 'majorSecret': return { label: '?', cls: 'major' };
    case 'minorSecret': return { label: '?', cls: 'minor' };
    case 'idol': return { label: '🐒', cls: 'idol' };
    default: return { label: '', cls: '' };
  }
}

const ROOM_TITLE = { entrance: 'Outside the dungeon', room: 'Room', cave: 'Crystal Cave', market: 'Market', fountain: 'Fountain of Healing', shrine: 'Monkey Shrine' };

function RoomShape({ id, r }: { id: string; r: Room }) {
  const cls = `room-shape t-${r.type}${r.depths ? ' depths' : ''}`;
  const title = <title>{ROOM_TITLE[r.type]}{r.depths ? ' (Depths)' : ''} · {id}</title>;
  switch (r.type) {
    case 'cave':
      return <g className={cls}><circle cx={r.x} cy={r.y} r={22} />{title}</g>;
    case 'fountain':
      return <g className={cls}><rect x={r.x - 22} y={r.y - 18} width={44} height={36} rx={5} /><text x={r.x} y={r.y + 7}>❤</text>{title}</g>;
    case 'shrine':
      return <g className={cls}><rect x={r.x - 22} y={r.y - 34} width={44} height={68} rx={6} />{title}</g>;
    case 'market':
      return <g className={cls}><rect x={r.x - 24} y={r.y - 20} width={48} height={40} rx={4} /><text x={r.x} y={r.y - 8}>MARKET</text>{title}</g>;
    case 'entrance':
      return <g className={cls}><path d={`M${r.x - 18} ${r.y + 16} v-18 a18 18 0 0 1 36 0 v18 z`} />{title}</g>;
    default:
      return <g className={cls}><rect x={r.x - 22} y={r.y - 18} width={44} height={36} rx={4} />{title}</g>;
  }
}

// Footprints, monsters and locks in the middle of a tunnel, as on the printed board
function TunnelMarks({ t, x, y }: { t: Tunnel; x: number; y: number }) {
  const marks = [
    ...(t.boots === 2 ? ['👣'] : []),
    ...Array.from({ length: t.monsters ?? 0 }, () => '👹'),
    ...(t.locked ? ['🔒'] : []),
  ];
  if (!marks.length) return null;
  const w = marks.length * 15 + 6;
  return (
    <g className="tunnel-marks">
      <rect x={x - w / 2} y={y - 10} width={w} height={20} rx={10} />
      <text x={x} y={y + 5}>{marks.join('')}</text>
    </g>
  );
}

function TunnelLine({ t }: { t: Tunnel }) {
  const a = ROOMS[t.from], b = ROOMS[t.to];
  if (t.wrap) {
    // Goes off one edge and comes back on the other: two stubs to the edges
    const [left, right] = a.x < b.x ? [a, b] : [b, a];
    return (
      <g className="tunnel">
        <line x1={left.x} y1={left.y} x2={0} y2={left.y} />
        <line x1={right.x} y1={right.y} x2={SIZE.w} y2={right.y} />
      </g>
    );
  }
  // Stop short of the rooms so arrows don't sit under them
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1, pad = 24;
  return (
    <g className={`tunnel${t.oneWay ? ' one-way' : ''}`}>
      <line x1={a.x + (dx / len) * pad} y1={a.y + (dy / len) * pad} x2={b.x - (dx / len) * pad} y2={b.y - (dy / len) * pad}
        markerEnd={t.oneWay ? 'url(#arrow)' : undefined} />
      <TunnelMarks t={t} x={(a.x + b.x) / 2} y={(a.y + b.y) / 2} />
    </g>
  );
}

interface Props {
  state: GameState;
  interactive: boolean; // false during AI turns: show the options, no clicking
  onMove: (option: MoveOption) => void;
  onTeleport: (room: string) => void;
}

export function Board({ state, interactive, onMove, onTeleport }: Props) {
  const me = currentPlayer(state);
  const options = state.over ? [] : moveOptions(state);
  const teleports = state.over ? [] : teleportOptions(state);
  const here = ROOMS[me.room];

  return (
    <div className={`board${interactive ? '' : ' watching'}`}>
      <img src={boardImage} alt="Loảng xoảng! board" />
      <svg viewBox={`0 0 ${SIZE.w} ${SIZE.h}`}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="arrow-head" />
          </marker>
        </defs>

        {TUNNELS.map((t, i) => <TunnelLine key={i} t={t} />)}
        {Object.entries(ROOMS).map(([id, r]) => <RoomShape key={id} id={id} r={r} />)}

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

        {/* Pawns: in the dungeon, or outside after escaping */}
        {state.players.map((p, i) => {
          if (p.status !== 'playing' && p.status !== 'escaped') return null;
          const pos = ROOMS[p.room];
          const x = pos.x - 12 + (i % 2) * 24, y = pos.y - 8 + Math.floor(i / 2) * 16;
          return (
            <g key={p.id} className={`pawn${p === me ? ' active' : ''}`}>
              <circle cx={x} cy={y} r={10} fill={PAWN_COLOR[p.color]} />
              <title>{p.name}{p.status === 'escaped' ? ' (escaped)' : ''}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
