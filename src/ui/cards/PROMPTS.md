# Full-card prompts

AI makes the whole card (picture, frame, banner and empty slots); the game writes
the name, numbers and text on top. Save each image as `src/ui/cards/<id>.png`
(or .jpg / .webp), 750 x 1050 px or any 5:7 size.

**Use `layout-template.png` as the layout / structure reference** (image prompt,
"use as reference", ControlNet or image-to-image, depending on your tool), so every
card has its slots in the same places. `layout-guide.png` is the same with labels,
for you. The game writes text at exactly these positions (`src/ui/cardLayout.ts`).

## Shared prompt (paste first, every time)

> A single fantasy board-game card, front view, perfectly straight and flat, filling the
> whole image edge to edge, portrait 5:7. Follow the layout of the reference image
> exactly. Thick dark grey carved stone frame with rounded corners. Top: a ribbon banner
> across the card. Upper half: a painted picture window. Lower part: a parchment text
> box. Every banner, tab, badge, strip, bar and text box is EMPTY: no text, no letters,
> no numbers, no words anywhere. Symbol style: Skill = glossy light-blue diamond with a
> blank center; Sword = red-orange circle with a small black sword; Boot = yellow-orange
> rounded square with a black boot; points = green hexagon with a blank center. Painted
> digital art, warm torchlight, crisp edges, high detail.

Negative prompt (if your tool has one): `text, letters, numbers, words, watermark,
signature, tilted, perspective, extra symbols`

## Per card (paste after the shared prompt)

### `burgle` · Burgle
> Frame: grey-blue banner and matching accents. Banner: blank, no hexagon. No tab under the banner. Picture: A sly young thief in a hooded leather coat crouching over an open treasure chest, gold glinting. Left edge of the picture, top to bottom: one blank light-blue diamond. Text box: blank parchment. Bottom-right corner: empty, no triangle.

### `stumble` · Stumble
> Frame: grey-blue banner and matching accents. Banner: blank, no hexagon. No tab under the banner. Picture: A thief's boot catching on a loose flagstone, a clay pot toppling and shattering, motion blur. Left edge of the picture: no symbols. Text box: blank parchment. Bottom-right corner: empty, no triangle.

### `sidestep` · Sidestep
> Frame: grey-blue banner and matching accents. Banner: blank, no hexagon. No tab under the banner. Picture: A nimble thief pressed flat against a wall, sliding sideways past a sleeping guard. Left edge of the picture, top to bottom: one yellow Boot square. Text box: blank parchment. Bottom-right corner: empty, no triangle.

### `scramble` · Scramble
> Frame: grey-blue banner and matching accents. Banner: blank, no hexagon. No tab under the banner. Picture: A thief scrambling up a pile of rubble on hands and feet, pebbles flying. Left edge of the picture, top to bottom: one blank light-blue diamond, one yellow Boot square. Text box: blank parchment. Bottom-right corner: empty, no triangle.

### `mercenary` · Mercenary
> Frame: gold banner and matching accents. Banner: blank, no hexagon. Under the banner: a blank black tab. Picture: A tough sellsword woman with a curved sword over her shoulder, smirking, arms crossed. Left edge of the picture, top to bottom: one blank light-blue diamond, two red Sword circles. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `explore` · Explore
> Frame: gold banner and matching accents. Banner: blank, no hexagon. No tab under the banner. Picture: An explorer holding a torch high at the mouth of a dark tunnel, light spilling ahead. Left edge of the picture, top to bottom: one blank light-blue diamond, one yellow Boot square. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `secretTome` · Secret Tome
> Frame: bright yellow-gold banner and matching accents. Banner: blank, with a blank green hexagon at its right end. No tab under the banner. Picture: An ancient leather-bound spellbook with glowing runes on a reading stand, dust motes in the light. Left edge of the picture: no symbols. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `goblin` · Goblin
> Frame: red banner and matching accents. Banner: blank, no hexagon. Under the banner: a blank black tab. Picture: A small green goblin with a crooked dagger and an oversized helmet, grinning, guarding a coin pouch. Left edge of the picture: no symbols. Text box: blank parchment. Bottom-right corner: two red Sword circles in a row, no triangle.

### `amuletOfVigor` · Amulet of Vigor
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. No tab under the banner. Picture: A red heart-shaped gemstone amulet on a stone altar, pulsing with healing red light. Left edge of the picture, top to bottom: one blank light-blue diamond. Text box: blank parchment. Bottom: a blank dark navy bar across the card. Bottom-right corner: a blank blue triangle.

