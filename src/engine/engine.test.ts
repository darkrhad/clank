import { describe, expect, it } from 'vitest';
import { produce } from 'immer';
import { applyMove, available, dragonAttack, moveOptions, RuleError } from './engine';
import { finalScores } from './scoring';
import { createGame, MAX_HEALTH } from './setup';
import type { GameState, Move } from './types';

// ---------- helpers ----------

const game = (players = 2) => createGame(['Ann', 'Ben', 'Cat', 'Dan'].slice(0, players), 42);

// Change a state for a test (states coming out of applyMove are frozen)
const edit = (s: GameState, fn: (d: GameState) => void) => produce(s, fn);

// Current player holds exactly these cards (uids are made up for the test)
const withHand = (s: GameState, ids: string[]) =>
  edit(s, (d) => {
    d.players[d.current].hand = ids.map((id, i) => `${id}#t${i}`);
  });

const play = (s: GameState, ...moves: Move[]) => moves.reduce(applyMove, s);
const playAll = (s: GameState) => applyMove(s, { type: 'playAll' });
const me = (s: GameState) => s.players[s.current];

const expectRule = (fn: () => unknown, message: RegExp) => {
  expect(fn).toThrow(RuleError);
  expect(fn).toThrow(message);
};

// ---------- setup ----------

describe('setup', () => {
  it('deals 5 cards, places Clank! and tokens', () => {
    const s = game(2);
    expect(s.players.map((p) => p.hand.length)).toEqual([5, 5]);
    expect(s.players.map((p) => p.deck.length)).toEqual([5, 5]);
    expect(s.clankArea).toEqual({ red: 3, yellow: 2 });
    expect(s.rage).toBe(2); // 2 players start on the third space
    const tokens = Object.values(s.roomTokens).flat();
    expect(tokens.filter((t) => t.kind === 'artifact')).toHaveLength(5); // 7 minus 2
    expect(tokens.filter((t) => t.kind === 'minorSecret')).toHaveLength(18);
    expect(tokens.filter((t) => t.kind === 'idol')).toHaveLength(3);
  });

  it('starts with no Dragon Attack cards in the Dungeon Row', () => {
    for (let seed = 1; seed < 30; seed++) {
      const s = createGame(['A', 'B'], seed);
      expect(s.dungeonRow.every((c) => c && !c.startsWith('orcGrunt') && !c.startsWith('dangerMonster'))).toBe(true);
    }
  });

  it('is deterministic for the same seed', () => {
    expect(createGame(['A', 'B'], 7)).toEqual(createGame(['A', 'B'], 7));
  });
});

// ---------- cards ----------

