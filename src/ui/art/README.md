# Card artwork

One image per card, named after the card id: `monkeyBot.png`, `crystalGolem.jpg`, ...
Formats: .jpg, .jpeg, .png or .webp. The ids are the keys of `DUNGEON_DECK` (and
`burgle`, `stumble`, `sidestep`, `scramble`, `mercenary`, `explore`, `secretTome`,
`goblin`) in `src/engine/cards.ts`.

The image fills the card's picture area, a 4:3 window (e.g. 480 x 360 px), cropped
to fit if the shape differs. Keep the left edge and the bottom-right corner fairly
plain: the Skill / Sword / Boot symbols and the dragon badge are drawn on top there.

Cards without an image show the plain stone background. No code changes needed:
add or replace a file and reload.
