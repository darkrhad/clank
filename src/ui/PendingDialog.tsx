import { cardDef } from '../engine/cards';
import { adjacentSecrets, choiceProblem, currentPlayer, trashOptions } from '../engine/engine';
import { cardName, choiceLabel, format, roomName, t } from '../i18n';
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
          <h3>{t('discardToDraw', { n: pending.draw })}</h3>
          <p>{t('noEffect')}</p>
          {cards(me.hand, pick)}
          <button onClick={() => pick(null)}>{t('dontDiscard')}</button>
        </>
      );
      break;
    case 'discardToChoose':
      body = (
        <>
          <h3>{t('discardToChoose', { card: cardName(pending.card) })}</h3>
          <p>{t('noEffect')}</p>
          {cards(me.hand, pick)}
          <button onClick={() => pick(null)}>{t('dontDiscard')}</button>
        </>
      );
      break;
    case 'option': {
      const d = cardDef(pending.card);
      body = (
        <>
          <h3>{t('chooseOne', { card: cardName(d.id) })}</h3>
          <div className="buttons">
            {d.choices!.map((c, i) => {
              const problem = choiceProblem(state, c);
              return <button key={i} disabled={!!problem} title={problem && format(problem)} onClick={() => option(i)}>{choiceLabel(d.id, i)}</button>;
            })}
          </div>
        </>
      );
      break;
    }
    case 'trash': {
      const title = {
        spring: format({ k: 'trashSpring', p: { secret: 'magicSpring' } }),
        burgle: t('trashBurgleTitle', { card: cardName('masterBurglar'), card2: cardName('burgle') }),
        card: t('trashCardTitle', { card: cardName('dragonShrine') }),
      };
      body = (
        <>
          <h3>{title[pending.reason]}</h3>
          <p>{t('trashNote', { card: cardName('stumble') })}</p>
          {cards(trashOptions(state), pick)}
          {pending.reason !== 'spring' && <button onClick={() => pick(null)}>{t('dontTrash')}</button>}
        </>
      );
      break;
    }
    case 'replaceRow':
      body = (
        <>
          <h3>{t('replaceTitle', { card: cardName('treasureHunter') })}</h3>
          <p>{t('replaceNote')}</p>
          <div className="cards">
            {state.dungeonRow.map((uid, slot) => uid && <Card key={uid} uid={uid} small onClick={() => option(slot)} />)}
          </div>
          <button onClick={() => option(null)}>{t('keepRow')}</button>
        </>
      );
      break;
    case 'adjacentSecret':
      body = (
        <>
          <h3>{t('adjacentTitle', { card: cardName('wandOfWind') })}</h3>
          <div className="buttons">
            {adjacentSecrets(state).map(({ room, index }, i) => {
              const tok = state.roomTokens[room][index];
              return <button key={i} onClick={() => option(i)}>{t('secretIn', { major: tok.kind === 'majorSecret', room: roomName(room) })}</button>;
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