describe('playing cards', () => {
  it('collects resources', () => {
    const s = playAll(withHand(game(), ['burgle', 'burgle', 'scramble', 'sidestep']));
    expect(available(s)).toEqual({ skill: 3, swords: 0, boots: 2 });
  });

  it('adds and removes Clank!, and leftover negative Clank! cancels later Clank!', () => {
    let s = withHand(game(), ['moveSilently', 'stumble']);
    s = play(s, { type: 'play', uid: me(s).hand[0] });
    expect(s.clankArea.red).toBe(1); // 3 at setup, -2
    expect(s.turn.clankCredit).toBe(0);
    s = play(s, { type: 'play', uid: me(s).hand[0] });
    expect(s.clankArea.red).toBe(2);

    let t = withHand(edit(game(), (d) => { d.clankArea.red = 0; }), ['moveSilently', 'stumble']);
    t = playAll(t);
    expect(t.clankArea.red).toBe(0); // the Stumble was cancelled by the leftover -2
    expect(t.turn.clankCredit).toBe(1);
  });

  it('Kobold Merchant gets +2 Skill even if the Artifact comes later', () => {
    let s = withHand(edit(game(), (d) => { d.players[0].room = 'c5'; d.roomTokens.c5 = [{ kind: 'artifact', value: 5 }]; d.turn.canTakeToken = true; }), ['koboldMerchant']);
    s = playAll(s);
    expect(available(s).skill).toBe(0);
    s = applyMove(s, { type: 'takeToken', index: 0 });
    expect(available(s).skill).toBe(2);
  });

  it('Rebel Captain draws a card when another companion is played later', () => {
    let s = withHand(game(), ['rebelCaptain', 'mercenary']);
    s = play(s, { type: 'play', uid: me(s).hand[0] });
    expect(me(s).hand).toHaveLength(1);
    s = play(s, { type: 'play', uid: me(s).hand[0] });
    expect(me(s).hand).toHaveLength(1); // drew one
    s = playAll(s);
    expect(me(s).hand).toHaveLength(0); // only once
  });

  it('Swagger counts Clank! made before and after it', () => {
    let s = withHand(game(), ['stumble', 'swagger', 'stumble']);
    s = playAll(s);
    expect(available(s).skill).toBe(2);
  });

  it('The Mountain King needs a crown', () => {
    const s = playAll(withHand(game(), ['mountainKing']));
    expect(available(s)).toMatchObject({ swords: 1, boots: 0 });
    const crowned = playAll(withHand(edit(game(), (d) => { d.players[0].tokens.push({ kind: 'crown', value: 10 }); }), ['mountainKing']));
    expect(available(crowned)).toMatchObject({ swords: 2, boots: 1 });
  });

  it('Sleight of Hand: discard a card to draw two', () => {
    let s = withHand(game(), ['sleightOfHand', 'stumble']);
    s = play(s, { type: 'play', uid: me(s).hand[0] });
    expect(s.pending).toEqual({ kind: 'discardToDraw', draw: 2 });
    expectRule(() => applyMove(s, { type: 'endTurn' }), /choice/);
    s = applyMove(s, { type: 'choose', uid: 'stumble#t1' });
    expect(me(s).hand).toHaveLength(2);
    expect(me(s).discard).toContain('stumble#t1');
    expect(s.clankArea.red).toBe(3); // the discarded Stumble had no effect
  });
});

// ---------- buying and fighting ----------

describe('Dungeon Row and Reserve', () => {
  const row = (s: GameState, cards: string[]) => edit(s, (d) => { d.dungeonRow = cards.map((c, i) => `${c}#r${i}`); });

  it('acquires a card with Skill; it goes to the discard pile', () => {
    let s = playAll(withHand(row(game(), ['elvenBoots']), ['burgle', 'burgle', 'burgle']));
    expectRule(() => applyMove(s, { type: 'buy', slot: 0 }), /needs 4 Skill/);
    s = playAll(withHand(row(game(), ['elvenBoots']), ['burgle', 'burgle', 'burgle', 'burgle']));
    s = applyMove(s, { type: 'buy', slot: 0 });
    expect(me(s).discard).toContain('elvenBoots#r0');
    expect(s.dungeonRow[0]).toBeNull();
  });

  it('fights monsters with Swords; the Goblin can be fought again', () => {
    let s = playAll(withHand(row(game(), ['orcGrunt']), ['mercenary', 'mercenary']));
    s = applyMove(s, { type: 'fight', slot: 0 });
    expect(me(s).gold).toBe(3);
    expect(s.dungeonDiscard).toContain('orcGrunt#r0');
    s = play(s, { type: 'fightGoblin' });
    expectRule(() => applyMove(s, { type: 'fightGoblin' }), /needs 2 Swords/);
    expect(me(s).gold).toBe(4);
  });

  it('Crystal Golem can only be fought in a Crystal Cave', () => {
    const s = playAll(withHand(row(game(), ['crystalGolem']), ['mercenary', 'mercenary']));
    expectRule(() => applyMove(s, { type: 'fight', slot: 0 }), /Crystal Cave/);
    const inCave = edit(s, (d) => { d.players[0].room = 'c4'; });
    expect(applyMove(inCave, { type: 'fight', slot: 0 }).turn.teleports).toBe(1);
  });

  it('a Device is used right away, not kept', () => {
    const s = applyMove(playAll(withHand(row(game(), ['ladder']), ['burgle', 'burgle', 'burgle'])), { type: 'useDevice', slot: 0 });
    expect(available(s).boots).toBe(2);
    expect(me(s).discard).not.toContain('ladder#r0');
  });

  it('buys from the Reserve', () => {
    const s = applyMove(playAll(withHand(game(), ['burgle', 'burgle'])), { type: 'buyReserve', pile: 'mercenary' });
    expect(s.reserve.mercenary).toHaveLength(14);
    expect(me(s).discard.some((c) => c.startsWith('mercenary'))).toBe(true);
  });
});