### `sleightOfHand` · Sleight of Hand
> Frame: blue banner and matching accents. Banner: blank, no hexagon. No tab under the banner. Picture: A hooded woman flipping a gold coin across her knuckles, close-up of quick hands. Left edge of the picture: no symbols. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `luckyCoin` · Lucky Coin
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. No tab under the banner. Picture: A single shining gold coin standing on its edge on a stone floor, a small spotlight on it. Left edge of the picture, top to bottom: one blank light-blue diamond. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `swagger` · Swagger
> Frame: blue banner and matching accents. Banner: blank, no hexagon. No tab under the banner. Picture: A cocky young rogue running a comb through his hair, chest out, big grin. Left edge of the picture, top to bottom: one blank light-blue diamond, one yellow Boot square. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `tattle` · Tattle
> Frame: blue banner and matching accents. Banner: blank, no hexagon. No tab under the banner. Picture: Two thieves whispering behind their hands and pointing at someone out of frame, gossiping. Left edge of the picture, top to bottom: one blank light-blue diamond. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `moveSilently` · Move Silently
> Frame: blue banner and matching accents. Banner: blank, no hexagon. No tab under the banner. Picture: Close-up of soft leather boots tiptoeing across a stone floor, shadows, hush. Left edge of the picture, top to bottom: two yellow Boot squares. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `search` · Search
> Frame: blue banner and matching accents. Banner: blank, no hexagon. No tab under the banner. Picture: A hooded thief on one knee feeling along the floor for a hidden latch, a coin pouch nearby. Left edge of the picture, top to bottom: one blank light-blue diamond, one yellow Boot square. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `singingSword` · Singing Sword
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. No tab under the banner. Picture: An elegant sword hovering in the air with glowing musical notes swirling around the blade. Left edge of the picture, top to bottom: one blank light-blue diamond, two red Sword circles. Bottom-right of the picture: a dark purple dragon head in a ring of orange flames. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `treasureMap` · Treasure Map
> Frame: blue banner and matching accents. Banner: blank, no hexagon. No tab under the banner. Picture: A weathered treasure map on a stone ledge, red X marks and dotted paths, candlelight. Left edge of the picture: no symbols. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `bootsOfSwiftness` · Boots of Swiftness
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. No tab under the banner. Picture: A pair of copper-and-leather boots with flame patterns and small wings at the heels. Left edge of the picture, top to bottom: three yellow Boot squares. Text box: blank parchment. Bottom: a blank dark navy bar across the card. Bottom-right corner: a blank blue triangle.

### `wandOfRecall` · Wand of Recall
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. No tab under the banner. Picture: A slender wand with a glowing blue crystal tip lying on a stone slab, faint blue sparks. Left edge of the picture, top to bottom: one blank light-blue diamond. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `deadRun` · Dead Run
> Frame: blue banner and matching accents. Banner: blank, no hexagon. No tab under the banner. Picture: A thief sprinting at full speed down a corridor, dust trailing, cape flying. Left edge of the picture, top to bottom: two yellow Boot squares. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `scepterOfTheApeLord` · Scepter of the Ape Lord
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. No tab under the banner. Picture: A golden scepter made of stacked carved monkeys on a stone pedestal. Left edge of the picture, top to bottom: one blank light-blue diamond. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `silverSpear` · Silver Spear
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. No tab under the banner. Picture: A silver spear with an ornate leaf-shaped head mounted on a wall bracket. Left edge of the picture, top to bottom: three red Sword circles. Text box: blank parchment. Bottom: a blank dark navy bar across the card. Bottom-right corner: a blank blue triangle.

