// Translation: t(key, params) for UI texts, format(msg) for messages the rules
// engine stores (game log, why a move is refused), and the names of cards,
// secrets and rooms in the current language.

import { CARDS, type CardDef } from '../engine/cards';
import { ROOMS } from '../engine/map';
import { SECRETS } from '../engine/secrets';
import type { RoomId, SecretId } from '../engine/types';
import { CARDS_VI, SECRETS_VI } from './cardsVi';
import { en, type Key } from './en';
import { getLang, type Lang } from './lang';
import { vi } from './vi';

export { getLang, setLang, LANGS, type Lang } from './lang';
export type { Key } from './en';

export type Params = Record<string, string | number | boolean | undefined>;
// A message: a key and its values, e.g. { k: 'acquires', p: { player: 'Ann', card: 'ruby#3' } }
export interface Msg { k: Key; p?: Params }

const CATALOG = { en, vi } as Record<Lang, Record<Key, (p: Params) => string>>;

export const msg = (k: Key, p?: Params): Msg => (p ? { k, p } : { k });

export function t(k: Key, p: Params = {}, lang: Lang = getLang()): string {
  return CATALOG[lang][k](p);
}

const cardId = (idOrUid: string) => idOrUid.split('#')[0];

export function cardName(idOrUid: string, lang: Lang = getLang()): string {
  const id = cardId(idOrUid);
  return (lang === 'vi' && CARDS_VI[id]?.name) || CARDS[id]?.name || id;
}

export function cardText(d: CardDef, lang: Lang = getLang()): string | undefined {
  return lang === 'vi' && d.text ? CARDS_VI[d.id]?.text ?? d.text : d.text;
}

export function choiceLabel(idOrUid: string, index: number, lang: Lang = getLang()): string {
  const id = cardId(idOrUid);
  return (lang === 'vi' && CARDS_VI[id]?.choices?.[index]) || CARDS[id]?.choices?.[index]?.label || '';
}

export const secretName = (id: SecretId, lang: Lang = getLang()) => (lang === 'vi' ? SECRETS_VI[id].name : SECRETS[id].name);
export const secretText = (id: SecretId, lang: Lang = getLang()) => (lang === 'vi' ? SECRETS_VI[id].text : SECRETS[id].text);

// "a Crystal Cave in the Depths"
export function roomName(id: RoomId, lang: Lang = getLang()): string {
  const r = ROOMS[id];
  return t(`room.${r.type}` as Key, {}, lang) + (r.depths ? t('room.depths', {}, lang) : '');
}

// Turns ids in the params into names, then fills in the sentence
export function format(m: Msg, lang: Lang = getLang()): string {
  const p: Params = { ...m.p };
  for (const k of ['card', 'card2'] as const) if (typeof p[k] === 'string') p[k] = cardName(p[k] as string, lang);
  if (typeof p.secret === 'string') {
    p.secretText = secretText(p.secret as SecretId, lang);
    p.secret = secretName(p.secret as SecretId, lang);
  }
  if (typeof p.room === 'string') p.room = roomName(p.room, lang);
  if (typeof p.token === 'string') p.token = t(`tokenKind.${p.token}` as Key, {}, lang);
  if (typeof p.item === 'string') p.item = t(`item.${p.item}` as Key, {}, lang);
  if (typeof p.option === 'number' && typeof m.p?.card === 'string') p.option = choiceLabel(m.p.card, p.option, lang);
  return t(m.k, p, lang);
}