// ---------- movement ----------

describe('moving', () => {
  const at = (s: GameState, room: string, extra?: (d: GameState) => void) =>
    edit(s, (d) => { d.players[d.current].room = room; extra?.(d); });

  it('costs Boots; footprints cost two', () => {
    let s = playAll(withHand(at(game(), 'r2'), ['sidestep']));
    expect(moveOptions(s).find((o) => o.to === 'r3')).toMatchObject({ allowed: false, reason: 'Needs 2 Boots' });
    s = play(s, { type: 'move', to: 'r1' });
    expect(me(s).room).toBe('r1');
    expect(available(s).boots).toBe(0);
  });

  it('locked tunnels need a Master Key', () => {
    const s = playAll(withHand(at(game(), 'r3'), ['sidestep']));
    expectRule(() => applyMove(s, { type: 'move', to: 'r6' }), /Master Key/);
    const keyed = playAll(withHand(at(game(), 'r3', (d) => d.players[0].tokens.push({ kind: 'masterKey' })), ['sidestep']));
    expect(me(applyMove(keyed, { type: 'move', to: 'r6' })).room).toBe('r6');
  });

  it('one-way tunnels only work in their direction', () => {
    const s = playAll(withHand(at(game(), 'r4'), ['sidestep']));
    expect(moveOptions(s).map((o) => o.to)).not.toContain('r5');
    const back = playAll(withHand(at(game(), 'r5'), ['sidestep']));
    expect(moveOptions(back).map((o) => o.to)).toContain('r4');
  });

  it('entering a Crystal Cave ends Boot movement', () => {
    let s = playAll(withHand(at(game(), 'r2'), ['sidestep', 'sidestep', 'sidestep']));
    s = applyMove(s, { type: 'move', to: 'c2' });
    expect(s.turn.exhausted).toBe(true);
    expectRule(() => applyMove(s, { type: 'move', to: 'r2' }), /Crystal Cave/);
  });

  it('monster tunnels deal damage unless you use Swords', () => {
    const s = playAll(withHand(at(game(), 'c4'), ['sidestep', 'mercenary']));
    const hurt = applyMove(s, { type: 'move', to: 'm1', swords: 0 });
    expect(me(hurt).damage).toBe(2);
    expect(me(hurt).supply).toBe(27 - 2);
    const blocked = applyMove(s, { type: 'move', to: 'm1', swords: 2 });
    expect(me(blocked).damage).toBe(0);
  });

  it("can't choose monster damage that would knock you out", () => {
    const s = playAll(withHand(at(game(), 'c4', (d) => { d.players[0].damage = MAX_HEALTH - 2; }), ['sidestep']));
    expect(moveOptions(s).find((o) => o.to === 'm1')).toMatchObject({ allowed: false });
  });

  it("can't leave the dungeon without an Artifact", () => {
    const s = playAll(withHand(at(game(), 'r1'), ['sidestep']));
    expectRule(() => applyMove(s, { type: 'move', to: 'entrance' }), /without an Artifact/);
  });

  it('fountains heal 1 on entering', () => {
    const s = playAll(withHand(at(game(), 'c1', (d) => { d.players[0].damage = 3; d.players[0].supply -= 3; }), ['sidestep', 'mercenary']));
    expect(me(applyMove(s, { type: 'move', to: 'r7', swords: 1 })).damage).toBe(2);
  });
});

// ---------- tokens and market ----------