### `flyingCarpet` · Flying Carpet
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. No tab under the banner. Picture: A red patterned flying carpet floating above the dungeon floor, gold tassels. Left edge of the picture, top to bottom: two yellow Boot squares. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `underworldDealing` · Underworld Dealing
> Frame: blue banner and matching accents. Banner: blank, no hexagon. No tab under the banner. Picture: A hooded goblin merchant behind a cluttered desk of potions, books and coins, shady deal. Left edge of the picture: no symbols. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `bracersOfAgility` · Bracers of Agility
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. No tab under the banner. Picture: A pair of polished bronze bracers with engraved swirls on a stone block. Left edge of the picture: no symbols. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `pickaxe` · Pickaxe
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. No tab under the banner. Picture: A miner's pickaxe leaning on a rock wall with gold nuggets at its tip. Left edge of the picture, top to bottom: two red Sword circles. Bottom-right of the picture: a dark purple dragon head in a ring of orange flames. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `elvenBoots` · Elven Boots
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. No tab under the banner. Picture: Elegant green elven boots with silver leaf embroidery on a mossy stone. Left edge of the picture, top to bottom: one blank light-blue diamond, one yellow Boot square. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `wandOfWind` · Wand of Wind
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. No tab under the banner. Picture: A twisted wooden wand releasing a swirling gust of wind and leaves. Left edge of the picture: no symbols. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `sneak` · Sneak
> Frame: blue banner and matching accents. Banner: blank, no hexagon. No tab under the banner. Picture: A masked rogue in a dark green cloak creeping in deep shadow, only the eyes lit. Left edge of the picture, top to bottom: one blank light-blue diamond, one yellow Boot square. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `elvenCloak` · Elven Cloak
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. No tab under the banner. Picture: A green elven cloak hanging on a hook, shimmering and half-transparent, blending into the wall. Left edge of the picture, top to bottom: one blank light-blue diamond. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `elvenDagger` · Elven Dagger
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. No tab under the banner. Picture: An elven dagger with a curved runed blade and a green-wrapped hilt, on stone. Left edge of the picture, top to bottom: one blank light-blue diamond, one red Sword circle. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `brilliance` · Brilliance
> Frame: blue banner and matching accents. Banner: blank, no hexagon. No tab under the banner. Picture: A bearded rogue with a sly grin tapping his temple, a lightbulb-like spark of an idea. Left edge of the picture: no symbols. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `monkeyBot` · MonkeyBot 3000
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: A clunky copper robot shaped like a monkey with cymbals for ears, glowing red eyes. Left edge of the picture: no symbols. Bottom-right of the picture: a dark purple dragon head in a ring of orange flames. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `rebelCaptain` · Rebel Captain
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: A stout dwarf captain in a grey military coat with gold epaulettes, saber at the hip. Left edge of the picture, top to bottom: one blank light-blue diamond. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `rebelScout` · Rebel Scout
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: A young dwarf scout crouched low, studying fresh tracks on the ground. Left edge of the picture, top to bottom: two yellow Boot squares. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `rebelSoldier` · Rebel Soldier
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: A dwarf soldier with a big axe and a round shield, braided red beard, battle-ready. Left edge of the picture, top to bottom: two red Sword circles. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `rebelMiner` · Rebel Miner
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: A burly dwarf miner with a helmet lamp, pickaxe on his shoulder, sooty face. Left edge of the picture: no symbols. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `tunnelGuide` · Tunnel Guide
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: A dwarf guide squinting at a crumpled map, lantern hanging from his belt. Left edge of the picture, top to bottom: one red Sword circle, one yellow Boot square. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `treasureHunter` · Treasure Hunter
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: An adventurous young woman with a lantern and a rapier, red scarf, backpack. Left edge of the picture, top to bottom: one blank light-blue diamond, two red Sword circles. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `gemCollector` · Gem Collector
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: A girl in a red hooded cape carrying a sack, a tiny baby dragon peeking out. Left edge of the picture, top to bottom: one blank light-blue diamond. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `theDuke` · The Duke
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: A pompous nobleman in a red velvet coat and blue cape, rings on every finger, counting coins. Left edge of the picture, top to bottom: one blank light-blue diamond, two red Sword circles. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `masterBurglar` · Master Burglar
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: A masked burglar dangling from a rope upside down, reaching for something. Left edge of the picture, top to bottom: one blank light-blue diamond. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `clericOfTheSun` · Cleric of the Sun
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: A serene cleric in white and gold robes with arms open, warm sunlight around her. Left edge of the picture, top to bottom: one blank light-blue diamond, one red Sword circle. Text box: blank parchment. Bottom: a blank dark navy bar across the card. Bottom-right corner: a blank blue triangle.

