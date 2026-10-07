import type { Level } from '../ai/bot';
import { roomName, t, type Key } from '../i18n';
import { available, currentPlayer, isExhausted } from '../engine/engine';
import { MAX_HEALTH } from '../engine/setup';
import type { GameState } from '../engine/types';
import { Card } from './Card';
import { Boot, Gold, Heart, Skill, Sword } from './Symbols';
import { tokenName } from './PlayerPanel';

// What everyone can see during an AI turn: played cards and resources, not the hand
export function BotPanel({ state, level, paused }: { state: GameState; level: Level; paused: boolean }) {
  const bot = currentPlayer(state);
  const left = available(state);
  return (
    <section className={`panel player-panel bot-panel pc-${bot.color}`}>
      <header>
        <h2>🤖 {bot.name} <small>({t(`level.${level}` as Key)})</small></h2>
        <span className="where">{paused ? t('paused') : <span className="thinking">{t('thinking')}</span>}</span>
      </header>
      <div className="resources">
        <span title={t('skillTitle')}><Skill n={left.skill} /></span>
        <span title={t('swordsTitle')}><Sword /> {left.swords}</span>
        <span title={t('bootsTitle')}><Boot /> {isExhausted(state) ? 0 : left.boots}</span>
        <span title={t('gold')}><Gold n={bot.gold} /></span>
        <span title={t('health')}><Heart /> {MAX_HEALTH - bot.damage}/{MAX_HEALTH}</span>
        <span title={t('clankCubes')}>🔔 {state.clankArea[bot.id]}</span>
      </div>
      <p className="muted small">
        {t('botWhere', { room: roomName(bot.room), n: bot.hand.length })}
      </p>
      {bot.playArea.length > 0 && (
        <>
          <h3>{t('playedThisTurn')}</h3>
          <div className="cards">{bot.playArea.map((uid) => <Card key={uid} uid={uid} small />)}</div>
        </>
      )}
      {bot.tokens.length > 0 && (
        <>
          <h3>{t('tokens')}</h3>
          <div className="buttons">{bot.tokens.map((t, i) => <span key={i} className="chip">{tokenName(t)}</span>)}</div>
        </>
      )}
    </section>
  );
}