describe('tokens', () => {
  it('one token per entering; an Artifact angers the dragon; only one without a Backpack', () => {
    let s = edit(game(), (d) => {
      d.players[0].room = 'r1';
      d.roomTokens.r2 = [{ kind: 'artifact', value: 5 }, { kind: 'artifact', value: 7 }];
    });
    s = playAll(withHand(s, ['sidestep', 'sidestep', 'sidestep']));
    s = applyMove(s, { type: 'move', to: 'r2' });
    s = applyMove(s, { type: 'takeToken', index: 0 });
    expect(s.rage).toBe(3);
    expectRule(() => applyMove(s, { type: 'takeToken', index: 0 }), /each time you enter/);
    s = play(s, { type: 'move', to: 'r1' }, { type: 'move', to: 'r2' });
    expectRule(() => applyMove(s, { type: 'takeToken', index: 0 }), /already carry an Artifact/);
  });

  it('secrets: immediate effects and kept potions', () => {
    let s = edit(game(), (d) => {
      d.players[0].room = 'r3';
      d.turn.canTakeToken = true;
      d.roomTokens.r3 = [{ kind: 'minorSecret', secret: 'skillBoost' }, { kind: 'minorSecret', secret: 'potionStrength' }];
    });
    s = applyMove(s, { type: 'takeToken', index: 0 });
    expect(available(s).skill).toBe(2);
    s = edit(s, (d) => { d.turn.canTakeToken = true; });
    s = applyMove(s, { type: 'takeToken', index: 0 });
    expect(me(s).tokens).toEqual([{ kind: 'kept', secret: 'potionStrength' }]);
    s = applyMove(s, { type: 'useToken', index: 0 });
    expect(available(s).swords).toBe(2);
    expect(me(s).tokens).toEqual([]);
  });

  it('the Market sells for 7 Gold; crowns go highest first', () => {
    const rich = edit(game(), (d) => { d.players[0].room = 'm1'; d.players[0].gold = 14; });
    const s = play(rich, { type: 'buyMarket', item: 'crown' }, { type: 'buyMarket', item: 'crown' });
    expect(me(s).tokens).toEqual([{ kind: 'crown', value: 10 }, { kind: 'crown', value: 9 }]);
    expectRule(() => applyMove(s, { type: 'buyMarket', item: 'crown' }), /7 Gold/);
    expectRule(() => applyMove(edit(rich, (d) => { d.players[0].room = 'r1'; }), { type: 'buyMarket', item: 'masterKey' }), /Market room/);
  });
});

// ---------- end of turn, dragon, end of game ----------

describe('turns and the dragon', () => {
  it('ending the turn needs an empty hand, then draws 5 and passes on', () => {
    let s = game();
    expectRule(() => applyMove(s, { type: 'endTurn' }), /Play all/);
    s = play(s, { type: 'playAll' }, { type: 'endTurn' });
    expect(s.current).toBe(1);
    expect(s.players[0].hand).toHaveLength(5);
  });

  it('refills the Dungeon Row; a Dragon Attack card triggers one attack', () => {
    let s = edit(game(), (d) => {
      d.dungeonRow[0] = null;
      d.dungeonRow[1] = null;
      d.dungeonDeck.unshift('orcGrunt#x1', 'dangerMonster#x1');
    });
    s = play(s, { type: 'playAll' }, { type: 'endTurn' });
    expect(s.dungeonRow.slice(0, 2)).toEqual(['orcGrunt#x1', 'dangerMonster#x1']);
    expect(s.log.filter((l) => l.includes('Dragon attack'))).toHaveLength(1);
    expect(s.clankArea).toEqual({ red: 0, yellow: 0 }); // all moved into the bag
  });

  it('house rule: an empty Dungeon Deck is refilled from the Dungeon discard pile', () => {
    const s = play(edit(withHand(game(), ['burgle']), (d) => {
      d.dungeonRow[0] = null;
      d.dungeonDeck = [];
      d.dungeonDiscard = ['orcGrunt#d1'];
    }), { type: 'playAll' }, { type: 'endTurn' });
    expect(s.dungeonRow[0]).toBe('orcGrunt#d1');
    expect(s.log.some((l) => l.includes('Dragon attack'))).toBe(true); // attacks keep coming
  });

  it('dragon attack: player cubes deal damage, black cubes are set aside', () => {
    const s = edit(game(), (d) => {
      d.bag = { black: 0 };
      d.clankArea = { red: 2, yellow: 0 };
      dragonAttack(d);
    });
    expect(s.players[0].damage).toBe(2);
    expect(s.bag.red).toBe(0);
  });

  it('Arrive: all players get +1 Clank! when the card is revealed', () => {
    const start = withHand(edit(game(), (d) => { d.dungeonRow[0] = null; d.dungeonDeck.unshift('arriveMonster#x1'); }), ['burgle']);
    const s = play(start, { type: 'playAll' }, { type: 'endTurn' });
    expect(s.clankArea).toEqual({ red: 4, yellow: 3 }); // 3 + 1 and 2 + 1
  });
});

