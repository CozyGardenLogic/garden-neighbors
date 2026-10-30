const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const source = () => read('game.js');
const line = (text, needle) => {
  const found = text.split('\n').find(value => value.includes(needle));
  if (!found) throw new Error(`Missing production code marker: ${needle}`);
  return found;
};

function core() {
  const saved = new Map();
  const storage = {
    getItem: key => saved.get(key) ?? null,
    setItem: (key, value) => saved.set(key, String(value)),
    removeItem: key => saved.delete(key)
  };
  const context = {
    console: { info() {} }, URLSearchParams,
    location: { hostname: 'localhost', search: '' },
    localStorage: storage,
    Settings: { data: { timer: true, timerDuration: 'auto' } }
  };
  vm.createContext(context);
  const code = source();
  const start = code.indexOf('const TEXT=');
  const end = code.indexOf('const Settings=');
  if (start < 0 || end <= start) throw new Error('Cannot locate the unchanged core');
  vm.runInContext(code.slice(start, end) + line(code, 'function attemptStars(') + `
    globalThis.model = { TEXT, TYPES, LEVELS, neighbors, soilOK, ruleOK, complete,
      solve, hintPlan, Progress, SAVE_KEY, ChallengeClock, attemptTimePenalty, attemptStars };
  `, context);
  return { ...context.model, saved, storage, context };
}

module.exports = { root, read, source, line, core };
