import { Fragment, type ReactNode } from 'react';
import type { Choice, Effect } from '../engine/cards';
import { cardName, t, type Key } from '../i18n';

// The symbols printed on the physical cards: Skill is a blue diamond, a Sword
// a red circle, a Boot a yellow square, Gold a coin, points a green hexagon.

export const Skill = ({ n }: { n: number | string }) => <span className="sym sym-skill"><b>{n}</b></span>;

export const Gold = ({ n }: { n: number }) => <span className="sym sym-gold">{n}</span>;

export const Points = ({ n }: { n: number | string }) => <span className="sym sym-points">{n}</span>;

export const Sword = ({ plus }: { plus?: boolean }) => (
  <span className="sym sym-sword">
    <svg viewBox="0 0 24 24" aria-label="Sword">
      <path d="M21.5 2.5 20.4 7.6 11.2 16.8 7.2 12.8 16.4 3.6z" />
      <path d="M4.6 12.2 6.6 10.2 13.8 17.4 11.8 19.4z" />
      <path d="M7.4 15.2 8.8 16.6 5.4 20 6 20.6 4.6 22 2 19.4 3.4 18 4 18.6z" />
    </svg>
    {plus && <i>+</i>}
  </span>
);

export const Boot = ({ plus }: { plus?: boolean }) => (
  <span className="sym sym-boot">
    <svg viewBox="0 0 24 24" aria-label="Boot">
      <path d="M7 3h7v9.5l4.6 2.3c1.5.7 2.4 1.9 2.4 3.2V20H4v-3.2L5.5 15V3z" />
    </svg>
    {plus && <i>+</i>}
  </span>
);

export const Heart = () => (
  <span className="sym sym-heart">
    <svg viewBox="0 0 24 24" aria-label="Heal 1">
      <path d="M12 21s-7.3-4.6-9.6-9.2C.6 8.2 2.8 3.8 6.9 3.8c2.2 0 3.7 1.3 5.1 3 1.4-1.7 2.9-3 5.1-3 4.1 0 6.3 4.4 4.5 8C19.3 16.4 12 21 12 21z" />
    </svg>
  </span>
);

export const CompanionIcon = () => (
  <span className="sym sym-companion" title="Companion">
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10.5" />
      <circle cx="12" cy="9.5" r="3.6" className="fill" />
      <path d="M5.5 18.5c1.2-3 3.7-4.4 6.5-4.4s5.3 1.4 6.5 4.4" className="fill" />
    </svg>
  </span>
);

const repeat = (n: number, el: (i: number) => ReactNode) => Array.from({ length: n }, (_, i) => el(i));

// Card text with symbols: "{gold:1}", "{skill:2}", "{points:4}", "{sword}", "{boot}", "{heart}"
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\{\w+(?::[^}]+)?\})/);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\{(\w+)(?::([^}]+))?\}$/);
        if (!m) return <Fragment key={i}>{part}</Fragment>;
        const [, kind, arg] = m;
        if (kind === 'gold') return <Gold key={i} n={Number(arg)} />;
        if (kind === 'skill') return <Skill key={i} n={arg} />;
        if (kind === 'points') return <Points key={i} n={arg} />;
        if (kind === 'sword') return <Sword key={i} />;
        if (kind === 'boot') return <Boot key={i} />;
        if (kind === 'heart') return <Heart key={i} />;
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}


// An effect as the card prints it, e.g. DEFEAT: (3), all other players get +1 Loảng xoảng!
export function EffectLine({ e }: { e: Effect & Partial<Choice> }) {
  const parts: ReactNode[] = [];
  if (e.gold) parts.push(<Gold n={e.gold} />);
  if (e.skill) parts.push(<Skill n={e.skill} />);
  if (e.swords) parts.push(<>{repeat(e.swords, (i) => <Sword key={i} />)}</>);
  if (e.boots) parts.push(<>{repeat(e.boots, (i) => <Boot key={i} />)}</>);
  if (e.heal) parts.push(<>{repeat(e.heal, (i) => <Heart key={i} />)}</>);
  if (e.clank) parts.push(t('eff.clank', { n: e.clank }));
  if (e.othersClank) parts.push(t('eff.othersClank', { n: e.othersClank }));
  if (e.draw) parts.push(e.draw <= 3 ? t(`eff.draw${e.draw}` as Key) : t('eff.drawN', { n: e.draw }));
  if (e.teleport) parts.push(t('eff.teleport'));
  if (e.attack) parts.push(t('eff.attack'));
  if (e.trash) parts.push(t('eff.trash'));
  if (e.buyTomes) parts.push(<>{t('eff.spend')} <Gold n={7} /> {t('eff.buyTomes', { card: cardName('secretTome') })}</>);
  if (e.adjacentSecret) parts.push(t('eff.adjacentSecret'));
  return <>{parts.map((p, i) => <Fragment key={i}>{i > 0 && ', '}{p}</Fragment>)}</>;
}