### `wizard` · Wizard
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: An old wizard with a long beard and a staff topped by a flame, a stack of books. Left edge of the picture, top to bottom: one blank light-blue diamond. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `invoker` · Invoker of the Ancients
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: A robed mage holding a glowing blue orb of ancient magic between both hands. Left edge of the picture: no symbols. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `archaeologist` · Archaeologist
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: An old archaeologist with a pith helmet and white moustache cradling a golden idol. Left edge of the picture, top to bottom: one blank light-blue diamond. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `apothecary` · Apothecary
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: A young apothecary in a blue apron holding up two potion bottles, shelves of herbs. Left edge of the picture: no symbols. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `dwarvenPeddler` · Dwarven Peddler
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: A cheerful dwarf trader kneeling by an open chest full of trinkets. Left edge of the picture, top to bottom: one yellow Boot square. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `misterWhiskers` · Mister Whiskers
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: A small ginger cat sitting proudly in the middle of a dungeon floor, mischievous eyes. Left edge of the picture: no symbols. Bottom-right of the picture: a dark purple dragon head in a ring of orange flames. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `koboldMerchant` · Kobold Merchant
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: A small lizard-like kobold merchant with a huge backpack of rolled scrolls and goods. Left edge of the picture, top to bottom: one blank light-blue diamond. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `mountainKing` · The Mountain King
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: A regal dwarf king with a golden crown on a stone throne, a large sword beside him. Left edge of the picture, top to bottom: one blank light-blue diamond, one red Sword circle with a small white plus sign, one yellow Boot square with a small white plus sign. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `queenOfHearts` · The Queen of Hearts
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: A glamorous red-haired queen in a red and white gown, hands on her hips, confident. Left edge of the picture, top to bottom: one blank light-blue diamond, one red Sword circle. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `sapphire` · Sapphire
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: A large faceted blue sapphire resting on purple velvet folds, sparkling. Left edge of the picture: no symbols. Bottom-right of the picture: a dark purple dragon head in a ring of orange flames. Text box: blank parchment. Bottom: a blank dark navy bar across the card. Bottom-right corner: a blank blue triangle.

### `emerald` · Emerald
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: A large rectangular-cut green emerald on purple velvet, glowing. Left edge of the picture: no symbols. Bottom-right of the picture: a dark purple dragon head in a ring of orange flames. Text box: blank parchment. Bottom: a blank dark navy bar across the card. Bottom-right corner: a blank blue triangle.

### `ruby` · Ruby
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: A large faceted red ruby on purple velvet, deep red reflections. Left edge of the picture: no symbols. Bottom-right of the picture: a dark purple dragon head in a ring of orange flames. Text box: blank parchment. Bottom: a blank dark navy bar across the card. Bottom-right corner: a blank blue triangle.

### `diamond` · Diamond
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: A large brilliant-cut diamond on purple velvet, rainbow sparkles. Left edge of the picture: no symbols. Bottom-right of the picture: a dark purple dragon head in a ring of orange flames. Text box: blank parchment. Bottom: a blank dark navy bar across the card. Bottom-right corner: a blank blue triangle.

### `dragonsEye` · Dragon's Eye
> Frame: blue banner and matching accents. Banner: blank, with a blank green hexagon at its right end. Under the banner: a blank black tab. Picture: A glowing orange orb with a slit pupil like a dragon's eye on velvet, fiery. Left edge of the picture: no symbols. Bottom-right of the picture: a dark purple dragon head in a ring of orange flames. Text box: blank parchment. Bottom: a blank dark navy bar across the card. Bottom-right corner: a blank blue triangle.

### `ladder` · Ladder
> Frame: purple banner and matching accents. Banner: blank, no hexagon. Under the banner: a blank black tab. Picture: A sturdy wooden ladder leading down into a hole in the dungeon floor, light from below. Left edge of the picture: no symbols. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `teleporter` · Teleporter
> Frame: purple banner and matching accents. Banner: blank, no hexagon. Under the banner: a blank black tab. Picture: A golden mirror frame with wings, its surface a swirling blue magic portal. Left edge of the picture: no symbols. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `shrine` · Shrine
> Frame: purple banner and matching accents. Banner: blank, no hexagon. Under the banner: a blank black tab. Picture: A round stone shrine with a glowing basin, ringed by melting candles. Left edge of the picture: no symbols. Bottom-right of the picture: a small grey stone badge with a white exclamation mark. Across the bottom of the picture: a blank dark strip with a thin gold top edge. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `dragonShrine` · Dragon Shrine
> Frame: purple banner and matching accents. Banner: blank, no hexagon. Under the banner: a blank black tab. Picture: A stone dragon statue with spread wings over a basin of green glowing liquid. Left edge of the picture: no symbols. Bottom-left of the picture: an orange shield badge with a white plus. Across the bottom of the picture: a blank dark strip with a thin gold top edge. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `theVault` · The Vault
> Frame: purple banner and matching accents. Banner: blank, no hexagon. Under the banner: a blank black tab. Picture: An open vault door revealing mountains of gold coins spilling onto the floor. Left edge of the picture: no symbols. Bottom-right of the picture: a dark purple dragon head in a ring of orange flames. Text box: blank parchment. Bottom-right corner: a blank blue triangle.

