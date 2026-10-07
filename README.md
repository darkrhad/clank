# Loảng xoảng!

A deck-building dungeon game with a Vietnamese twist, in English and Vietnamese
(EN | VI switch). The rules follow the board game *Clank!* (Dire Wolf / Renegade), which
this started as a learning project for; the board, the card art and the names are our own.

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
- `src/i18n/`: English and Vietnamese texts (`en.ts`, `vi.ts`, `cardsVi.ts`) and the EN | VI switch
- `src/ui/art/`, `src/ui/parts/`: card art and painted parts (board, tiles, tokens…); `#studio` shows them all
- `scripts/make-art.mjs` (`npm run make-art`): card art with Draw Things, see `src/ui/art/PROMPTS.md`
- `assets/`: local only, never published: photos of the cards, the original board and the rulebook

## Deploy (Vercel)

Import the GitHub repo on vercel.com; `vercel.json` sets the build (`npm run build` → `dist/`).
Every push to `main` redeploys. With the Vercel CLI, `.vercelignore` keeps `assets/` and
`art-review/` out of the upload.

## Differences from the real game

- **Secret token mix:** the totals are from the rulebook (11 major, 18 minor), the mix is assumed.
- **Starting deck:** Sidestep and Scramble values are assumed.
- Only the front side of the board.
