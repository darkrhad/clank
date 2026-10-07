import { RAGE_TRACK } from '../engine/setup';
import type { GameState } from '../engine/types';
import { t } from '../i18n';
import { PART_FILES } from './parts';

export const CUBE_COLOR: Record<string, string> = { red: '#e53935', yellow: '#fdd835', green: '#43a047', blue: '#1e88e5', black: '#1a1a1a' };

export const Cube = ({ color, big }: { color: string; big?: boolean }) => (
  <span className={`cube-sq${big ? ' big' : ''}`} style={{ background: CUBE_COLOR[color] ?? color }} />
);

// Under the board: the dragon's rage, the Loảng xoảng! area, the bag and the countdown, as cubes
export function DragonPanel({ state }: { state: GameState }) {
  const dragon = PART_FILES.dragon;
  return (
    <section className="panel dragon-panel">
      <div className="dp-rage">
        <h3>{t('rageTrack')} <small>{t('rageHint', { n: RAGE_TRACK[state.rage] })}</small></h3>
        <div className="rage-track">
          {RAGE_TRACK.map((n, i) => (
            <div key={i} className={`rage-space${i === state.rage ? ' on' : i < state.rage ? ' past' : ''}`} title={t('rageSpace', { space: i + 1, n })}>
              <b>{n}</b>
              {i === state.rage && (dragon ? <img src={dragon} alt="" /> : <span>🐉</span>)}
            </div>
          ))}
        </div>
        {state.countdown && (
          <div className="dp-countdown">
            <h3>{t('countdownTitle')}</h3>
            <div className="rage-track">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className={`rage-space count${n === state.countdown!.space ? ' on' : n < state.countdown!.space ? ' past' : ''}`}><b>{n === 5 ? '💀' : n}</b></div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="dp-area">
        <h3>{t('clankAreaTitle')}</h3>
        {state.players.map((p) => (
          <div key={p.id} className="dp-row">
            <span className={`dp-name c-${p.color}`}>{p.name}</span>
            <span className="cubes">
              {Array.from({ length: state.clankArea[p.id] }, (_, i) => <Cube key={i} color={p.color} />)}
              {!state.clankArea[p.id] && <small className="muted">{t('areaEmpty')}</small>}
            </span>
          </div>
        ))}
        <p className="muted small">{t('clankAreaHint')}</p>
      </div>

      <div className="dp-bag">
        <h3>{t('bagTitle')} <small>{t('blackHarmless')}</small></h3>
        <div className="cubes bag">
          {state.players.flatMap((p) => Array.from({ length: state.bag[p.id] ?? 0 }, (_, i) => <Cube key={`${p.id}${i}`} color={p.color} />))}
          {Array.from({ length: state.bag.black }, (_, i) => <Cube key={`b${i}`} color="black" />)}
        </div>
      </div>
    </section>
  );
}