describe('knock-outs, countdown and scoring', () => {
  const hit = (s: GameState, i: number, extra?: (d: GameState) => void) =>
    edit(s, (d) => {
      extra?.(d);
      d.bag = { black: 0, [d.players[i].id]: 20 };
      d.players[i].damage = MAX_HEALTH - 1;
      dragonAttack(d);
    });

  it('knocked out in the Depths: loses; above ground with an Artifact: rescued', () => {
    const lost = hit(game(), 0, (d) => { d.players[0].room = 'a20'; d.players[0].tokens.push({ kind: 'artifact', value: 20 }); });
    expect(lost.players[0].status).toBe('dead');
    const saved = hit(game(), 0, (d) => { d.players[0].room = 'r1'; d.players[0].tokens.push({ kind: 'artifact', value: 20 }); });
    expect(saved.players[0].status).toBe('rescued');
    expect(saved.countdown).toEqual({ playerId: 'red', space: 1 });
  });

  it('escaping gives the Mastery token, ends the turn and starts the countdown', () => {
    let s = edit(game(), (d) => { d.players[0].room = 'r1'; d.players[0].tokens.push({ kind: 'artifact', value: 5 }); });
    s = playAll(withHand(s, ['sidestep']));
    s = applyMove(s, { type: 'move', to: 'entrance' });
    expect(s.players[0].status).toBe('escaped');
    expect(s.current).toBe(1);
    expect(s.countdown).toEqual({ playerId: 'red', space: 1 });
  });

  it('the countdown attacks three times, then knocks out everyone left', () => {
    let s = edit(game(), (d) => {
      d.players[0].status = 'escaped';
      d.countdown = { playerId: 'red', space: 1 };
      d.current = 1;
      d.bag = { black: 50 };
    });
    for (let i = 0; i < 3; i++) s = play(s, { type: 'playAll' }, { type: 'endTurn' });
    expect(s.countdown!.space).toBe(4);
    expect(s.log.filter((l) => l.includes('instant dragon attack'))).toHaveLength(3);
    s = play(s, { type: 'playAll' }, { type: 'endTurn' });
    expect(s.players[1].status).toBe('dead');
    expect(s.over).toBe(true);
  });

  it('scores Artifact, tokens, Gold and card points; ties go to the best Artifact', () => {
    const s = edit(game(), (d) => {
      Object.assign(d.players[0], { status: 'escaped', gold: 3, tokens: [{ kind: 'artifact', value: 10 }, { kind: 'mastery' }, { kind: 'idol' }] });
      Object.assign(d.players[1], { status: 'rescued', gold: 13, tokens: [{ kind: 'artifact', value: 25 }] });
      d.players[1].discard.push('secretTome#z', 'rebelCaptain#z');
      d.over = true;
    });
    const { scores, winner } = finalScores(s);
    expect(scores.map((x) => [x.player.name, x.total])).toEqual([['Ben', 46], ['Ann', 38]]);
    expect(winner!.player.name).toBe('Ben');

    const tie = edit(s, (d) => { d.players[0].gold = 11; });
    expect(finalScores(tie).scores.map((x) => x.total)).toEqual([46, 46]);
    expect(finalScores(tie).winner!.player.name).toBe('Ben'); // Artifact 25 beats 10
  });
});
