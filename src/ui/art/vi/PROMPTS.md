# AI art prompts for the Vietnamese starter deck

The same prompts as `../PROMPTS.md`, with Vietnamese characters, clothes and folklore that
match the Vietnamese card names. Cards without a character have no file here, so the game uses the normal art (from
`../`). Save each picture here as `<id>.jpg`.
`npm run make-art -- --set vi burgle stumble sidestep scramble mercenary explore goblin`

## Style block (paste at the end of every prompt)

> Hand-drawn fantasy illustration, loose ink outlines and pencil sketch lines, watercolor
> washes, visible brush strokes, imperfect wobbly lines, textured watercolor paper, muted
> earthy colors with warm torchlight, inside a dark underground stone dungeon, centered subject, full bleed with color reaching all
> edges, 4:3 landscape. Left edge and bottom-right corner plain. No text, no letters, no frame.

Settings and negative prompt: the same as `../PROMPTS.md`.

## Starting deck and Reserve

Vietnamese names: `burgle` Trộm vặt, `stumble` Vấp ngã, `sidestep` Né tránh, `scramble` Leo trèo, `mercenary` Lính đánh thuê, `explore` Thám hiểm, `goblin` Ma rừng.

| id | Prompt (after the style block) |
|---|---|
| `burgle` | A sly young Vietnamese thief in a worn, patched light grey áo bà ba shirt with a faded red cloth sash and ragged rolled-up trousers, barefoot, poor, crouching over an open treasure chest, gold glinting |
| `stumble` | Falling forward mid-trip in a dungeon corridor: a clumsy young Vietnamese thief in a worn, patched light grey áo bà ba shirt with a faded red cloth sash and ragged rolled-up trousers, barefoot, poor, tripping over a loose flagstone, airborne, arms flailing, a clay pot shattering on the floor beside him, coins flying |
| `sidestep` | A nimble young Vietnamese thief in a worn, patched light grey áo bà ba shirt with a faded red cloth sash and ragged rolled-up trousers, barefoot, poor, edging sideways along a narrow stone ledge, back pressed flat against the dungeon wall, one foot stepping to the side, cautious look |
| `scramble` | A young Vietnamese thief in a worn, patched light grey áo bà ba shirt with a faded red cloth sash and ragged rolled-up trousers, barefoot, poor, scrambling up a pile of rubble on hands and feet, pebbles flying |
| `mercenary` | A tough Vietnamese sellsword woman in a red warrior áo dài and a khăn vấn headwrap with a curved sword over her shoulder, smirking, arms crossed |
| `explore` | A Vietnamese explorer in a worn, patched light grey áo bà ba shirt with a faded red cloth sash and ragged rolled-up trousers, barefoot, poor, a battered conical nón lá hat on his head, holding a torch high at the mouth of a dark tunnel, light spilling ahead |
| `goblin` | Inside a dark stone dungeon corridor: a small, sneaky ma rừng forest ghost from Vietnamese folklore, waist-high, hunched, floating above the floor with a wispy smoky lower body, pale grey-green skin, long wild tangled black hair, narrow glowing yellow eyes and a toothy sly smirk, a ragged robe of dead leaves and vines, a crooked dagger in one hand, guarding a coin pouch |

`goblin` was made with `--seed 3000 --negative "skull, skeleton, cute, chibi, child"`.

No character, so the normal art is used: `secretTome` (Bí kíp).

## Companions

Vietnamese names: `rebelCaptain` Đội trưởng Tây Sơn, `rebelScout` Thám báo Tây Sơn, `rebelSoldier` Lính Tây Sơn, `rebelMiner` Thợ mỏ Tây Sơn, `tunnelGuide` Người dẫn đường, `treasureHunter` Thợ săn kho báu, `gemCollector` Người sưu tầm ngọc, `theDuke` Quan lớn, `masterBurglar` Siêu trộm, `clericOfTheSun` Nữ tu Mặt Trời, `wizard` Thầy pháp, `invoker` Người gọi hồn, `archaeologist` Nhà khảo cổ, `apothecary` Thầy thuốc nam, `dwarvenPeddler` Người bán rong, `koboldMerchant` Thương nhân thằn lằn, `mountainKing` Sơn Tinh, `queenOfHearts` Âu Cơ.

