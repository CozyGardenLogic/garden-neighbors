const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { root, read } = require('./helpers.cjs');
const baseline = JSON.parse(read('tests/fixtures/baseline.json'));
const hash = value => crypto.createHash('sha256').update(value).digest('hex');

test('the extracted files reconstruct the exact published HTML', () => {
  const html = read('index.html'), css = read('game.css'), js = read('game.js');
  assert.equal(hash(css), baseline.cssSha256);
  assert.equal(hash(js), baseline.jsSha256);
  assert.equal(html.split('<link rel="stylesheet" href="game.css">').length, 2);
  assert.equal(html.split('<script src="game.js"></script>').length, 2);
  const restored = html
    .replace('<link rel="stylesheet" href="game.css">', () => `<style>${css}</style>`)
    .replace('<script src="game.js"></script>', () => `<script>${js}</script>`);
  assert.equal(hash(restored), baseline.originalHTMLSha256);
});

test('classic script ordering and Phaser version remain unchanged', () => {
  const html = read('index.html');
  const scripts = [...html.matchAll(/<script\b([^>]*)>/g)].map(match => match[1]);
  assert.equal(scripts.length, 2);
  assert(scripts[0].includes(baseline.phaser));
  assert.equal(scripts[1].trim(), 'src="game.js"');
  assert(!scripts.some(value => /\b(async|defer|type)\s*(=|$)/.test(value)));
  new vm.Script(read('game.js'), { filename: 'game.js' });
});

test('all original non-entry files, including art and audio, are byte-identical', () => {
  for (const [file, expected] of Object.entries(baseline.files)) {
    assert.equal(hash(fs.readFileSync(path.join(root, file))), expected, file);
  }
});
