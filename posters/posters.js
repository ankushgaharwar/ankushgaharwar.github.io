(() => {
  'use strict';

  // All photographs and renders come from this portfolio; see image-sources.json.
  const projects = [
    { name: 'Cosmic Kaksh', subject: 'Play, in orbit.', lines: ['Play,', 'in orbit.'], category: 'Spatial design', note: 'A different perspective on play.', images: ['cosmic-01', 'cosmic-02', 'cosmic-03', 'cosmic-04', 'cosmic-05'], dark: true, url: 'portfolio/Cosmic Kaksh/Cosmic Kaksh.html' },
    { name: 'Aurora', subject: 'Forms in motion.', lines: ['Forms in', 'motion.'], category: 'Mobility design', note: 'An exploration of form and movement.', images: ['aurora'], dark: false, url: 'aurora.html' },
    { name: 'Tree House', subject: 'A place to pause.', lines: ['A place', 'to pause.'], category: 'Architecture', note: 'Spaces for a different kind of everyday.', images: ['tree-exterior', 'tree-interior', 'tree-stairs', 'tree-render'], dark: false, url: 'treehouse.html' },
    { name: 'Crew Seat', subject: 'Beyond the ordinary.', lines: ['Beyond the', 'ordinary.'], category: 'Space design', note: 'The human scale of space exploration.', images: ['crew-seat', 'crew-cabin', 'crew-detail'], dark: true, url: 'spacedesign.html' },
    { name: 'Protoplanet', subject: 'Life, elsewhere.', lines: ['Life,', 'elsewhere.'], category: 'Habitat design', note: 'Imagining a place beyond the familiar.', images: ['habitat-01', 'habitat-02', 'habitat-03'], dark: false, url: 'protoplanet.html' },
    { name: 'Hope', subject: 'Everyday possibilities.', lines: ['Everyday', 'possibilities.'], category: 'Mobility design', note: 'Small forms. New possibilities.', images: ['hope'], dark: false, url: 'hope.html' },
    { name: 'Cabanes Night', subject: 'Built to gather.', lines: ['Built to', 'gather.'], category: 'Installation', note: 'An encounter between people and place.', images: ['cabanes-01', 'cabanes-02'], dark: false, url: 'villamedici.html' },
    { name: '7 Story Tensile', subject: 'Between earth & sky.', lines: ['Between', 'earth & sky.'], category: 'Spatial design', note: 'Structure, tension, and open space.', images: ['tensile'], dark: false, url: 'verde.html' },
    { name: 'Motorcycle', lines: ['Made to', 'move.'], category: 'Mobility design', note: 'Finding character in everyday movement.', images: ['motorcycle', 'motorcycle-views'], dark: false, url: 'entry level motorcycle.html' },
    { name: 'Automotive Sketches', lines: ['Thinking', 'in lines.'], category: 'Sketch exploration', note: 'Every new form begins with a line.', images: ['auto-sketch-01', 'auto-sketch-02'], dark: false, url: 'portfolio/Automotive Sketches/work-single.html' },
    { name: 'Package Design', lines: ['Unfolding', 'an idea.'], category: 'Packaging', note: 'A small structure for an everyday ritual.', images: ['package-flat', 'package-open', 'package-filled', 'package-closed'], dark: false, url: 'Package Design.html' },
    { name: 'Hummingbird Lamp', lines: ['A little', 'light.'], category: 'Smart objects', note: 'A familiar shape with a new purpose.', images: ['bird-lamp'], dark: false, url: 'Smart Objects lamp.html' },
    { name: 'Smart Scooper', lines: ['Everyday', 'ingenuity.'], category: 'Product design', note: 'Making small moments work better.', images: ['scooper'], dark: false, url: 'scooper.html' },
    { name: 'Arbor Felix', lines: ['A family', 'of forms.'], category: 'Object design', note: 'One idea, many different expressions.', images: ['arbor-objects'], dark: false, url: 'arborfelix.html' },
    { name: 'Taming the Drone', lines: ['A different', 'point of view.'], category: 'Mobility systems', note: 'Exploring connections between ground and sky.', images: ['drone-landscape'], dark: false, url: 'taming the drone.html' },
  ];
  const templates = ['specimen', 'statement', 'hero', 'grid', 'plates', 'triptych', 'columns', 'letter', 'landscape', 'inventory'];
  const statements = [
    'Play opens a connection to a different way of seeing the spaces we inhabit.',
    'A line becomes a surface. A surface becomes a form. A form begins to move.',
    'A place to pause, look around, and find another way of living with nature.',
    'Design begins with the human, even when the destination is beyond Earth.',
    'To imagine life elsewhere is to look more closely at how we live here.',
    'The everyday is full of possibilities waiting to take a different shape.',
    'A structure becomes a place through the people who come together within it.',
    'Between the earth and the sky, a few simple elements become a place to meet.',
    'Movement starts with a thought, a sketch, and a new way to see the road ahead.',
    'A sketch is a conversation between the hand, the eye, and an idea taking shape.',
    'Fold by fold, a flat surface becomes a small structure for everyday life.',
    'Light can change the way a familiar object feels, and how a space comes alive.',
    'The smallest objects can make a difference in the rituals of everyday life.',
    'One form can lead to another, opening a whole family of possibilities.',
    'A change in perspective reveals connections between the ground and the sky.',
  ];
  const TOTAL = 200, COLS = 20, ROWS = TOTAL / COLS, W = 360, H = 509, GAP = 40;
  const board = document.getElementById('board');
  const wall = document.getElementById('wall');
  const viewer = document.getElementById('viewer');
  const large = document.getElementById('large-poster');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const pad = n => String(n).padStart(3, '0');
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
  // Seeded shuffles mix the collection while keeping poster links stable on reload.
  let seed = 10102026;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  function shuffled(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  const projectOrder = shuffled(Array.from({ length: TOTAL }, (_, i) => projects[i % projects.length]));
  const layoutOrder = shuffled(Array.from({ length: TOTAL }, (_, i) => templates[i % templates.length]));
  const entries = projectOrder.map((project, i) => {
    const left = i % COLS ? projectOrder[i - 1] : null;
    const above = projectOrder[i - COLS];
    if (project === left || project === above) {
      const j = projectOrder.findIndex((candidate, index) => index > i && candidate !== left && candidate !== above);
      if (j !== -1) [projectOrder[i], projectOrder[j]] = [projectOrder[j], projectOrder[i]];
    }
    return { id: i + 1, project: projectOrder[i], template: layoutOrder[i], dark: random() > .36, imageOffset: Math.floor(random() * projectOrder[i].images.length) };
  });
  // The opening composition pairs a specimen sheet with a typographic poster.
  const start = 4 * COLS + 9;
  Object.assign(entries[start], { project: projects[0], template: 'specimen', dark: false });
  Object.assign(entries[start + 1], { project: projects[3], template: 'statement', dark: true });
  Object.assign(entries[start - 1], { project: projects[8], template: 'grid', dark: true });
  Object.assign(entries[start + COLS], { project: projects[10], template: 'plates', dark: false });

  function posterSVG(entry) {
    const { id, project: p, template, dark } = entry;
    const paper = dark ? '#151616' : '#e8e8df';
    const ink = dark ? '#e5e5dd' : '#171916';
    let order = 0;
    const group = (content, type = '') => `<g class="build ${type}" style="--order:${order++}">${content}</g>`;
    const text = (x, y, value, size = 12, extra = '') => `<text x="${x}" y="${y}" fill="${ink}" font-size="${size}" ${extra}>${esc(value)}</text>`;
    const line = (x1, y1, x2, y2) => `<path class="hairline" d="M${x1} ${y1}H${x2}" ${y1 !== y2 ? `transform="rotate(${Math.atan2(y2-y1,x2-x1)*180/Math.PI} ${x1} ${y1})"` : ''}/>`;
    const picture = (n, x, y, width, height, mode = 'contain') => {
      const invert = dark !== p.dark && !['landscape', 'columns'].includes(template);
      return `<image class="${mode === 'cover' ? 'full-photo' : 'photo'}${invert ? ' on-dark' : ''}${p.dark ? ' from-dark' : ''}" href="assets/${p.images[(n + entry.imageOffset) % p.images.length]}.webp" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="${mode === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'}"/>`;
    };
    const label = (x, y, n) => text(x, y, `Fig. ${pad(n + 1)}`, 10, 'class="mono"') + text(x, y + 16, p.name, 11) + text(x, y + 31, p.category, 9);
    const title = (lines, x, y, size, leading = size * .95) => group(lines.map((s, i) => text(x, y + i * leading, s, size, 'class="big-type"')).join(''), 'type');
    const head = group(text(30, 38, 'A. GAHARWAR', 8, 'class="mono" letter-spacing="2"') + text(205, 38, 'STUDIES IN FORM', 8, 'class="mono" letter-spacing="1.6"') + text(570, 38, `${pad(id)} / 200`, 8, 'class="mono" text-anchor="end" letter-spacing="1"'));
    const foot = group(line(30, 760, 570, 760) + text(30, 779, 'FIGURES', 7, 'class="mono" letter-spacing="1.2"') + text(132, 779, 'COLLECTION', 7, 'class="mono" letter-spacing="1.2"') + text(370, 779, 'DISCIPLINE', 7, 'class="mono" letter-spacing="1.2"') + text(30, 798, pad(id), 11) + text(132, 798, p.name, 12) + text(370, 798, p.category, 11) + text(132, 814, 'Selected works / Design archive', 8) + text(530, 798, 'AG', 12));
    let art = '';
    if (template === 'specimen') {
      const positions = [[30, 74], [330, 74], [30, 298], [330, 298], [30, 535], [330, 535]];
      positions.forEach(([x, y], n) => {
        art += group(picture(n, x, y, 240, 140) + text(x + 200, y + 159, pad((id + n) % 200), 22) + text(x + 203, y + 178, '[Study]', 10, 'class="mono"') + label(x, y + 173, n));
      });
      art += title(['Look', 'closely.'], 143, 401, 110, 106);
    } else if (template === 'statement') {
      const words = statements[projects.indexOf(p)].replace(/\.$/, '').split(' ');
      const lines = []; let current = '';
      for (const word of words) { if ((current + word).length > 17) { lines.push(current.trim()); current = ''; } current += word + ' '; }
      if (current) lines.push(current.trim() + '.');
      art += title(['“' + lines[0], ...lines.slice(1, -1), ...(lines.length > 1 ? [lines.at(-1) + '”'] : [])], 30, 146, 61, 67);
      art += group(text(32, 590, 'FORM FOLLOWS CURIOSITY.', 8, 'class="mono" letter-spacing="1.6"') + picture(0, 365, 545, 190, 166) + label(365, 718, 0));
    } else if (template === 'hero') {
      art += title(p.lines, 28, 145, 83, 82);
      art += group(picture(id, 24, 280, 552, 355));
      art += group(line(30, 654, 570, 654) + label(30, 680, 0) + text(360, 680, '{' + p.category.toLowerCase() + '}', 11, 'class="mono"'));
    } else if (template === 'grid') {
      let grid = '';
      for (let x = 30; x <= 570; x += 23) grid += `<path d="M${x} 72V737" stroke="${x % 2 ? '#697eda' : '#a6abe0'}" stroke-width=".6" opacity=".7"/>`;
      for (let y = 80; y <= 740; y += 37) grid += `<path d="M30 ${y}H570" stroke="#8b96d6" stroke-width=".6" opacity=".7"/>`;
      art += group(grid);
      art += title(['FORM', 'STUDY'], 40, 159, 93, 89);
      art += group(picture(id, 85, 260, 460, 270));
      art += group(text(35, 604, p.name, 30) + text(35, 629, p.note, 11) + text(35, 696, 'X / Y / Z', 10, 'class="mono"') + text(500, 696, pad(id), 28));
    } else if (template === 'plates') {
      art += title(['Six plates'], 28, 131, 81);
      art += group(text(31, 167, 'Six views of a design in progress.', 13) + text(31, 185, 'From the archive of Ankush Gaharwar.', 10));
      for (let n = 0; n < 6; n++) {
        const x = 30 + n % 3 * 183, y = 244 + Math.floor(n / 3) * 239;
        art += group(`<rect x="${x}" y="${y}" width="173" height="187" fill="${ink}" opacity=".035"/>` + picture(n, x + 5, y + 15, 163, 130) + label(x + 7, y + 162, n));
      }
    } else if (template === 'triptych') {
      art += title(['Three ways', 'of seeing.'], 28, 130, 83);
      for (let n = 0; n < 3; n++) art += group(picture(n, 26 + n * 185, 290, 178, 233) + label(30 + n * 185, 553, n));
      art += group(text(30, 667, p.note, 15) + text(30, 690, 'An ongoing dialogue between objects and ideas.', 10));
    } else if (template === 'columns') {
      for (let n = 0; n < 6; n++) {
        const x = 30 + n * 91;
        art += group(`<rect x="${x}" y="90" width="82" height="532" fill="${ink}" opacity=".06"/>` + text(x + 6, 108, pad(n + 1), 8, 'class="mono"') + picture(n, x + 3, 128 + n * 66, 76, 145));
      }
      art += title(['Six columns'], 26, 728, 80);
    } else if (template === 'letter') {
      art += title(['A', 'G'], 2, 420, 494, 296);
      art += group(picture(id, 192, 241, 350, 313));
      art += group(`<rect x="30" y="590" width="253" height="81" fill="${paper}"/>` + text(39, 612, p.name, 17) + text(39, 633, p.category, 11) + text(39, 654, 'OBJECTS / SPACES / EXPERIMENTS', 8, 'class="mono"'));
    } else if (template === 'landscape') {
      art += group(picture(id, 30, 77, 540, 545, 'cover'));
      art += title([p.name], 28, 682, p.name.length > 13 ? 54 : 70);
      art += group(text(32, 718, p.note, 12));
    } else {
      art += title(['An index', 'of possibilities.'], 28, 127, 68, 68);
      for (let n = 0; n < 9; n++) {
        const x = 30 + n % 3 * 183, y = 265 + Math.floor(n / 3) * 155;
        art += group(picture(n, x, y, 166, 105) + text(x, y + 128, `${pad(n + 1)} / ${p.name}`, 9, 'class="mono"') + line(x, y + 137, x + 163, y + 137));
      }
    }
    // A deterministic paper grain, made from vector specks rather than a remote texture.
    let grain = '';
    for (let n = 0; n < 130; n++) grain += `<circle cx="${(n * 127 + id * 17) % 600}" cy="${(n * 233 + id * 29) % 848}" r="${n % 3 === 0 ? '.8' : '.45'}"/>`;
    return `<svg class="artwork${dark ? ' dark' : ''}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 600 848" role="img" aria-label="${esc(p.name)} — ${template} poster ${pad(id)}"><rect width="600" height="848" fill="${paper}"/>${head}${art}${foot}<g fill="${ink}" opacity=".13" pointer-events="none">${grain}</g></svg>`;
  }

  const buttons = entries.map((entry, i) => {
    const button = document.createElement('button');
    button.className = `poster${entry.dark ? ' dark' : ''}`;
    button.style.left = `${i % COLS * (W + GAP)}px`;
    button.style.top = `${Math.floor(i / COLS) * (H + GAP)}px`;
    button.tabIndex = i === start ? 0 : -1;
    button.setAttribute('aria-label', `Open poster ${pad(entry.id)}: ${entry.project.name}, ${entry.template}`);
    button.setAttribute('aria-haspopup', 'dialog');
    button.dataset.index = i;
    board.append(button);
    return button;
  });
  let scale = .68, x = 0, y = 0, frame = 0, inertia = 0, current = -1, selected = start;
  let viewWidth = wall.clientWidth, viewHeight = wall.clientHeight;
  let lastFocus = null, hashOwned = false;
  const mounted = new Set();
  const pointers = new Map();
  const edgeButton = document.getElementById('auto-pan');
  let edgeEnabled = !reducedMotion.matches, edgeFrame = 0, edgeTime = 0, hover = null;
  let idleFrame = 0, idleTime = 0, idleResumeAt = 0, pageFocused = true, overControls = false;
  let driftX = -12, driftY = -7.2;

  function pauseIdle() { idleResumeAt = performance.now() + 1800; idleTime = 0; }
  function stopIdle() { cancelAnimationFrame(idleFrame); idleFrame = 0; idleTime = 0; }
  function startIdle() {
    if (!idleFrame && edgeEnabled && pageFocused && !document.hidden) idleFrame = requestAnimationFrame(drift);
  }
  function drift(time) {
    idleFrame = 0;
    if (!edgeEnabled || !pageFocused || document.hidden) { idleTime = 0; return; }
    if (viewer.open || pointers.size || edgeFrame || overControls || time < idleResumeAt) {
      idleTime = 0;
    } else {
      const elapsed = idleTime ? Math.min((time - idleTime) / 1000, .04) : 1 / 60;
      idleTime = time;
      const oldX = x, oldY = y;
      x += driftX * elapsed; y += driftY * elapsed;
      render();
      // Gently reverse at the finite wall's boundaries instead of drifting into empty space.
      if (x === oldX) driftX *= -1;
      if (y === oldY) driftY *= -1;
    }
    startIdle();
  }

  function stopEdgePan() {
    cancelAnimationFrame(edgeFrame);
    edgeFrame = 0;
    edgeTime = 0;
    hover = null;
  }
  function edgeForce(position, size, limit) {
    // Generous zones: 28% of the viewport, capped at 300px horizontally / 240px vertically.
    const band = Math.min(limit, size * .28);
    const amount = position < band ? 1 - position / band : position > size - band ? -(1 - (size - position) / band) : 0;
    const strength = Math.min(1, Math.abs(amount));
    return Math.sign(amount) * strength * strength * (3 - 2 * strength);
  }
  function panAtEdge(time) {
    edgeFrame = 0;
    if (!hover || !edgeEnabled || viewer.open || pointers.size || document.hidden) { stopEdgePan(); return; }
    const dx = edgeForce(hover.x, viewWidth, 300), dy = edgeForce(hover.y, viewHeight, 240);
    if (!dx && !dy) { stopEdgePan(); return; }
    const elapsed = edgeTime ? Math.min((time - edgeTime) / 1000, .04) : 1 / 60;
    edgeTime = time;
    // Screen-space speed stays consistent at any zoom; corners don't pan faster.
    const speed = 520 * elapsed / Math.max(1, Math.hypot(dx, dy));
    const oldX = x, oldY = y;
    cancelAnimationFrame(inertia);
    x += dx * speed; y += dy * speed;
    render();
    if (x !== oldX || y !== oldY) edgeFrame = requestAnimationFrame(panAtEdge);
    else stopEdgePan();
  }
  function updateEdgeButton() {
    edgeButton.setAttribute('aria-pressed', String(edgeEnabled));
    edgeButton.textContent = `Auto-pan ${edgeEnabled ? 'on' : 'off'}`;
    edgeButton.title = edgeEnabled ? 'Pause idle drift and edge panning' : 'Enable idle drift and edge panning';
  }
  updateEdgeButton();
  edgeButton.addEventListener('click', () => {
    stopEdgePan(); stopIdle(); edgeEnabled = !edgeEnabled; updateEdgeButton();
    pauseIdle(); startIdle();
  });
  document.addEventListener('pointermove', event => {
    pauseIdle();
    overControls = Boolean(event.target.closest('.zoom-tools, .home-link'));
    if (event.pointerType !== 'mouse' || event.buttons || !edgeEnabled || viewer.open || pointers.size || document.hidden || event.target.closest('.zoom-tools, .home-link')) {
      stopEdgePan(); return;
    }
    hover = { x: event.clientX, y: event.clientY };
    if (!edgeForce(hover.x, viewWidth, 300) && !edgeForce(hover.y, viewHeight, 240)) { stopEdgePan(); return; }
    if (!edgeFrame) edgeFrame = requestAnimationFrame(panAtEdge);
  }, { passive: true });
  document.addEventListener('pointerleave', () => { stopEdgePan(); overControls = false; pauseIdle(); });
  wall.addEventListener('pointerleave', stopEdgePan);
  document.addEventListener('pointercancel', stopEdgePan);
  document.addEventListener('visibilitychange', () => {
    stopEdgePan(); stopIdle(); pauseIdle();
    if (!document.hidden) startIdle();
  });
  window.addEventListener('blur', () => { pageFocused = false; stopEdgePan(); stopIdle(); });
  window.addEventListener('focus', () => { pageFocused = true; overControls = false; pauseIdle(); startIdle(); });
  reducedMotion.addEventListener('change', event => {
    if (event.matches) { stopEdgePan(); stopIdle(); edgeEnabled = false; updateEdgeButton(); }
  });
  function draw() {
    frame = 0;
    board.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    document.getElementById('zoom-label').textContent = `${Math.round(scale * 100)}%`;
    // Mount only nearby posters, so the 200-piece wall stays light on phones.
    entries.forEach((entry, i) => {
      const left = x + i % COLS * (W + GAP) * scale;
      const top = y + Math.floor(i / COLS) * (H + GAP) * scale;
      const visible = left < viewWidth + 320 && left + W * scale > -320 && top < viewHeight + 320 && top + H * scale > -320;
      if (visible && !mounted.has(i)) { buttons[i].innerHTML = posterSVG(entry); mounted.add(i); }
      if (!visible && mounted.has(i)) { buttons[i].replaceChildren(); mounted.delete(i); }
    });
  }
  function bounds() {
    x = Math.min(viewWidth / 2, Math.max(viewWidth / 2 - (COLS * (W + GAP) - GAP) * scale, x));
    y = Math.min(viewHeight / 2, Math.max(viewHeight / 2 - (ROWS * (H + GAP) - GAP) * scale, y));
  }
  function render() { bounds(); if (!frame) frame = requestAnimationFrame(draw); }
  function center(index = start) {
    x = viewWidth / 2 - (index % COLS * (W + GAP) + W / 2) * scale;
    y = viewHeight / 2 - (Math.floor(index / COLS) * (H + GAP) + H / 2) * scale;
    render();
  }
  function zoom(next, px = viewWidth / 2, py = viewHeight / 2) {
    pauseIdle();
    stopEdgePan();
    cancelAnimationFrame(inertia);
    next = Math.max(.26, Math.min(1.8, next));
    x = px - (px - x) * next / scale;
    y = py - (py - y) * next / scale;
    scale = next;
    render();
  }
  function select(index, focus = true) {
    pauseIdle();
    stopEdgePan();
    buttons[selected].tabIndex = -1;
    selected = Math.max(0, Math.min(TOTAL - 1, index));
    buttons[selected].tabIndex = 0;
    center(selected);
    if (focus) buttons[selected].focus({ preventScroll: true });
  }
  function reset() { cancelAnimationFrame(inertia); scale = viewWidth < 500 ? .62 : .68; select(start, false); }
  reset();

  let gesture = null, moved = false, velocity = { x: 0, y: 0 }, downTarget = null;
  function measure() {
    const points = [...pointers.values()];
    if (points.length === 1) return { x: points[0].x, y: points[0].y, distance: 0 };
    return { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2, distance: Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y) };
  }
  wall.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    pauseIdle();
    stopEdgePan();
    cancelAnimationFrame(inertia);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    wall.setPointerCapture(event.pointerId);
    if (pointers.size === 1) { moved = false; downTarget = event.target.closest('.poster'); velocity = { x: 0, y: 0 }; }
    else moved = true;
    gesture = { ...measure(), time: performance.now(), originX: event.clientX, originY: event.clientY };
  });
  wall.addEventListener('pointermove', event => {
    if (!pointers.has(event.pointerId) || !gesture) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const next = measure();
    if (!moved && Math.hypot(event.clientX - gesture.originX, event.clientY - gesture.originY) < 5) return;
    moved = true;
    wall.classList.add('dragging');
    if (pointers.size > 1 && gesture.distance > 0) zoom(scale * next.distance / gesture.distance, gesture.x, gesture.y);
    const dx = next.x - gesture.x, dy = next.y - gesture.y;
    x += dx; y += dy;
    const elapsed = Math.max(8, performance.now() - gesture.time);
    velocity = { x: dx / elapsed * 16, y: dy / elapsed * 16 };
    gesture = { ...next, time: performance.now(), originX: gesture.originX, originY: gesture.originY };
    render();
  });
  function release(event) {
    if (!pointers.has(event.pointerId)) return;
    pauseIdle();
    pointers.delete(event.pointerId);
    if (pointers.size) { gesture = { ...measure(), time: performance.now() }; return; }
    wall.classList.remove('dragging');
    if (event.type === 'pointerup' && !moved && downTarget) openPoster(Number(downTarget.dataset.index));
    if (moved && !reducedMotion.matches && event.type === 'pointerup' && performance.now() - gesture.time < 100) {
      const glide = () => {
        velocity.x *= .9; velocity.y *= .9;
        x += velocity.x; y += velocity.y; render();
        if (Math.hypot(velocity.x, velocity.y) > .15) inertia = requestAnimationFrame(glide);
      };
      inertia = requestAnimationFrame(glide);
    }
    gesture = null; downTarget = null;
  }
  wall.addEventListener('pointerup', release);
  wall.addEventListener('pointercancel', release);
  wall.addEventListener('click', event => {
    const target = event.target.closest('.poster');
    if (event.detail === 0 && target) openPoster(Number(target.dataset.index));
  });
  wall.addEventListener('wheel', event => {
    event.preventDefault();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewHeight : 1);
    zoom(scale * Math.exp(-Math.max(-120, Math.min(120, delta)) * .002), event.clientX, event.clientY);
  }, { passive: false });
  document.getElementById('zoom-in').addEventListener('click', () => zoom(scale * 1.2));
  document.getElementById('zoom-out').addEventListener('click', () => zoom(scale / 1.2));
  document.getElementById('reset').addEventListener('click', reset);

  function build() {
    large.classList.remove('is-building');
    large.innerHTML = posterSVG(entries[current]);
    void large.offsetWidth;
    large.classList.add('is-building');
  }
  function openPoster(index, fromHash = false) {
    if (index < 0 || index >= TOTAL) return;
    stopEdgePan();
    cancelAnimationFrame(inertia);
    if (!viewer.open) {
      lastFocus = document.activeElement;
      viewer.showModal();
      document.getElementById('close').focus();
    }
    current = index;
    const entry = entries[index];
    document.getElementById('poster-number').textContent = `POSTER ${pad(entry.id)} / ${TOTAL}`;
    document.getElementById('poster-name').textContent = `${entry.project.name} / ${entry.template}`;
    document.getElementById('project-link').href = `../${entry.project.url}`;
    build();
    if (!fromHash) {
      if (!hashOwned) { history.pushState(null, '', `#${entry.id}`); hashOwned = true; }
      else history.replaceState(null, '', `#${entry.id}`);
    }
  }
  function closePoster(fromHash = false) {
    if (!viewer.open) return;
    pauseIdle();
    viewer.close();
    large.replaceChildren();
    if (!fromHash) {
      if (hashOwned) history.back();
      else history.replaceState(null, '', location.pathname + location.search);
    }
    hashOwned = false;
    if (lastFocus?.isConnected) lastFocus.focus({ preventScroll: true });
  }
  document.getElementById('close').addEventListener('click', () => closePoster());
  viewer.addEventListener('cancel', event => { event.preventDefault(); closePoster(); });
  viewer.addEventListener('click', event => { if (event.target === viewer || event.target.classList.contains('viewer-stage')) closePoster(); });
  document.getElementById('previous').addEventListener('click', () => openPoster((current - 1 + TOTAL) % TOTAL));
  document.getElementById('next').addEventListener('click', () => openPoster((current + 1) % TOTAL));
  document.getElementById('replay').addEventListener('click', build);
  function readHash() {
    const id = /^#(\d+)$/.exec(location.hash)?.[1];
    if (id && Number(id) > 0 && Number(id) <= TOTAL) openPoster(Number(id) - 1, true);
    else closePoster(true);
  }
  window.addEventListener('hashchange', readHash);
  readHash();
  document.addEventListener('keydown', event => {
    pauseIdle();
    stopEdgePan();
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (viewer.open) {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault(); openPoster((current + (event.key === 'ArrowRight' ? 1 : TOTAL - 1)) % TOTAL);
      }
      return;
    }
    const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -COLS, ArrowDown: COLS };
    if (event.key in offsets) { event.preventDefault(); select(selected + offsets[event.key]); }
    if (['+', '=', '-', '0'].includes(event.key)) {
      event.preventDefault();
      if (event.key === '0') reset();
      else zoom(scale * (event.key === '-' ? 1 / 1.2 : 1.2));
    }
  });
  window.addEventListener('resize', () => {
    stopEdgePan();
    const width = wall.clientWidth, height = wall.clientHeight;
    x += (width - viewWidth) / 2; y += (height - viewHeight) / 2;
    viewWidth = width; viewHeight = height; render();
  });
  if (matchMedia('(pointer: coarse)').matches) document.getElementById('hint').textContent = 'Drag to explore · Pinch to zoom · Tap a poster';
  idleResumeAt = 0;
  startIdle();
})();
