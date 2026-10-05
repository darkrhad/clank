# Clank! demo

A private, single-screen demo of the board game *Clank!* (Dire Wolf / Renegade),
built from the rulebook to learn how to turn a board game into a React game.
Not for publishing: the board image and card names belong to the publisher.

```sh
npm install
npm run dev     # http://localhost:5173
npm test        # rules tests + 50 simulated games
npm run build
```

## Playing against the AI

On the setup screen, each seat can be **Human** or **AI: Easy / Medium / Hard**. With only AIs
you watch them play; **Pause** and the speed setting are in the top bar.

- **Easy**: knows the goal, plays sloppily (nearest Artifact, ignores noise and damage).
- **Medium**: plans routes, picks Artifacts by value and distance, blocks monsters, heals.
- **Hard**: weighs risk (dragon, health, time) and leaves early to start the countdown.

In bot tournaments (`npx vitest run src/ai`), Medium beats Easy 59 to 1, Hard beats Medium 58 to 22.

## How it's organized

| Folder | What | Depends on React? |
|---|---|---|
| `src/engine/` | The rules: game state, cards, map, `applyMove(state, move)` | no |
| `src/ai/` | AI players: route planning and strategy per level | no |
| `src/ui/` | Screens: board, hand, Dungeon Row, dialogs | yes |

- `engine/types.ts`: the whole game state as plain data, and every possible move
- `engine/cards.ts`, `engine/secrets.ts`, `engine/map.ts`: game content as data
- `engine/setup.ts`: a new game; `engine/engine.ts`: the rules; `engine/scoring.ts`: the end
- `engine/rng.ts`: seeded random numbers, so a game can be replayed exactly
- `engine/*.test.ts`: one test per rule, plus bots playing complete games
- `assets/deck1-5.jpeg`: photos of the 100 Dungeon cards that `cards.ts` was read from (local only, not in the repo)

## Differences from the real game

- **Secret token mix:** the totals are from the rulebook (11 major, 18 minor), the mix is assumed.
- **Starting deck:** Sidestep and Scramble values are assumed.
- Only the front side of the board.