| id | Prompt (after the style block) |
|---|---|
| `rebelCaptain` | A stout Tây Sơn rebel captain from 18th-century Vietnam in a faded brown military tunic with a red sash and a cloth headwrap, a curved saber at the hip |
| `rebelScout` | A young Vietnamese man, a Tây Sơn rebel scout from 18th-century Vietnam, in a worn indigo tunic and a cloth headwrap, barefoot, crouched low on a dungeon floor, studying fresh footprints in the dust |
| `rebelSoldier` | A Vietnamese Tây Sơn rebel soldier from 18th-century Vietnam, bare head with a red cloth headwrap, no helmet, faded red tunic, a long-handled glaive and a round woven rattan shield, battle-ready |
| `rebelMiner` | A burly Vietnamese miner in a patched brown shirt and a red headband, an oil lamp on his belt, pickaxe on his shoulder, sooty face |
| `tunnelGuide` | An old Vietnamese guide in a worn áo bà ba shirt and a battered conical nón lá hat squinting at a crumpled map, lantern hanging from his belt |
| `treasureHunter` | An adventurous young Vietnamese woman in a dark áo bà ba shirt and a red khăn rằn scarf with a lantern and a slim sword, backpack |
| `gemCollector` | A Vietnamese girl in a faded red áo tứ thân dress and a headscarf carrying a sack, a tiny baby Vietnamese dragon peeking out |
| `theDuke` | A pompous Vietnamese mandarin in an embroidered blue silk robe and a black winged mandarin hat, rings on every finger, counting coins |
| `masterBurglar` | A Vietnamese burglar in a dark áo bà ba shirt with a black scarf over his face dangling from a rope upside down, reaching for something |
| `clericOfTheSun` | A serene Vietnamese priestess in white and gold áo dài robes with arms open, warm sunlight around her |
| `wizard` | An old Vietnamese thầy pháp sorcerer with a long white beard in a faded yellow priest robe and a black headwrap, a staff topped by a flame, incense smoke, a stack of books |
| `invoker` | A Vietnamese spirit medium in a red and gold ceremonial robe and headdress holding a glowing blue orb of spirit light between both hands, incense smoke |
| `archaeologist` | An old Vietnamese scholar in a dark blue áo dài and a black khăn đóng turban, white moustache, cradling a golden idol |
| `apothecary` | A young Vietnamese herbal healer in a brown áo bà ba shirt holding up two clay medicine bottles, shelves of dried herbs and roots |
| `dwarvenPeddler` | A cheerful Vietnamese street vendor woman in a conical nón lá hat kneeling by a bamboo shoulder pole with two baskets full of trinkets |
| `koboldMerchant` | A small lizard-like kobold merchant wearing a tiny conical nón lá hat and a little áo bà ba shirt, a huge backpack of rolled scrolls and goods |
| `mountainKing` | Sơn Tinh, the mountain god of Vietnamese legend, a regal man with a long black beard and a golden crown in ancient green and gold royal robes on a stone throne, a large sword beside him |
| `queenOfHearts` | Âu Cơ, the fairy mother of Vietnamese legend, a graceful woman with long black hair and a golden crown in a flowing red and white ancient silk dress, hands on her hips, confident |

No Vietnamese person, so the normal art is used: `monkeyBot` (Khỉ máy), `misterWhiskers` (Ông Mèo).

## Actions

Vietnamese names: `swagger` Vênh váo, `tattle` Mách lẻo, `sleightOfHand` Khéo tay, `search` Lục soát, `brilliance` Lóe sáng, `underworldDealing` Giao dịch ngầm.

| id | Prompt (after the style block) |
|---|---|
| `swagger` | Running a comb through his hair with a big cocky grin, chest puffed out, inside a dark stone dungeon corridor: a young Vietnamese rogue in a worn, patched light grey áo bà ba shirt with a faded red sash, barefoot |
| `tattle` | Whispering behind their hands inside a dark stone dungeon corridor: two Vietnamese thieves in faded áo bà ba shirts and conical nón lá hats leaning close, gossiping, one pointing at someone out of frame |
| `sleightOfHand` | A Vietnamese woman thief in a dark áo bà ba shirt and a khăn rằn scarf flipping a gold coin across her knuckles, close-up of quick hands |
| `search` | On one knee, palms pressed to the stone floor, feeling for a hidden latch between the flagstones, inside a dark stone dungeon corridor: a Vietnamese thief in a worn, patched light grey áo bà ba shirt with a faded red sash, barefoot, a coin pouch nearby |
| `brilliance` | Raising one finger with a sudden bright idea, a small glowing magical spark of light floating just above his fingertip, inside a dark stone dungeon corridor: a bearded Vietnamese rogue in a worn, patched light grey áo bà ba shirt with a faded red sash, barefoot, sly grin |
| `underworldDealing` | A shady hooded Vietnamese black-market dealer in a dark áo bà ba shirt and a khăn rằn scarf behind a cluttered low wooden table of potions, books and coins, shady deal |

More actions (`deadRun` Chạy thục mạng, `sneak` Lẻn):

| id | Prompt (after the style block) |
|---|---|
| `deadRun` | Sprinting at full speed down a dark stone dungeon corridor, dust trailing, red sash flying: a Vietnamese thief in a worn, patched light grey áo bà ba shirt with a faded red sash, ragged rolled-up trousers, barefoot |
| `sneak` | Creeping in deep shadow inside a dark stone dungeon corridor, only the eyes lit: a masked Vietnamese rogue in a dark áo bà ba shirt with a black khăn rằn scarf wrapped over his face, barefoot |

## Monsters

Vietnamese names: `orcGrunt` Quỷ canh cổng, `crystalGolem` Người đá ngọc, `kobold` Thằn lằn tinh, `overlord` Chúa quỷ, `animatedDoor` Cửa ma, `belcher` Cóc Tinh, `ogre` Chằn tinh, `caveTroll` Quỷ hang.

| id | Prompt (after the style block) |
|---|---|
| `orcGrunt` | A green-skinned horned quỷ demon gate guard from Vietnamese folklore in rusty ancient Vietnamese armor, a crude sword, snarling |
| `crystalGolem` | A hulking golem made of green jade and stone shards, roaring, jade glowing |
| `kobold` | A small yellow lizard spirit from Vietnamese folklore with a tiny knife and a round woven rattan shield, trying to look scary |
| `overlord` | A sinister purple-skinned horned demon lord from Vietnamese folklore in a black and gold ancient royal robe, floating with glowing pink magic in one hand |
| `animatedDoor` | An old red lacquered Vietnamese temple door with an angry face, teeth and a brass knocker for a nose |
| `belcher` | A fat orange toad spirit from Vietnamese folklore wearing a tiny red headwrap, a huge open mouth, mid-burp |
| `ogre` | Chằn Tinh, the huge ogre from the Vietnamese legend of Thạch Sanh, scaly skin and fangs, in a ragged loincloth, scratching his head, confused, holding a club |
| `caveTroll` | A massive yellow-skinned horned cave demon from Vietnamese folklore leaping forward with a stone hammer |

Not Vietnamese folklore, so the normal art is used: `watcher` (Kẻ canh chừng).
