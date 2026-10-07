import { Fragment, useLayoutEffect, useRef, type ReactNode } from 'react';
import { cardDef, CARDS, type CardDef } from '../engine/cards';
import { ART } from './art';
import { cardName, cardText, getLang, t, type Key } from '../i18n';
import { Boot, CompanionIcon, EffectLine, Gold, Points, RichText, Skill, Sword } from './Symbols';

// Laid out like the physical cards: banner with points, type tab, a picture
// area with the resource symbols down the left, the text box, the ACQUIRE
// bar, and the cost in the bottom-right corner (red Swords for monsters).

const subtitle = (d: CardDef): string | undefined => {
  const kind = d.companion ? 'companion' : d.gem ? 'gem' : d.banner === 'monster' || d.banner === 'device' ? d.banner : null;
  return kind ? t(`sub.${kind}` as Key) : undefined;
};

const color = (d: CardDef) => (d.id === 'secretTome' ? 'tome' : d.banner);

// Symbols down the left side: Skill, then one circle per Sword, one square per Boot.
// "0+" and "+" mark Skill, Swords or Boots that depend on something else.
function LeftColumn({ d }: { d: CardDef }) {
  const extraSkill = d.ifArtifact?.skill || d.ifIdol?.skill || d.skillPerClank;
  const items: ReactNode[] = [];
  if (d.skill) items.push(<Skill n={d.skill} />);
  else if (extraSkill) items.push(<Skill n="0+" />);
  for (let i = 0; i < (d.swords ?? 0); i++) items.push(<Sword />);
  for (let i = 0; i < (d.ifCrown?.swords ?? 0); i++) items.push(<Sword plus />);
  for (let i = 0; i < (d.boots ?? 0); i++) items.push(<Boot />);
  for (let i = 0; i < (d.ifCrown?.boots ?? 0); i++) items.push(<Boot plus />);
  return <div className="c-left">{items.map((x, i) => <Fragment key={i}>{x}</Fragment>)}</div>;
}

function Or({ d }: { d: CardDef }) {
  return (
    <>
      {d.choices!.map((c, i) => (
        <Fragment key={i}>{i > 0 && <span className="c-or">{t('or')}</span>}<span><EffectLine e={c} /></span></Fragment>
      ))}
    </>
  );
}

// Shrinks the text of an element until it fits its box (all cards have the same size)
function useFit<T extends HTMLElement>(key: string, min: number) {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.fontSize = '';
    let size = parseFloat(getComputedStyle(el).fontSize);
    while ((el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1) && size > min) {
      size -= 0.5;
      el.style.fontSize = `${size}px`;
    }
  }, [key, min]);
  return ref;
}

// The text box. Gold a card gives is printed here as a big coin. Every card
// has the same size, so long text shrinks until it fits.
function TextBox({ d }: { d: CardDef }) {
  const device = d.banner === 'device';
  const monster = d.banner === 'monster';
  const text = cardText(d);
  const ref = useFit<HTMLDivElement>(`${d.id}-${getLang()}`, 6.5);
  return (
    <div className="c-text" ref={ref}>
      {d.gold ? <div className="c-big"><Gold n={d.gold} /></div> : null}
      {text && <p><RichText text={text} /></p>}
      {monster && d.defeat && <p><b>{t('defeat')}</b> <EffectLine e={d.defeat} /></p>}
      {device && d.use && <p><b>{t('useLabel')}</b> <EffectLine e={d.use} /></p>}
      {d.choices && <div className="c-choices">{device && <b>{t('useLabel')}</b>}<Or d={d} /></div>}
    </div>
  );
}

interface Props {
  uid?: string;
  id?: string;
  onClick?: () => void;
  disabled?: boolean;
  small?: boolean;
  children?: ReactNode;
  cost?: number; // the cost right now, if it differs (Gem Collector)
}

// One-line bar (DANGER / ARRIVE, ACQUIRE): the text shrinks until it fits the width
function Bar({ className, k, children }: { className: string; k: string; children: ReactNode }) {
  const ref = useFit<HTMLDivElement>(k, 6);
  return <div className={className} ref={ref}>{children}</div>;
}

function Name({ name }: { name: string }) {
  const ref = useFit<HTMLSpanElement>(name, 8);
  return <span className="c-name" ref={ref}>{name}</span>;
}

export function Card({ uid, id, onClick, disabled, small, children, cost }: Props) {
  const d = uid ? cardDef(uid) : CARDS[id!];
  const lang = getLang();
  const name = cardName(d.id);
  const strip = d.danger ? [t('danger'), t('dangerText')]
    : d.arrive?.allPlayersClank ? [t('arrive'), t('arriveClank', { n: d.arrive.allPlayersClank })]
    : d.arrive?.returnCubes ? [t('arrive'), t('arriveCubes', { n: d.arrive.returnCubes })]
    : null;
  const discounted = cost !== undefined && d.cost !== undefined && cost !== d.cost;
  return (
    <div
      className={`card t-${color(d)}${small ? ' small' : ''}${onClick && !disabled ? ' clickable' : ''}${disabled ? ' disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
      title={`${name}${subtitle(d) ? ` · ${subtitle(d)}` : ''}${d.source === 'assumed' ? t('valuesAssumed') : ''}`}
    >
      <div className="c-face">
        <div className="c-banner">
          {d.companion && <CompanionIcon />}
          <Name name={name} />
          {d.points || d.bonus ? <Points n={d.points || '?'} /> : null}
        </div>

        <div className={`c-art${ART[d.id] ? ' has-art' : ''}`} style={ART[d.id] ? { backgroundImage: `url(${ART[d.id]})` } : undefined}>
          <LeftColumn d={d} />
          <div className="c-badges">
            {d.arrive && <span className="badge-arrive" title={t('arriveBadge')}>!</span>}
            {d.dragonAttack && <span className="badge-dragon" title={t('dragonBadge')}><i>🐉</i></span>}
          </div>
          {d.danger && <span className="badge-danger" title={t('dangerBadge')}>+</span>}
        </div>

        {strip && <Bar className="c-strip" k={`${d.id}-${lang}`}><b>{strip[0]}</b> {strip[1]}</Bar>}
        <TextBox d={d} />
        {d.acquire && <Bar className="c-acquire" k={`${d.id}-${lang}`}><b>{t('acquireBar')}</b> <EffectLine e={d.acquire} /></Bar>}

        {d.defeatSwords ? (
          <div className="c-swords" title={t('defeatTitle', { n: d.defeatSwords })}>
            {Array.from({ length: d.defeatSwords }, (_, i) => <Sword key={i} />)}
          </div>
        ) : d.cost ? (
          <div className={`c-cost${discounted ? ' discounted' : ''}`} title={discounted ? t('discountTitle', { n: cost!, full: d.cost }) : t('costTitle', { n: d.cost })}>
            <b>{discounted ? cost : d.cost}</b>
          </div>
        ) : null}
        {d.source === 'assumed' && <span className="c-assumed">{t('assumed')}</span>}
      </div>
      {children}
    </div>
  );
}
