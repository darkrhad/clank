import { LEVEL_NAME, type Level } from '../ai/bot';
import { available, currentPlayer } from '../engine/engine';
import { roomLabel } from '../engine/map';
import { MAX_HEALTH } from '../engine/setup';
import type { GameState } from '../engine/types';
import { Card } from './Card';
import { tokenName } from './PlayerPanel';

// What everyone can see during an AI turn: played cards and resources, not the hand
export function BotPanel({ state, level, paused }: { state: GameState; level: Level; paused: boolean }) {
  const bot = currentPlayer(state);
  const left = available(state);
  return (
    <section className={`panel player-panel bot-panel pc-${bot.color}`}>
      <header>
        <h2>🤖 {bot.name} <small>({LEVEL_NAME[level]})</small></h2>
        <span className="where">{paused ? 'paused' : <span className="thinking">thinking…</span>}</span>
      </header>
      <div className="resources">
        <span title="Skill">◆ {left.skill}</span>
        <span title="Swords">🗡️ {left.swords}</span>
        <span title="Boots">👢 {state.turn.exhausted ? 0 : left.boots}</span>
        <span title="Gold">🪙 {bot.gold}</span>
        <span title="Health">❤ {MAX_HEALTH - bot.damage}/{MAX_HEALTH}</span>
        <span title="Clank! area">🔔 {state.clankArea[bot.id]}</span>
      </div>
      <p className="muted small">
        In {roomLabel(bot.room)} · {bot.hand.length} cards in hand (hidden)
      </p>
      {bot.playArea.length > 0 && (
        <>
          <h3>Played this turn</h3>
          <div className="cards">{bot.playArea.map((uid) => <Card key={uid} uid={uid} small />)}</div>
        </>
      )}
      {bot.tokens.length > 0 && (
        <>
          <h3>Tokens</h3>
          <div className="buttons">{bot.tokens.map((t, i) => <span key={i} className="chip">{tokenName(t)}</span>)}</div>
        </>
      )}
    </section>
  );
}
