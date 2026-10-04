# Learning playbook: from rulebook to React game

This playbook explains how `clank-demo` is built and why. Read it with the code
open next to it. Each chapter names the files and functions to look at, and the
exercises at the end let you change the game yourself.

**Contents**

1. [The big picture](#1-the-big-picture)
2. [The game state is just data](#2-the-game-state-is-just-data)
3. [Game content is data too](#3-game-content-is-data-too)
4. [Moves and `applyMove`](#4-moves-and-applymove)
5. [Derived values: compute, don't store](#5-derived-values-compute-dont-store)
6. [Randomness you can replay](#6-randomness-you-can-replay)
7. [How a turn flows](#7-how-a-turn-flows)
8. [The screens](#8-the-screens)
9. [Testing a game](#9-testing-a-game)
10. [From rulebook to code: the process](#10-from-rulebook-to-code-the-process)
11. [Exercises](#11-exercises)
12. [Glossary](#12-glossary)

---

## 1. The big picture

The project has two halves that never mix:

| | `src/engine/` | `src/ui/` |
|---|---|---|
| Contains | The rules of Clank! | What you see and click |
| Knows about React? | No | Yes |
| Knows about the screen? | No | Yes |
| Tested by | Automated tests | Playing it in the browser |

Everything that happens in the game goes around one loop:

```
   ┌──────────────┐  click   ┌──────────────┐  move   ┌──────────────────────┐
   │  You         │ ───────► │  UI (React)  │ ──────► │  applyMove(state,     │
   │              │          │              │         │            move)      │
   └──────────────┘          └──────────────┘         └──────────┬───────────┘
          ▲                         ▲                            │
          │      draws the board    │      new state             │
          └─────────────────────────┴────────────────────────────┘
                                         (or a RuleError: "Needs 2 Boots")
```

1. You click something, e.g. a green room on the board.
2. The UI turns that into a **move**: `{ type: 'move', to: 'r2', swords: 0 }`.
3. The engine's `applyMove(state, move)` checks the rules and returns a **new state**,
   or throws a `RuleError` with a reason.
4. React draws the new state. Nothing else changes anything.

**Why split it like this?**

- **Rules are testable without a browser.** 36 tests run in about 2 seconds.
- **Online multiplayer becomes possible:** a server (or the host) can run the same
  `applyMove` without any React code.
- **Bots, replays and undo are easy:** they all just call `applyMove` or keep old states.
- **The UI stays simple:** it never decides what's allowed, it asks the engine.

> **Rule of thumb:** if the rulebook says it, it goes in `engine/`. If it's about
> colours, layout or clicks, it goes in `ui/`.

---

## 2. The game state is just data

📄 `src/engine/types.ts`

The whole game, at any moment, is one plain object, `GameState`. No classes, no
functions inside, nothing hidden. If you print it with `console.log`, you see
the entire game.

```ts
interface GameState {
  seed: number;                 // for random numbers (chapter 6)
  players: Player[];            // decks, hands, rooms, health, gold, tokens
  current: number;              // whose turn
  turn: Turn;                   // what the current player did this turn
  dungeonDeck: CardUid[];
  dungeonRow: (CardUid | null)[];
  roomTokens: Record<RoomId, Token[]>;   // what's still lying on the board
  clankArea: Record<string, number>;     // cubes per player
  bag: Record<string, number>;           // the dragon bag
  rage: number;
  countdown: { playerId: string; space: number } | null;
  pending: Pending | null;      // a choice the player must make first
  log: string[];
  over: boolean;
  // ...
}
```

**Things to notice:**

- **Cards are strings**, like `"burgle#red-3"`. The part before `#` says which card it is
  (`cardDef(uid)` looks it up), the rest just makes each copy unique. Moving a card
  means moving a string from one array to another (`hand` → `playArea` → `discard`).
- **Only facts are stored, never things that can be computed.** For example, the state
  doesn't store "how much Skill does Red have". It stores what was *earned* and *spent*
  this turn (`turn.earned`, `turn.spent`), and the Skill is computed (chapter 5).
- **Choices are part of the state too.** When Sleight of Hand asks "discard a card to
  draw two", the engine sets `pending = { kind: 'discardToDraw', draw: 2 }` and refuses
  other moves until the player answers with a `choose` move. The UI just sees `pending`
  and shows a dialog.

**Why plain data?**

- Saving a game = `JSON.stringify(state)`.
- Sending it over the network works the same way.
- Two states can be compared in a test with `expect(a).toEqual(b)`.

---

## 3. Game content is data too

📄 `src/engine/cards.ts`, `src/engine/map.ts`, `src/engine/secrets.ts`

Cards, the map and secret tokens are tables of data, not code. A card looks like this:

```ts
{ id: 'elvenBoots', name: 'Elven Boots', banner: 'dungeon',
  skill: 1, boots: 1, draw: 1, points: 2, cost: 4,
  text: 'Draw a card.', source: 'rulebook' }
```

The engine has **one** function, `applyEffect` (in `engine.ts`), that knows what
`skill`, `boots`, `draw`, `clank`, `gold` and so on mean. So a new card with only
those effects needs **no new code**, just a new line in the table (exercise 1).

Only unusual effects need code, and each gets a named field that the engine looks for:

| Field | Card | Where the engine handles it |
|---|---|---|
| `ifCompanionDraw` | Rebel Captain, Rebel Scout | `checkConditionalDraws` |
| `ifArtifact`, `ifCrown`, `skillPerClank` | Kobold Merchant, Mountain King, Swagger | `available` |
| `discardToDraw` | Sleight of Hand | `playCard` sets `pending` |
| `onlyInCrystalCave` | Crystal Golem | the `fight` move |
| `arrive`, `danger`, `dragonAttack` | monsters | `refillRow`, `dragonAttack` |

**The map works the same way.** `ROOMS` lists every room (position on the picture, type,
starting tokens, whether it's in the Depths). `TUNNELS` lists every connection with
its special rules (`boots: 2`, `monsters: 1`, `locked`, `oneWay`, `wrap`). The rules for
moving are written once in `moveOptions`, and they work for any map you put in the table.

**The `source` field** records where each value came from: `'rulebook'` (read from a card
in the rulebook), `'rulebook-text'` (effect quoted, cost guessed) or `'assumed'`. When
you get the real card list, you know exactly what to check.

---

## 4. Moves and `applyMove`

📄 `src/engine/types.ts` (the `Move` type), `src/engine/engine.ts` (`applyMove`, `step`)

Every action a player can take is one kind of `Move`:

```ts
type Move =
  | { type: 'play'; uid: CardUid }
  | { type: 'buy'; slot: number }
  | { type: 'fight'; slot: number }
  | { type: 'move'; to: RoomId; swords?: number; teleport?: boolean }
  | { type: 'takeToken'; index: number }
  | { type: 'endTurn' }
  // ...13 in total
```

`applyMove` is tiny:

```ts
export function applyMove(state: GameState, move: Move): GameState {
  return produce(state, (draft) => {
    step(draft, move);
  });
}
```

- **`step`** is a big `switch` over `move.type`. Each case first **checks** (and calls
  `fail('reason')` if something isn't allowed), then **changes** the draft.
- **`produce`** comes from the library **Immer**. Inside it, you write normal code that
  changes things (`p.hand.splice(...)`, `p.gold += 3`), but Immer actually builds a
  **new** state and leaves the old one untouched.
- If `fail` throws, Immer throws away the half-finished changes. **A move either happens
  completely or not at all.**

**Why does "the old state stays untouched" matter?**

Look at **Undo** in `src/ui/App.tsx`: before each move, the UI keeps the previous state in
`history`. Undo just puts it back. No "reverse every rule" code is needed. Undo only
works within a turn, because after a turn ends, new cards are drawn, and undoing would
let you peek at them.

**Example: the `buy` case**

```ts
case 'buy': {
  const card = rowCard(s, move.slot);                     // fails if the space is empty
  const d = cardDef(card);
  if (d.banner === 'monster') fail('Monsters are fought with Swords, not bought');
  if (d.banner === 'device') fail('Devices are used, not kept');
  pay(s, 'skill', d.cost ?? 0, d.name);                    // fails: "Elven Boots needs 4 Skill"
  p.discard.push(card);
  s.dungeonRow[move.slot] = null;
  log(s, `${p.name} acquires ${d.name}.`);
  break;
}
```

The error messages are written for players, because the UI shows them directly as a toast.

---

## 5. Derived values: compute, don't store

📄 `src/engine/engine.ts`: `available`, `moveOptions`, `canEndTurn`

How much Skill does the current player have? The answer **depends on other things**:

- Kobold Merchant gives +2 Skill **if you have an Artifact**, even if you pick the Artifact up later.
- Swagger gives +1 Skill **for each Clank! made this turn**, before or after playing it.

The rulebook says these count "regardless of the order you play your cards". If we stored
"Skill = 3" when Kobold was played, we'd have to remember to update it when an Artifact
is picked up. Easy to forget.

Instead, `available(state)` **computes** it every time from the facts:

```
Skill left = Skill earned from played cards
           + conditional bonuses that are true right now
           − Skill already spent
```

Computing instead of storing means there's **one place** that knows the answer, and it's
always right. The UI uses the same functions:

- `available(s)` → the ◆ 🗡️ 👢 numbers in the panel
- `moveOptions(s)` → the green and red circles on the board, including the reason shown on hover
- `canEndTurn(s)` → whether "End turn" is enabled, and its tooltip

**Rebel Captain's "draw a card" is different:** drawing is an action, not a number. Here
`checkConditionalDraws` runs after **every** move and draws once when the condition
becomes true. `turn.conditionalDraws` remembers which cards already drew, so it happens
only once.

---

## 6. Randomness you can replay

📄 `src/engine/rng.ts`

Shuffling and dragon-bag draws are random. But a rules engine should give the
**same result for the same state and move**, otherwise tests are flaky and an online
game would show different results to each player.

The fix is a **seeded** random generator. The seed is a number stored in the state.
Each `random(state)` call computes the next number from it and updates the seed.

```ts
createGame(['A', 'B'], 7)   // always deals exactly the same cards
```

- **Tests** use fixed seeds, so they always behave the same (`'is deterministic for the same seed'` checks this).
- **A replay** is just: the starting seed + the list of moves.
- **Online play:** if every player has the same state and the same moves, they all compute the same game.

`Math.random()` is never used in the engine. It would break all three.

---

## 7. How a turn flows

📄 `src/engine/engine.ts`: `finishTurn`, `refillRow`, `dragonAttack`, `advanceToNextPlayer`

During a turn, the player sends moves in any order (play cards, move, buy, fight). The
interesting part is **End turn**:

```
endTurn
 ├─ canEndTurn?           hand empty, no open choice
 ├─ Magic Spring?         first ask which card to trash (pending)
 └─ finishTurn
     ├─ played cards and hand → discard pile, draw 5 new cards
     ├─ refillRow
     │   ├─ fill empty Dungeon Row spaces from the deck
     │   ├─ a card with ARRIVE → apply it (all players +1 Clank!)
     │   └─ any Dragon Attack symbol? → dragonAttack() once
     │        ├─ Clank! area cubes → into the bag
     │        ├─ draw (rage track + Danger cards) cubes
     │        └─ each coloured cube = 1 damage → maybe knockOut()
     └─ advanceToNextPlayer
         ├─ skip players who are out of the dungeon…
         ├─ …except the first one out: they move the countdown
         │    (spaces 2–4: extra dragon attacks, space 5: everyone left is knocked out)
         └─ nobody left playing? → game over
```

Each step is a small named function. When something goes wrong, you know which
function to read.

---

## 8. The screens

📄 `src/ui/`

| File | Shows |
|---|---|
| `App.tsx` | Setup screen, the game layout, hand-over screen, dialogs, game over. **Holds the state.** |
| `Board.tsx` | Board picture with an SVG layer: move targets, tokens, pawns |
| `PlayerPanel.tsx` | Current player: resources, hand, played cards, tokens, Market, buttons |
| `DungeonPanel.tsx` | Dungeon Row, Reserve, Goblin, the dragon |
| `Card.tsx` | One card, drawn from its data |
| `styles.css` | The look |

**The important part is in `App.tsx`:**

```ts
const dispatch = (move: Move) => {
  try {
    const next = applyMove(state, move);
    setHistory(/* keep old state for Undo */);
    setState(next);
  } catch (e) {
    if (e instanceof RuleError) setError(e.message);   // shown as a red toast
    else throw e;                                        // a real bug: don't hide it
  }
};
```

Every component gets `state` and `dispatch` and nothing else. A button only does
`dispatch({ type: 'fightGoblin' })`. It doesn't check Swords itself; it asks
`available(state)` to decide whether to be disabled, and the engine checks again anyway.

**UI-only state** (things that aren't part of the game) stays in React state in `App.tsx`:
which player may see the hand (`shownTo`), the open Swords dialog (`swordPrompt`), the
"tunnels" checkbox. None of it goes into `GameState`, because it doesn't matter to the rules.

**The board** is a picture with an SVG on top that uses the same coordinate system as the
map data (`viewBox="0 0 907 905"`). A room at `x: 440, y: 120` in `map.ts` is drawn exactly
there, at any screen size.

---

## 9. Testing a game

📄 `src/engine/engine.test.ts`, `src/engine/simulation.test.ts`

### Rule tests

One small test per rule. The helpers at the top make situations easy to set up:

```ts
it('locked tunnels need a Master Key', () => {
  const s = playAll(withHand(at(game(), 'r3'), ['sidestep']));         // in r3 with 1 Boot
  expectRule(() => applyMove(s, { type: 'move', to: 'r6' }), /Master Key/);
});
```

- `game()`: a new game with a fixed seed
- `withHand(s, ['sidestep'])`: give the current player exactly these cards
- `edit(s, (d) => …)`: change anything in a state (states from `applyMove` are frozen by Immer)
- `expectRule(fn, /text/)`: the move must be refused, with this reason

### Bots playing whole games

`simulation.test.ts` lets random bots play 50 complete games with 2–4 players. After
**every** move it checks **invariants**, things that must always be true:

- no Clank! cube appears or disappears
- health never goes over the maximum
- a player at maximum damage is never still playing
- nobody carries more than 2 Artifacts

Bots are dumb, but they try everything in strange orders, so they find bugs that a
person wouldn't think to test.

### A lesson from building this

When the automatic browser game got stuck, my first explanation ("the dungeon deck ran
out") was a guess, and it was wrong. Checking the log showed the real cause: the test
script never bought anything, so the Dungeon Row never changed and the dragon never
attacked. **Check the evidence before fixing.** The log (`state.log`) is there for exactly that.

---

## 10. From rulebook to code: the process

This is the order the project was built in. It works for most board games.

| Step | What | In this project |
|---|---|---|
| 1. Read | Text **and** pictures: setup diagrams, examples, card overview | Page images showed card values, tunnel icons, the rage track |
| 2. List the components | Everything physical: cards, tokens, board, cubes | `types.ts` |
| 3. Digitize the content | Cards and the board as data tables | `cards.ts`, `map.ts` (the map was checked with an overlay view) |
| 4. Write down unknowns | What the rulebook doesn't say | `source: 'assumed'`, the README's differences list |
| 5. Rules engine | Moves, one at a time, each with tests | `engine.ts`, `engine.test.ts` |
| 6. Bots | Whole games, invariants | `simulation.test.ts` |
| 7. Screens | Only after the rules work | `ui/` |
| 8. Play it | In a real browser, to the end | That's how the stuck-game issue was found |

**The hardest part is usually step 3**, not the code: the rulebook didn't list the 100
dungeon cards, and the map had to be read room by room from a picture.

---

## 11. Exercises

Run `npm test` after each one. Start with exercise 1.

### Exercise 1: add a card (data only) ⭐

Add a dungeon card "Treasure Hunter": 2 Gold, costs 3 Skill, worth 1 point.

1. In `cards.ts`, add to `defs`:
   `{ id: 'treasureHunter', name: 'Treasure Hunter', banner: 'dungeon', gold: 2, points: 1, cost: 3, source: 'assumed' }`
2. Add `treasureHunter: 3` to `DUNGEON_DECK`.
3. Add a test in `engine.test.ts`:
   ```ts
   it('Treasure Hunter gives 2 Gold', () => {
     expect(me(playAll(withHand(game(), ['treasureHunter']))).gold).toBe(2);
   });
   ```
4. Run `npm run dev` and find it in the Dungeon Row.

**What you learn:** content is data. No engine or UI code changed, yet the card works and shows up.

### Exercise 2: change a rule and watch the tests ⭐

**Part A.** In `setup.ts`, change `HAND_SIZE` from 5 to 6 and run `npm test`.

- Two tests fail: `deals 5 cards…` and `ending the turn … draws 5 and passes on`.
  Read them: both check a hand of exactly 5 cards.
- Change it back.

**Part B.** Now change `MAX_HEALTH` from 10 to 8 and run `npm test` again.

- Nothing fails. Why? Search the tests for `MAX_HEALTH`: they use the constant
  (`MAX_HEALTH - 1`) instead of writing `9`, so they adapt to the new value.
- Change it back.

**What you learn:** tests show exactly what a rule change affects. Whether a test should
use the constant (adapts to a change) or a fixed number (catches any change) is a choice:
`HAND_SIZE` is checked with a fixed 5 because the rulebook says 5.

### Exercise 3: an "Acquire" effect ⭐⭐

The rulebook says some cards have an **ACQUIRE** effect that happens once, when you take
the card from the Dungeon Row (for example "heal 1").

1. In `cards.ts`, add `acquire?: Effect;` to `CardDef`.
2. In `engine.ts`, in the `buy` case, call `applyEffect(s, p, d.acquire ?? {})` after paying.
3. Add a card with `acquire: { heal: 1 }`, and a test: a damaged player buys it and has 1 damage less.
4. Bonus: show "ACQUIRE: heal 1" on the card (`describeEffect` in `Card.tsx`).

**What you learn:** a new kind of effect = one new field + one place in the engine.

### Exercise 4: a UI improvement ⭐⭐

In the Dungeon Row, give cards you can afford right now a golden border.

- Hint: `DungeonPanel.tsx` already computes `have` and `need`. Pass a prop to `Card`
  and add a CSS class.

**What you learn:** the UI asks the engine (`available`) instead of computing rules itself.

### Exercise 5: find the gap with a test ⭐⭐

Write a test: a player at full health enters a Fountain of Healing. What should happen?
Read `enterRoom` first: does the log say "heals 1" when there is nothing to heal?

**What you learn:** tests are also a way to ask "what does the code actually do?".

### Exercise 6: a smarter bot ⭐⭐⭐

In `simulation.test.ts`, `botMove` picks random moves. Make it prefer:
1. moving toward the nearest Artifact,
2. once it has one, moving toward the entrance.

Hint: to find "nearest", search outward room by room over `TUNNELS` (a breadth-first search).
Count how often bots escape before and after.

**What you learn:** the engine doesn't care who sends moves: a person, a bot or (later) the network.

### Exercise 7: think about online play ⭐⭐⭐ (no code)

The demo is "pass the screen". For online play, answer these:

1. Should the server send each player the **whole** state? (Hint: hands and secret tokens.)
2. Why is it enough to send **moves** between players, if everyone starts with the same state and seed?
3. Who runs `applyMove`: every browser, the host, or a server? What are the trade-offs?
   (Compare with the dice_king project, where the host's browser runs the game.)

---

## 12. Glossary

| Term | Meaning |
|---|---|
| **Engine** | The code that knows the rules (`src/engine/`). |
| **State** | Everything about the game at one moment, as plain data (`GameState`). |
| **Move** | One action a player takes (`{ type: 'buy', slot: 2 }`). |
| **`applyMove`** | Takes a state and a move, returns the next state, or refuses with a `RuleError`. |
| **Immutable** | Never changed in place; changes produce a new copy (Immer does this for us). |
| **Derived value** | Something computed from the state instead of stored in it (`available`, `moveOptions`). |
| **Pending** | A choice the player must make before anything else (`state.pending`). |
| **Seed / seeded RNG** | A number that makes "random" results repeatable. |
| **Invariant** | Something that must always be true, checked after every move in the bot games. |
| **Dispatch** | The UI function that sends a move to the engine. |
