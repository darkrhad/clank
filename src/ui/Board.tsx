import { currentPlayer, moveOptions, teleportOptions, type MoveOption } from '../engine/engine';
import { ROOMS, TUNNELS } from '../engine/map';
import type { GameState, Token } from '../engine/types';

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
        {teleports.map((room) => {
          const r = ROOMS[room];
          return (
            <g key={`tp-${room}`} className="target teleport" onClick={() => onTeleport(room)}>
              <circle cx={r.x} cy={r.y} r={27} />
              <title>Teleport here</title>
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

        {/* Pawns */}
        {state.players.map((p, i) => {
          const r = ROOMS[p.room];
          if (p.status === 'dead') return null;
          const x = r.x - 12 + (i % 2) * 24, y = r.y - 8 + Math.floor(i / 2) * 16;
          return (
            <g key={p.id} className={`pawn${p === me ? ' active' : ''}`}>
              <circle cx={x} cy={y} r={10} fill={PAWN_COLOR[p.color]} />
              <title>{p.name}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
