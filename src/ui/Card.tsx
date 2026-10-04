import type { ReactNode } from 'react';
import { cardDef, CARDS, type CardDef } from '../engine/cards';

const BANNER_LABEL: Record<CardDef['banner'], string> = {
  starter: 'Starter', reserve: 'Reserve', dungeon: 'Dungeon', device: 'Device', monster: 'Monster',
};

function Icons({ d }: { d: CardDef }) {
  const items: string[] = [];
  if (d.skill) items.push(`◆${d.skill}`);
  if (d.swords) items.push(`🗡️${d.swords}`);
  if (d.boots) items.push(`👢${d.boots}`);
  if (d.gold) items.push(`🪙${d.gold}`);
  if (d.clank) items.push(`${d.clank > 0 ? '+' : ''}${d.clank} Clank!`);
  return <div className="card-icons">{items.map((i) => <span key={i}>{i}</span>)}</div>;
}

export function describeEffect(d: CardDef): string {
  const parts: string[] = [];
  const e = d.use ?? d.defeat;
  if (d.use) parts.push('USE:');
  if (d.defeat) parts.push('DEFEAT:');
  if (e?.skill) parts.push(`+${e.skill} Skill`);
  if (e?.swords) parts.push(`+${e.swords} Swords`);
  if (e?.boots) parts.push(`+${e.boots} Boots`);
  if (e?.gold) parts.push(`+${e.gold} Gold`);
  if (e?.teleport) parts.push('Teleport');
  return parts.length > 1 ? parts.join(' ') : '';
}

interface Props {
  uid?: string;
  id?: string;
  onClick?: () => void;
  disabled?: boolean;
  small?: boolean;
  children?: ReactNode;
}

export function Card({ uid, id, onClick, disabled, small, children }: Props) {
  const d = uid ? cardDef(uid) : CARDS[id!];
  const text = [describeEffect(d), d.text].filter(Boolean).join(' ');
  return (
    <div
      className={`card banner-${d.banner}${small ? ' small' : ''}${onClick && !disabled ? ' clickable' : ''}${disabled ? ' disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
      title={`${d.name}${d.source !== 'rulebook' ? ` (${d.source === 'assumed' ? 'values assumed' : 'cost/points assumed'})` : ''}`}
    >
      <div className="card-banner">
        <span>{d.name}</span>
        {d.points ? <b className="card-points">{d.points}</b> : null}
      </div>
      <div className="card-type">
        {BANNER_LABEL[d.banner]}
        {d.companion ? ' · Companion' : ''}
        {d.dragonAttack ? ' · 🐉' : ''}
      </div>
      <Icons d={d} />
      {!small && text && <div className="card-text">{text}</div>}
      <div className="card-foot">
        {d.source !== 'rulebook' && <span className="card-assumed">assumed</span>}
        {d.defeatSwords ? <b className="card-cost swords">🗡️{d.defeatSwords}</b> : d.cost ? <b className="card-cost">◆{d.cost}</b> : null}
      </div>
      {children}
    </div>
  );
}
