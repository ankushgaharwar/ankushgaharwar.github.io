const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'posters.js'), 'utf8');

// Run the actual page controller with a small DOM/event adapter and a controlled clock.
// This exercises pointer/keyboard interactions without a browser or extra dependencies.
function page({ reducedMotion = false } = {}) {
  class Target {
    listeners = new Map();
    addEventListener(type, listener) {
      if (!this.listeners.has(type)) this.listeners.set(type, []);
      this.listeners.get(type).push(listener);
    }
    emit(type, values = {}) {
      const event = { type, target: this, preventDefault() {}, ...values };
      for (const listener of this.listeners.get(type) || []) listener(event);
    }
    closest() { return null; }
  }
  const document = new Target();
  class Element extends Target {
    style = {}; dataset = {}; attributes = {}; children = []; innerHTML = ''; open = false;
    classList = { add() {}, remove() {} };
    clientWidth = 1280; clientHeight = 800; offsetWidth = 360;
    isConnected = true;
    append(child) { this.children.push(child); }
    setAttribute(key, value) { this.attributes[key] = value; }
    replaceChildren() { this.innerHTML = ''; this.children = []; }
    focus() { document.activeElement = this; }
    setPointerCapture() {}
    showModal() { this.open = true; }
    close() { this.open = false; }
    closest(selector) { return selector === '.poster' && this.dataset.index !== undefined ? this : null; }
  }
  const elements = new Map();
  document.hidden = false;
  document.getElementById = id => {
    if (!elements.has(id)) elements.set(id, new Element());
    return elements.get(id);
  };
  document.createElement = () => new Element();
  const window = new Target();
  const motion = new Target(); motion.matches = reducedMotion;
  let time = 0, frameId = 0;
  const frames = new Map();
  const location = { hash: '', pathname: '/posters/', search: '' };
  const setURL = (_, __, url) => { location.hash = url.includes('#') ? url.slice(url.indexOf('#')) : ''; };
  vm.runInNewContext(source, {
    document, window, location,
    history: { pushState: setURL, replaceState: setURL, back: () => { location.hash = ''; window.emit('hashchange'); } },
    matchMedia: query => query.includes('reduced-motion') ? motion : { matches: false },
    performance: { now: () => time },
    requestAnimationFrame: callback => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: id => frames.delete(id),
  });
  const element = id => document.getElementById(id);
  function tick(count = 1) {
    for (let n = 0; n < count; n++) {
      time += 1000 / 60;
      const callbacks = [...frames.values()]; frames.clear();
      callbacks.forEach(callback => callback(time));
    }
  }
  tick(2);
  return {
    document, window, element, tick, motion,
    move: (x, y, values = {}) => document.emit('pointermove', { pointerType: 'mouse', buttons: 0, clientX: x, clientY: y, ...values }),
    position: () => element('board').style.transform.match(/translate3d\(([-\d.]+)px, ([-\d.]+)px/).slice(1).map(Number),
  };
}

test('all four wide edge zones pan toward the pointer, well before the screen edge', () => {
  for (const [px, py, axis, sign] of [[220, 400, 0, 1], [1060, 400, 0, -1], [640, 160, 1, 1], [640, 640, 1, -1]]) {
    const p = page();
    p.move(px, py); p.tick(2);
    const before = p.position(); p.tick(30);
    const after = p.position();
    assert.ok((after[axis] - before[axis]) * sign > 5, `${px},${py} should pan`);
    assert.equal(after[1 - axis], before[1 - axis]);
  }
});

test('panning accelerates toward the edge, supports corners, and stops in the center', () => {
  const slow = page(), fast = page();
  const start = slow.position();
  slow.move(230, 400); fast.move(50, 400); slow.tick(30); fast.tick(30);
  assert.ok(fast.position()[0] - start[0] > (slow.position()[0] - start[0]) * 2);
  fast.move(50, 50); fast.tick(10);
  assert.ok(fast.position()[1] > start[1]);
  fast.move(640, 400); fast.tick(2);
  const stopped = fast.position(); fast.tick(30);
  assert.deepEqual(fast.position(), stopped);
});

test('hover movement pauses for controls, mouse exit, focus loss, and hidden tabs', () => {
  const controls = { closest: () => ({}) };
  const stops = [p => p.move(80, 750, { target: controls }), p => p.document.emit('pointerleave'), p => p.element('wall').emit('pointerleave'), p => p.window.emit('blur'), p => { p.document.hidden = true; p.document.emit('visibilitychange'); }];
  for (const stop of stops) {
    const p = page(); p.move(100, 400); p.tick(10); stop(p); p.tick(2);
    const before = p.position(); p.tick(20);
    assert.deepEqual(p.position(), before);
  }
});

test('automatic motion cannot compete with a drag or a poster detail', () => {
  const p = page(); p.move(100, 400); p.tick(10);
  p.element('wall').emit('pointerdown', { button: 0, pointerId: 1, clientX: 100, clientY: 400 });
  p.move(100, 400); p.tick(2);
  const before = p.position(); p.tick(20);
  assert.deepEqual(p.position(), before);
  p.element('wall').emit('pointerup', { pointerId: 1 });
  p.element('wall').emit('click', { detail: 0, target: p.element('board').children[89] });
  assert.equal(p.element('viewer').open, true);
  p.move(100, 400); p.tick(20);
  assert.deepEqual(p.position(), before);
});

test('touch input never starts hover panning, and users can pause or resume it', () => {
  const p = page();
  p.move(20, 400, { pointerType: 'touch' }); p.tick(2);
  const before = p.position(); p.tick(20);
  assert.deepEqual(p.position(), before);
  p.element('auto-pan').emit('click');
  p.move(20, 400); p.tick(20);
  assert.deepEqual(p.position(), before);
  assert.equal(p.element('auto-pan').attributes['aria-pressed'], 'false');
  p.element('auto-pan').emit('click'); p.move(20, 400); p.tick(20);
  assert.ok(p.position()[0] > before[0]);
});

test('reduced motion starts paused and enabling that preference stops existing motion', () => {
  const p = page({ reducedMotion: true }), before = p.position();
  p.move(20, 400); p.tick(20); assert.deepEqual(p.position(), before);
  p.element('auto-pan').emit('click'); p.move(20, 400); p.tick(10);
  assert.ok(p.position()[0] > before[0]);
  p.motion.emit('change', { matches: true }); p.tick(2);
  const stopped = p.position(); p.tick(20); assert.deepEqual(p.position(), stopped);
});

test('the expanded, shuffled collection stays stable and all 200 posters render valid assets', () => {
  const p = page(), other = page();
  const labels = p.element('board').children.map(button => button.attributes['aria-label']);
  assert.equal(labels.length, 200);
  assert.deepEqual(labels, other.element('board').children.map(button => button.attributes['aria-label']));
  const subjects = new Set(), images = new Set();
  for (const button of p.element('board').children) {
    subjects.add(button.attributes['aria-label'].split(': ')[1].split(', ')[0]);
    p.element('wall').emit('click', { detail: 0, target: button });
    const svg = p.element('large-poster').innerHTML;
    assert.ok(!svg.includes('undefined'));
    for (const [, asset] of svg.matchAll(/href="(assets\/[^"]+)"/g)) {
      images.add(asset); assert.ok(fs.existsSync(path.join(root, asset)), asset);
    }
    assert.ok(fs.existsSync(path.resolve(root, p.element('project-link').href)));
  }
  assert.equal(subjects.size, 15);
  assert.equal(images.size, 32);
});


