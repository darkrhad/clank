import { currentPlayer, moveOptions, teleportOptions, type MoveOption } from '../engine/engine';
import { ROOMS, TUNNELS, type Room, type Tunnel } from '../engine/map';
import type { GameState, Token } from '../engine/types';
import boardImage from './parts/board.jpg';
import { PART_FILES } from './parts';

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

// The outline of each room type, centered on the room
function shapePath(r: Room): string {
  const { x, y } = r;
  const box = (w: number, h: number, rad: number) =>
    `M${x - w / 2 + rad} ${y - h / 2} h${w - 2 * rad} a${rad} ${rad} 0 0 1 ${rad} ${rad} v${h - 2 * rad} a${rad} ${rad} 0 0 1 -${rad} ${rad} h-${w - 2 * rad} a${rad} ${rad} 0 0 1 -${rad} -${rad} v-${h - 2 * rad} a${rad} ${rad} 0 0 1 ${rad} -${rad} z`;
  switch (r.type) {
    case 'cave': return `M${x - 22} ${y} a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0 z`;
    case 'shrine': return box(44, 68, 6);
    case 'market': return box(48, 40, 4);
    case 'entrance': return `M${x - 18} ${y + 16} v-18 a18 18 0 0 1 36 0 v18 z`;
    default: return box(44, 36, 4);
  }
}

// A room: the painted tile for its type (src/ui/parts/tile-<type>), clipped to its shape,
// with the outline on top. Without a tile, a dark shape.
function RoomShape({ id, r }: { id: string; r: Room }) {
  const cls = `room-shape t-${r.type}${r.depths ? ' depths' : ''}`;
  const d = shapePath(r);
  const tile = PART_FILES[`tile-${r.type}`];
  const size = r.type === 'shrine' ? 68 : 48;
  return (
    <g className={`${cls}${tile ? ' has-tile' : ''}`}>
      {tile && (
        <>
          <clipPath id={`clip-${id}`}><path d={d} /></clipPath>
          <image href={tile} x={r.x - size / 2} y={r.y - size / 2} width={size} height={size} preserveAspectRatio="xMidYMid slice" clipPath={`url(#clip-${id})`} />
        </>
      )}
      <path d={d} className="outline" />
      {r.type === 'fountain' && <text x={r.x} y={r.y + 7}>❤</text>}
      {r.type === 'market' && <text x={r.x} y={r.y - 8}>MARKET</text>}
      <title>{ROOM_TITLE[r.type]}{r.depths ? ' (Depths)' : ''} · {id}</title>
    </g>
  );
}

// Footprints, monsters and locks in the middle of a tunnel: one dark silhouette
// per circle, side by side (icons are the symbols in TunnelIcons)
type Mark = 'feet' | 'monster' | 'lock' | 'boot'; // boot: the Boot symbol from the cards

function TunnelMarks({ t, x, y }: { t: Tunnel; x: number; y: number }) {
  const marks: Mark[] = [
    ...(t.boots === 2 ? ['feet' as const] : []),
    ...Array.from({ length: t.monsters ?? 0 }, () => 'monster' as const),
    ...(t.locked ? ['lock' as const] : []),
  ];
  return <MarkRow marks={marks} x={x} y={y} />;
}

// A row of mark circles centered on x, y
function MarkRow({ marks, x, y }: { marks: Mark[]; x: number; y: number }) {
  const R = 10, step = 2 * R + 2;
  const x0 = x - ((marks.length - 1) * step) / 2;
  return (
    <g className="tunnel-marks">
      {marks.map((m, i) => (
        <g key={i} className={m === 'boot' ? 'card-boot' : undefined}>
          {m === 'boot'
            ? <rect x={x0 + i * step - R} y={y - R} width={2 * R} height={2 * R} rx={4} />
            : <circle cx={x0 + i * step} cy={y} r={R} />}
          <use href={`#icon-${m}`} x={x0 + i * step - 8} y={y - 8} width={16} height={16} />
        </g>
      ))}
    </g>
  );
}

// Silhouettes for the tunnel marks, drawn in a 24 x 24 box
function TunnelIcons() {
  return (
    <>
      <symbol id="icon-feet" viewBox="0 0 24 24">
        <ellipse cx="8" cy="16" rx="3.2" ry="4.6" />
        <circle cx="5.9" cy="9.6" r="1.2" /><circle cx="8" cy="8.9" r="1.3" /><circle cx="10.1" cy="9.8" r="1.1" />
        <ellipse cx="16" cy="12.5" rx="3.2" ry="4.6" />
        <circle cx="13.9" cy="6.1" r="1.2" /><circle cx="16" cy="5.4" r="1.3" /><circle cx="18.1" cy="6.3" r="1.1" />
      </symbol>
      <symbol id="icon-monster" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M4 4 L9 8.5 A7.5 7.5 0 0 1 15 8.5 L20 4 L18.3 11 A7.5 7.5 0 1 1 5.7 11 Z
          M8.2 13.4 l3 1.4 -3 1.1 z M15.8 13.4 l-3 1.4 3 1.1 z M9.5 18 h5 l-1 1.3 -1.5 -0.8 -1.5 0.8 z" />
      </symbol>
      <symbol id="icon-boot" viewBox="0 0 24 24">
        <path d="M7 3h7v9.5l4.6 2.3c1.5.7 2.4 1.9 2.4 3.2V20H4v-3.2L5.5 15V3z" />
      </symbol>
      <symbol id="icon-lock" viewBox="0 0 24 24">
        <path d="M7.5 11 V8 a4.5 4.5 0 0 1 9 0 V11" fill="none" stroke="currentColor" strokeWidth="2.6" />
        <path fillRule="evenodd" d="M5 10.5 h14 v10 h-14 z M12 13.2 a1.7 1.7 0 0 0 -0.8 3.2 V18.6 h1.6 V16.4 a1.7 1.7 0 0 0 -0.8 -3.2 z" />
      </symbol>
    </>
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
          <TunnelIcons />
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
              {/* What the move costs: one Boot symbol per Boot (as on the cards), a monster per damage, a lock */}
              <MarkRow x={r.x} y={r.y - 33} marks={[
                ...Array.from({ length: o.boots }, () => 'boot' as const),
                ...Array.from({ length: o.monsters }, () => 'monster' as const),
                ...(o.locked ? ['lock' as const] : []),
              ]} />
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