### `orcGrunt` · Orc Grunt
> Frame: red banner and matching accents. Banner: blank, no hexagon. Under the banner: a blank black tab. Picture: A green orc soldier in a bucket helmet with a crude sword, snarling. Left edge of the picture: no symbols. Bottom-right of the picture: a dark purple dragon head in a ring of orange flames. Text box: blank parchment. Bottom-right corner: two red Sword circles in a row, no triangle.

### `crystalGolem` · Crystal Golem
> Frame: red banner and matching accents. Banner: blank, no hexagon. Under the banner: a blank black tab. Picture: A hulking golem made of ice-blue crystal shards, roaring, crystals glowing. Left edge of the picture: no symbols. Text box: blank parchment. Bottom-right corner: three red Sword circles in a row, no triangle.

### `kobold` · Kobold
> Frame: red banner and matching accents. Banner: blank, no hexagon. Under the banner: a blank black tab. Picture: A small yellow kobold with a tiny knife and a wooden shield, trying to look scary. Left edge of the picture: no symbols. Bottom-right of the picture: a dark purple dragon head in a ring of orange flames. Bottom-left of the picture: an orange shield badge with a white plus. Across the bottom of the picture: a blank dark strip with a thin gold top edge. Text box: blank parchment. Bottom-right corner: one red Sword circle, no triangle.

### `overlord` · Overlord
> Frame: red banner and matching accents. Banner: blank, no hexagon. Under the banner: a blank black tab. Picture: A sinister purple-skinned sorcerer floating with glowing pink magic in one hand. Left edge of the picture: no symbols. Bottom-right of the picture: a small grey stone badge with a white exclamation mark. Across the bottom of the picture: a blank dark strip with a thin gold top edge. Text box: blank parchment. Bottom-right corner: two red Sword circles in a row, no triangle.

### `watcher` · Watcher
> Frame: red banner and matching accents. Banner: blank, no hexagon. Under the banner: a blank black tab. Picture: A floating pink blob creature with many yellow eyes and tentacles, grinning. Left edge of the picture: no symbols. Bottom-right of the picture: a small grey stone badge with a white exclamation mark. Across the bottom of the picture: a blank dark strip with a thin gold top edge. Text box: blank parchment. Bottom-right corner: three red Sword circles in a row, no triangle.

### `animatedDoor` · Animated Door
> Frame: red banner and matching accents. Banner: blank, no hexagon. Under the banner: a blank black tab. Picture: A wooden dungeon door with an angry face, teeth and a brass knocker for a nose. Left edge of the picture: no symbols. Bottom-right of the picture: a dark purple dragon head in a ring of orange flames. Text box: blank parchment. Bottom-right corner: one red Sword circle, no triangle.

### `belcher` · Belcher
> Frame: red banner and matching accents. Banner: blank, no hexagon. Under the banner: a blank black tab. Picture: A fat orange toad-like monster with a huge open mouth, mid-burp. Left edge of the picture: no symbols. Bottom-right of the picture: a dark purple dragon head in a ring of orange flames. Text box: blank parchment. Bottom-right corner: two red Sword circles in a row, no triangle.

### `ogre` · Ogre
> Frame: red banner and matching accents. Banner: blank, no hexagon. Under the banner: a blank black tab. Picture: A huge armored ogre scratching his head, confused, holding a club. Left edge of the picture: no symbols. Bottom-right of the picture: a dark purple dragon head in a ring of orange flames. Text box: blank parchment. Bottom-right corner: three red Sword circles in a row, no triangle.

### `caveTroll` · Cave Troll
> Frame: red banner and matching accents. Banner: blank, no hexagon. Under the banner: a blank black tab. Picture: A massive yellow-skinned cave troll leaping forward with a stone hammer. Left edge of the picture: no symbols. Bottom-right of the picture: a dark purple dragon head in a ring of orange flames. Text box: blank parchment. Bottom-right corner: four red Sword circles in a row, no triangle.
