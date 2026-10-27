const test = require('node:test');
const assert = require('node:assert/strict');
const { core, read } = require('./helpers.cjs');

test('the twenty campaign levels match the frozen data and remain solvable', () => {
  const m = core();
  assert.equal(m.LEVELS.length, 20);
  assert.equal(JSON.stringify(m.LEVELS), JSON.stringify(JSON.parse(read('tests/fixtures/campaign.json'))));
  for (const level of m.LEVELS) {
    const answer = m.solve(level);
    assert(answer, `No solution for level ${level.id + 1}`);
    assert(m.complete(answer, level), `Invalid solution for level ${level.id + 1}`);
    const missing = answer.slice(); missing[missing.findIndex(Boolean)] = null;
    assert.equal(m.complete(missing, level), false);
  }
});

test('soil restrictions and rocks preserve the eight plant contracts', () => {
  const m = core();
  for (const type of m.TYPES) {
    assert.equal(m.soilOK(type, 'R'), false, type);
    assert.equal(m.soilOK(type, 'S'), type !== 'lettuce', type);
    assert.equal(m.soilOK(type, 'H'), ['lettuce', 'mint', 'peas', 'beans'].includes(type), type);
  }
});

test('neighbors share an edge, and each neighbor rule keeps its meaning', () => {
  const m = core(), level = { n: 3, terrain: Array(9).fill('S') };
  assert.deepEqual(Array.from(m.neighbors(4, 3)).sort(), [1, 3, 5, 7]);
  const board = type => { const b = Array(9).fill(null); b[4] = type; return b; };
  for (const [type, other] of [['basil', 'tomato'], ['peas', 'peas']]) {
    const b = board(type); assert.equal(m.ruleOK(type, 4, b, level), false);
    b[0] = other; assert.equal(m.ruleOK(type, 4, b, level), false);
    b[3] = other; assert.equal(m.ruleOK(type, 4, b, level), true);
  }
  for (const type of ['mint', 'pumpkin']) {
    const b = board(type); b[0] = 'tomato'; assert.equal(m.ruleOK(type, 4, b, level), true);
    b[3] = 'tomato'; assert.equal(m.ruleOK(type, 4, b, level), false);
  }
  const beans = board('beans'); beans[0] = 'onion'; assert.equal(m.ruleOK('beans', 4, beans, level), true);
  beans[3] = 'onion'; assert.equal(m.ruleOK('beans', 4, beans, level), false);
  const rocky = { n: 3, terrain: Array(9).fill('S') }; rocky.terrain[3] = 'R';
  assert.equal(m.ruleOK('pumpkin', 4, board('pumpkin'), rocky), false);
});

test('hints suggest a real next step and stop on a completed garden', () => {
  const m = core();
  for (const level of m.LEVELS) {
    const empty = Array(level.n ** 2).fill(null), hint = m.hintPlan(level, empty);
    assert(hint); assert.equal(hint.kind, 'place'); assert(level.seeds[hint.type]);
    empty[hint.cell] = hint.type; assert(m.solve(level, empty));
    assert.equal(m.hintPlan(level, m.solve(level)), null);
  }
});

test('campaign progress round-trips using the existing key and preserves other settings', () => {
  const m = core(), solution = m.solve(m.LEVELS[0]);
  assert.equal(m.SAVE_KEY, 'cozy-garden-logic-v4');
  m.storage.setItem('unrelated-setting', 'kept');
  m.Progress.data.stars[0] = 3; m.Progress.data.layouts[0] = solution;
  m.Progress.data.started = true; m.Progress.data.current = 1; m.Progress.save({ merge: false });
  m.Progress.data = { stars: {}, layouts: {} }; m.Progress.load();
  assert.equal(m.Progress.data.stars[0], 3);
  assert.equal(JSON.stringify(m.Progress.data.layouts[0]), JSON.stringify(solution));
  assert.equal(m.Progress.next(), 1);
  m.Progress.data.stars[0] = 1; m.Progress.save();
  assert.equal(m.Progress.data.stars[0], 3, 'replay must not erase earned stars');
  m.Progress.reset(); assert.equal(m.storage.getItem('unrelated-setting'), 'kept');
});

test('unavailable or corrupt storage does not prevent play', () => {
  const m = core(); m.storage.setItem(m.SAVE_KEY, '{broken');
  assert.doesNotThrow(() => m.Progress.load());
  m.context.localStorage = { getItem() { throw new Error('disabled'); }, setItem() { throw new Error('disabled'); } };
  assert.doesNotThrow(() => m.Progress.load()); assert.doesNotThrow(() => m.Progress.save());
});

test('the clock starts explicitly, pauses, and keeps an earned timeout penalty until reset', () => {
  const m = core(), clock = new m.ChallengeClock();
  clock.tick(10, true); assert.equal(clock.elapsed, 0);
  clock.start(); clock.tick(10, false); clock.tick(-1, true); clock.tick(NaN, true);
  assert.equal(clock.elapsed, 0); clock.tick(119, true);
  assert.equal(clock.checkExpired(120, true), false); clock.tick(1, true);
  assert.equal(clock.checkExpired(120, true), true);
  assert.equal(clock.checkExpired(120, false), true);
  assert.equal(m.attemptTimePenalty({ dailyDate: '2026-10-27', challengeClock: clock, level: 0 }), false);
  clock.reset(); assert.equal(clock.started, false); assert.equal(clock.expired, false);
  for (const fps of [60, 144, 165]) {
    const c = new m.ChallengeClock(); c.start(); for (let i = 0; i < fps * 10; i++) c.tick(1 / fps, true);
    assert(Math.abs(c.elapsed - 10) < 1e-9);
  }
});
