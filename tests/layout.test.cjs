const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { core, source, line } = require('./helpers.cjs');

test('portrait bed, rule line, controls and seed rows preserve the approved size priorities', () => {
  const code = source(), context = {}; vm.createContext(context);
  vm.runInContext(line(code, 'const UI_SLICES='), context);
  for (const name of ['tileGeometry', 'priorityMobilePlan']) {
    const a = code.indexOf(`function ${name}(`), b = code.indexOf('\nfunction ', a + 10);
    assert(a >= 0 && b > a); vm.runInContext(code.slice(a, b), context);
  }
  const m = core();
  for (const [w, h] of [[390, 844], [360, 640]]) for (const level of m.LEVELS) {
    const p = context.priorityMobilePlan(w, h, level.n, Object.keys(level.seeds).length, true, [0, 6, 12].includes(level.id));
    assert(p.frameW >= w * .8); assert(p.header <= h * .16);
    assert.equal(p.ruleH, 44); assert.equal(p.controlsH, 52);
    assert(p.cardW >= 64 && p.cardW <= 96 && p.cardW <= p.cell);
    assert(p.header + p.frameH + p.ruleH + p.controlsH + p.trayH + 10 <= h + .01);
    if (level.n === 4) assert(p.cell >= (w === 390 ? 80 : 64));
    assert.equal(p.rows, Object.keys(level.seeds).length <= 5 ? 1 : 2);
  }
});
