import { cardDef } from '../engine/cards';
import { adjacentSecrets, choiceProblem, currentPlayer, trashOptions } from '../engine/engine';
import { roomLabel } from '../engine/map';
import type { GameState, Move } from '../engine/types';
import { Card } from './Card';

// The choice the current player must make before doing anything else
export function PendingDialog({ state, dispatch }: { state: GameState; dispatch: (move: Move) => void }) {
  const pending = state.pending!;
  const me = currentPlayer(state);
  const pick = (uid: string | null) => dispatch({ type: 'choose', uid });
  const option = (index: number | null) => dispatch({ type: 'chooseOption', index });
  const cards = (uids: string[], onPick: (uid: string) => void) => (
    <div className="cards">{uids.map((uid) => <Card key={uid} uid={uid} small onClick={() => onPick(uid)} />)}</div>
  );

  let body;
  switch (pending.kind) {
    case 'discardToDraw':
      body = (
        <>
          <h3>Discard a card to draw {pending.draw}</h3>
          <p>The discarded card has no effect.</p>
          {cards(me.hand, pick)}
          <button onClick={() => pick(null)}>Don't discard</button>
        </>
      );
      break;
    case 'discardToChoose':
      body = (
        <>
          <h3>{cardDef(pending.card).name}: discard a card to choose</h3>
          <p>The discarded card has no effect.</p>
          {cards(me.hand, pick)}
          <button onClick={() => pick(null)}>Don't discard</button>
        </>
      );
      break;
    case 'option': {
      const d = cardDef(pending.card);
      body = (
        <>
          <h3>{d.name}: choose one</h3>
          <div className="buttons">
            {d.choices!.map((c, i) => {
              const problem = choiceProblem(state, c);
              return <button key={i} disabled={!!problem} title={problem} onClick={() => option(i)}>{c.label}</button>;
            })}
          </div>
        </>
      );
      break;
    }
    case 'trash': {
      const title = { spring: 'Magic Spring: trash a card', burgle: 'Master Burglar: trash a Burgle', card: 'Dragon Shrine: trash a card' };
      body = (
        <>
          <h3>{title[pending.reason]}</h3>
          <p>It leaves your deck for good. Good for Stumbles!</p>
          {cards(trashOptions(state), pick)}
          {pending.reason !== 'spring' && <button onClick={() => pick(null)}>Don't trash</button>}
        </>
      );
      break;
    }
    case 'replaceRow':
      body = (
        <>
          <h3>Treasure Hunter: replace a card in the Dungeon Row</h3>
          <p>It goes to the discard pile and the next card takes its place (its Dragon Attack is ignored).</p>
          <div className="cards">
            {state.dungeonRow.map((uid, slot) => uid && <Card key={uid} uid={uid} small onClick={() => option(slot)} />)}
          </div>
          <button onClick={() => option(null)}>Keep the row</button>
        </>
      );
      break;
    case 'adjacentSecret':
      body = (
        <>
          <h3>Wand of Wind: take a secret from an adjacent room</h3>
          <div className="buttons">
            {adjacentSecrets(state).map(({ room, index }, i) => {
              const t = state.roomTokens[room][index];
              return <button key={i} onClick={() => option(i)}>{t.kind === 'majorSecret' ? 'Major' : 'Minor'} secret in {roomLabel(room)} ({room})</button>;
            })}
          </div>
        </>
      );
      break;
  }
  return (
    <div className="overlay">
      <div className="modal">{body}</div>
    </div>
  );
}
