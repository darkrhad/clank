# AI prompts for the card parts

Everything on a card except the picture. Make each part once: it is used on every card.
Save it here under the file name in the table (`.png` for parts that need transparency,
otherwise `.png`, `.jpg` or `.webp`). Open the game with `#studio` (or "Card studio" on
the setup screen) to see all cards with your parts; missing parts stay drawn.

## Style block (paste at the start of every prompt)

> Fantasy board-game card component, painted digital art matching a dark stone dungeon
> theme, warm torchlight from the top left, crisp clean edges, high detail, front view,
> perfectly straight and flat, no perspective. No text, no letters, no numbers, no
> watermark, no signature.

Negative prompt (if your tool has one): `text, letters, numbers, watermark, signature,
perspective, tilt, shadow on background, extra objects`

**Transparency:** the parts marked "transparent" must have a transparent background.
Ask for "transparent background PNG". If your tool can't do that, ask for a plain flat
pure white background and remove it afterwards (Photoshop, remove.bg, or ask me, I can
do it with a script).

**Same look for all:** make the parts in one session with the same tool, style and seed.
Generate the 6 banners together (or one, then recolor it).

## Frame and surfaces

| File | Size (px) | Prompt (after the style block) |
|---|---|---|
| `frame.png` | 750 × 1050 | A rectangular card frame of dark grey carved stone with rounded corners, a border of even thickness all around (about 7% of the width), subtle chiseled detail and worn edges. The whole inside is empty. **Transparent** inside and outside the frame |
| `stone.png` | 800 × 600 | A dim, plain dungeon stone wall in soft grey light, slightly blurred, no objects. Used behind cards without art |
| `parchment.png` | 800 × 500 | A blank aged parchment paper texture, light tan, soft worn darker edges, evenly lit, nothing written |
| `back.png` | 750 × 1050 | The back of a fantasy dungeon card: a dark stone surface with an ornate carved emblem of a dragon's head in the center, gold accents, symmetrical |

## Banners (one per card type)

All 1200 × 200, **transparent** background. The game writes the card name in the middle,
and puts the points hexagon on the right end, so keep the center plain.

| File | Used on | Prompt |
|---|---|---|
| `banner-blue.png` | Dungeon cards | A long horizontal fabric ribbon banner with folded tails at both ends, **slate blue** cloth with a soft vertical gradient and a thin darker trim, blank |
| `banner-red.png` | Monsters | The same ribbon banner in **deep crimson red** |
| `banner-purple.png` | Devices | The same ribbon banner in **royal purple** |
| `banner-gold.png` | Reserve (Mercenary, Explore) | The same ribbon banner in **antique gold** |
| `banner-yellow.png` | Secret Tome | The same ribbon banner in **bright golden yellow** |
| `banner-grey.png` | Starting cards | The same ribbon banner in **cool steel grey** |

## Bars and small plates

| File | Size (px) | Prompt |
|---|---|---|
| `tab.png` | 400 × 80 | A small blank black label plate with a thin bevelled edge, slightly rounded corners. **Transparent** background |
| `strip.png` | 1200 × 120 | A blank dark charcoal band with a thin gold line along its top edge, subtle texture. Used for DANGER / ARRIVE |
| `acquire.png` | 1200 × 100 | A blank dark navy blue bar with a thin pale steel line along its top edge, subtle texture. Used for ACQUIRE |
| `cost.png` | 300 × 300 | A right triangle in the lower-right corner, glossy blue enamel with a bright highlight on its long edge, blank. The top-left half is **transparent** |

## Symbols

All 256 × 256, **transparent** background, the symbol filling most of the square, centered.
The game writes the numbers on the Skill diamond, Gold coin and points hexagon, so their
centers must stay plain.

| File | Prompt |
|---|---|
| `skill.png` | A glossy light-blue crystal diamond badge (a square standing on its corner) with a thin white-and-navy rim, **blank center** |
| `sword.png` | A round red-orange enamel badge with a dark rim and a small black sword emblem, diagonal |
| `boot.png` | A rounded square yellow-orange enamel badge with a dark rim and a small black boot emblem |
| `gold.png` | A shiny pale gold coin seen from the front, **blank flat face** |
| `points.png` | A green hexagon gem badge with a lighter top edge, **blank center** |
| `heart.png` | A glossy red heart badge with a dark red outline |
| `dragon.png` | A dark purple dragon head in profile breathing fire, inside a round frame of orange flames, emblem |
| `danger.png` | An orange heraldic shield badge with a white plus sign in the middle |
| `arrive.png` | A small grey stone square badge with a white exclamation mark |
| `companion.png` | A white person silhouette (head and shoulders) inside a dark circle with a white rim |

## Order to make them in

The biggest change first: `parchment`, `banner-blue`, `banner-red`, `frame`, then the
symbols `skill`, `sword`, `boot`, `gold`. Everything else is a finishing touch.
