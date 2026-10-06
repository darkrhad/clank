import { useState, type ReactNode } from 'react';
import { CARDS, DUNGEON_DECK, type CardDef } from '../engine/cards';
import { ART } from './art';
import { Card } from './Card';
import { PART_FILES, PARTS } from './parts';

// Card studio (open with #studio): every card at once, and which parts and
// art exist. Add or replace a file in src/ui/art/ or src/ui/parts/ and every
// card updates.

const GROUPS: { title: string; test: (d: CardDef) => boolean }[] = [
  { title: 'Starting deck and Reserve', test: (d) => d.banner === 'starter' || d.banner === 'reserve' || d.id === 'goblin' },
  { title: 'Actions and items', test: (d) => d.banner === 'dungeon' && !d.companion && !d.gem },
  { title: 'Companions', test: (d) => d.banner === 'dungeon' && !!d.companion },
  { title: 'Gems', test: (d) => !!d.gem },
  { title: 'Devices', test: (d) => d.banner === 'device' },
  { title: 'Monsters', test: (d) => d.banner === 'monster' && d.id !== 'goblin' },
];

const ids = [...Object.keys(CARDS).filter((id) => !DUNGEON_DECK[id]), ...Object.keys(DUNGEON_DECK)];

export function Studio() {
  const [small, setSmall] = useState(false);
  const [onlyMissing, setOnlyMissing] = useState(false);
  const withArt = ids.filter((id) => ART[id]).length;
  const partsDone = PARTS.filter((p) => PART_FILES[p.name]).length;
  const missingArt = ids.filter((id) => !ART[id]);

  return (
    <div className="studio">
      <header className="studio-head">
        <h1>Card studio</h1>
        <a href="#">← Back to the game</a>
        <label className="toggle"><input type="checkbox" checked={small} onChange={(e) => setSmall(e.target.checked)} /> small size</label>
        <label className="toggle"><input type="checkbox" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} /> only cards without art</label>
      </header>

      <section className="panel">
        <h3>Parts <small>({partsDone} of {PARTS.length} in src/ui/parts/, the rest are drawn)</small></h3>
        <div className="studio-parts">
          {PARTS.map((p) => (
            <div key={p.name} className={`studio-part${PART_FILES[p.name] ? ' done' : ''}`} title={p.what}>
              <div className="thumb" style={PART_FILES[p.name] ? { backgroundImage: `url(${PART_FILES[p.name]})` } : undefined}>
                {!PART_FILES[p.name] && 'drawn'}
              </div>
              <code>{p.name}</code>
              <span>{p.what}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3>Art <small>({withArt} of {ids.length} cards have art in src/ui/art/)</small></h3>
        {missingArt.length > 0 && (
          <p className="small muted">Missing: {missingArt.map((id) => <code key={id}>{id}</code>).reduce<ReactNode[]>((a, c, i) => (i ? [...a, ', ', c] : [c]), [])}</p>
        )}
      </section>

      {GROUPS.map((g) => {
        const cards = ids.filter((id) => g.test(CARDS[id]) && (!onlyMissing || !ART[id]));
        if (!cards.length) return null;
        return (
          <section key={g.title} className="panel">
            <h3>{g.title} <small>({cards.length})</small></h3>
            <div className="cards studio-cards">{cards.map((id) => <Card key={id} id={id} small={small} />)}</div>
          </section>
        );
      })}

      {PART_FILES.back && (
        <section className="panel">
          <h3>Card back</h3>
          <div className="card-back" style={{ backgroundImage: `url(${PART_FILES.back})` }} />
        </section>
      )}
    </div>
  );
}