test('the untouched wall drifts diagonally at a slow, consistent pace', () => {
  const p = page(), before = p.position(); p.tick(300);
  const after = p.position();
  assert.ok(Math.abs((before[0] - after[0]) - 60) < 1);
  assert.ok(Math.abs((before[1] - after[1]) - 36) < 1);
});

test('idle drift resumes after interaction, but stays paused over controls and in details', () => {
  const p = page();
  p.move(640, 400); p.tick(2);
  const paused = p.position(); p.tick(60);
  assert.deepEqual(p.position(), paused);
  p.tick(120); assert.ok(p.position()[0] < paused[0]);
  p.move(1200, 760, {target: {closest: () => ({})}}); p.tick(2);
  const controls = p.position(); p.tick(180);
  assert.deepEqual(p.position(), controls);
  p.move(640, 400);
  p.element('wall').emit('click', {detail: 0, target: p.element('board').children[89]});
  p.tick(180); assert.deepEqual(p.position(), controls);
  p.element('close').emit('click'); p.tick(180);
  assert.ok(p.position()[0] < controls[0]);
});

test('pause, reduced motion, focus loss, and background tabs stop idle drift', () => {
  for (const stop of [p => p.element('auto-pan').emit('click'), p => p.window.emit('blur'), p => {p.document.hidden = true; p.document.emit('visibilitychange');}, p => p.motion.emit('change', {matches: true})]) {
    const p = page(); p.tick(30); stop(p); p.tick(2);
    const paused = p.position(); p.tick(300);
    assert.deepEqual(p.position(), paused);
  }
  const reduced = page({reducedMotion: true}), before = reduced.position();
  reduced.tick(300); assert.deepEqual(reduced.position(), before);
});
