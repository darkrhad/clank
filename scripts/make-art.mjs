// Makes card art with Draw Things (local, free) through its HTTP API.
//
//   npm run make-art -- burgle stumble          specific cards
//   npm run make-art -- start                   the Starting deck and Reserve
//   npm run make-art -- all                     every card in PROMPTS.md
//   options: --versions 3   versions per card (default 2)
//            --force        also replace cards that already have art
//            --seed 5000    other seeds = other pictures
//            --style "..."  try another style block (instead of the one in PROMPTS.md)
//            --negative "…" extra things to avoid, added to the negative prompt
//            --tag hand     a trial: saved as art-review/<id>-hand-1.jpg …, never put in the game
//            --set vi       another art set: prompts from src/ui/art/vi/PROMPTS.md, art saved
//                           in src/ui/art/vi/ and art-review/vi/
//
// Prompts come from src/ui/art/PROMPTS.md (style block + one line per card).
// Every version is saved in art-review/ (<id>-1.jpg, <id>-2.jpg …); version 1
// goes to src/ui/art/<id>.jpg unless that card already has art. To pick
// another version, copy it over src/ui/art/<id>.jpg.
//
// Needs Draw Things running with its API server on (HTTP, port 7860) and an
// SDXL model loaded. Generates at 1024 x 768, saves 512 x 384 JPEG (macOS sips).

import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const args = process.argv.slice(2);
const setAt = args.indexOf('--set');
const set = setAt >= 0 ? args.splice(setAt, 2)[1] : '';
const ART = join(ROOT, 'src/ui/art', set);
const REVIEW = join(ROOT, 'art-review', set);
const API = process.env.DRAW_THINGS_URL ?? 'http://127.0.0.1:7860';

const START = ['burgle', 'stumble', 'sidestep', 'scramble', 'mercenary', 'explore', 'secretTome', 'goblin'];
const NEGATIVE = 'text, letters, numbers, watermark, signature, frame, border, white border, blank paper margin, blurry, extra limbs, deformed hands, 3d render, photorealistic, smooth digital painting, glossy, airbrushed';
const SETTINGS = { width: 1024, height: 768, steps: 8, guidance_scale: 2.5, batch_size: 1 }; // SDXL Turbo
const SIZE = { width: 512, height: 384 };

// ---------- read PROMPTS.md ----------
const md = readFileSync(join(ART, 'PROMPTS.md'), 'utf8');
const styleSection = md.split('## Style block')[1]?.split('\n## ')[0] ?? '';
const style = styleSection.split('\n').filter((l) => l.startsWith('>')).map((l) => l.replace(/^>\s?/, '')).join(' ').trim();
const subjects = Object.fromEntries([...md.matchAll(/^\| `(\w+)` \| (.+?) \|$/gm)].map((m) => [m[1], m[2]]));
if (!style || !Object.keys(subjects).length) throw new Error('Could not read the style block or card prompts from PROMPTS.md');

// ---------- arguments ----------
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args.splice(i, 2)[1] : fallback;
};
const force = args.includes('--force') && args.splice(args.indexOf('--force'), 1);
const versions = Number(option('versions', 2));
const styleText = option('style', style);
const negative = [NEGATIVE, option('negative', '')].filter(Boolean).join(', ');
const tag = option('tag', '');
const seedBase = Number(option('seed', 1000));
const ids = args.flatMap((a) => (a === 'start' ? START : a === 'all' ? Object.keys(subjects) : [a]));
if (!ids.length) {
  console.log('Which cards? e.g. npm run make-art -- start   or   npm run make-art -- orcGrunt ogre');
  process.exit(1);
}
const unknown = ids.filter((id) => !subjects[id]);
if (unknown.length) throw new Error(`No prompt in PROMPTS.md for: ${unknown.join(', ')}`);

// ---------- generate ----------
const hasArt = (id) => readdirSync(ART).some((f) => f.replace(/\.\w+$/, '') === id && /\.(jpe?g|png|webp)$/.test(f));
// The same card and version always gets the same seed, so a run can be repeated
const seedFor = (id, v) => seedBase + [...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 100000, 0) + v * 7919;

async function generate(id, v) {
  const body = { ...SETTINGS, prompt: `${subjects[id]}. ${styleText}`, negative_prompt: negative, seed: seedFor(id, v) };
  const res = await fetch(`${API}/sdapi/v1/txt2img`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Draw Things answered ${res.status}: ${await res.text()}`);
  const { images } = await res.json();
  const name = tag ? `${id}-${tag}-${v}` : `${id}-${v}`;
  const png = join(REVIEW, `${name}.png`);
  const jpg = join(REVIEW, `${name}.jpg`);
  writeFileSync(png, Buffer.from(images[0], 'base64'));
  execFileSync('sips', ['-z', String(SIZE.height), String(SIZE.width), '-s', 'format', 'jpeg', '-s', 'formatOptions', '82', png, '--out', jpg], { stdio: 'ignore' });
  return jpg;
}

try {
  await fetch(`${API}/sdapi/v1/options`);
} catch {
  console.error(`Draw Things doesn't answer at ${API}. Is the app open with its API server (HTTP) on?`);
  process.exit(1);
}

mkdirSync(REVIEW, { recursive: true });
const started = Date.now();
for (const id of ids) {
  const keep = !!tag || (hasArt(id) && !force);
  for (let v = 1; v <= versions; v++) {
    const t = Date.now();
    const jpg = await generate(id, v);
    if (v === 1 && !keep) copyFileSync(jpg, join(ART, `${id}.jpg`));
    console.log(`${id} version ${v}/${versions}: ${((Date.now() - t) / 1000).toFixed(0)}s${v === 1 && !tag ? (keep ? ' (already has art, kept)' : ' → src/ui/art') : ''}`);
  }
}
console.log(`Done in ${((Date.now() - started) / 60000).toFixed(1)} min. All versions are in art-review/.`);
if (!existsSync(join(ROOT, '.gitignore')) || !readFileSync(join(ROOT, '.gitignore'), 'utf8').includes('art-review')) {
  console.log('Tip: add art-review/ to .gitignore.');
}
