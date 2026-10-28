(() => {
  'use strict';
  const assets = new URL('.', document.currentScript.src);
  const triggers = document.querySelectorAll('[data-cosmic-viewer]');
  if (!triggers.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'cosmic-dialog';
  dialog.setAttribute('aria-labelledby', 'cosmic-title');
  dialog.innerHTML = `
    <div class="cosmic-header">
      <div><p class="cosmic-eyebrow">INTERACTIVE 3D / THESIS</p><h2 id="cosmic-title">Cosmic Kaksh</h2></div>
      <button class="cosmic-close" type="button" aria-label="Close 3D viewer" autofocus>&times;</button>
    </div>
    <div class="cosmic-views" role="group" aria-label="Model view"><button type="button" data-view="tables" aria-pressed="true">Tables</button><button type="button" data-view="station" aria-pressed="false">Station scene</button></div>
    <div class="cosmic-variants" role="group" aria-label="Table variants">
      <button type="button" data-model="cosmic-kaksh.glb" aria-pressed="true"><span>01</span> Game table</button>
      <button type="button" data-model="cosmic-kaksh-extended.glb" aria-pressed="false"><span>02</span> Extended table</button>
      <button type="button" data-model="cosmic-kaksh-utility.glb" aria-pressed="false"><span>03</span> Utility table</button>
      <button type="button" data-model="cosmic-kaksh-wall.glb" aria-pressed="false"><span>04</span> Wall-mounted table</button>
    </div>
    <div class="cosmic-stage">
      <model-viewer alt="Cosmic Kaksh: game table designed for zero-gravity environments" camera-controls touch-action="none" camera-orbit="35deg 65deg 105%" shadow-intensity="0.4" shadow-softness="1" exposure="0.65" tone-mapping="neutral" interaction-prompt="none" loading="eager"></model-viewer>
      <div class="cosmic-status" role="status" aria-live="polite"><span>Loading 3D model…</span><button type="button" hidden>Try again</button></div>
    </div>
    <div class="cosmic-footer">
      <p>Drag to rotate · Scroll or pinch to zoom · Right-drag to pan</p>
      <div class="cosmic-actions"><button type="button" class="cosmic-reset">Reset view</button><a class="cosmic-project" target="_blank" rel="noopener noreferrer">View full project ↗</a></div>
    </div>`;
  document.body.append(dialog);
  const viewer = dialog.querySelector('model-viewer');
  const status = dialog.querySelector('.cosmic-status');
  const message = status.querySelector('span');
  const retry = status.querySelector('button');
  let opener, library, timeout;
  let modelFile = 'cosmic-kaksh.glb';
  let selectedTable = modelFile;
  let loadRequest = 0;
  function failed() {
    clearTimeout(timeout);
    status.hidden = false;
    message.textContent = 'The 3D model could not load. Please try again or view the full project.';
    retry.hidden = false;
  }
  async function load(retryRequest = false) {
    const request = ++loadRequest;
    status.hidden = false;
    retry.hidden = true;
    message.textContent = 'Loading 3D model…';
    clearTimeout(timeout);
    timeout = setTimeout(failed, 90000);
    try {
      const libraryURL = new URL('vendor/model-viewer/model-viewer.min.js', assets);
      const modelURL = new URL('models/' + modelFile, assets);
      modelURL.searchParams.set('v', '2');
      if (retryRequest) {
        libraryURL.searchParams.set('retry', Date.now());
        modelURL.searchParams.set('retry', Date.now());
      }
      library ||= import(libraryURL.href).catch(error => { library = null; throw error; });
      await library;
      if (request !== loadRequest) return;
      viewer.setAttribute('src', modelURL.href);
    } catch (error) { if (request === loadRequest) failed(); }
  }
  viewer.addEventListener('load', () => { clearTimeout(timeout); status.hidden = true; });
  viewer.addEventListener('error', failed);
  viewer.addEventListener('progress', event => {
    if (retry.hidden && event.detail.totalProgress < 1) message.textContent = `Loading 3D model… ${Math.round(event.detail.totalProgress * 100)}%`;
  });
  retry.addEventListener('click', () => load(true));
  function showModel(file, label) {
    if (modelFile === file) return;
    modelFile = file;
    viewer.alt = `Cosmic Kaksh: ${label}`;
    viewer.cameraOrbit = '35deg 65deg 105%';
    viewer.cameraTarget = 'auto auto auto';
    viewer.fieldOfView = 'auto';
    load();
  }
  dialog.querySelectorAll('[data-model]').forEach(button => {
    button.addEventListener('click', () => {
      selectedTable = button.dataset.model;
      dialog.querySelectorAll('[data-model]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      showModel(selectedTable, button.textContent.trim());
    });
  });
  dialog.querySelectorAll('[data-view]').forEach(button => {
    button.addEventListener('click', () => {
      const tables = button.dataset.view === 'tables';
      dialog.querySelectorAll('[data-view]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      dialog.querySelector('.cosmic-variants').hidden = !tables;
      const label = tables ? dialog.querySelector('[data-model][aria-pressed="true"]').textContent.trim() : 'Complete station scene';
      showModel(tables ? selectedTable : 'cosmic-kaksh-scene.glb', label);
    });
  });
  triggers.forEach(trigger => {
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = trigger;
      dialog.querySelector('.cosmic-project').href = trigger.href;
      dialog.showModal();
      document.documentElement.classList.add('cosmic-viewer-open');
      if (!viewer.hasAttribute('src')) load();
    });
  });
  dialog.querySelector('.cosmic-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('cosmic-viewer-open');
    opener?.focus({ preventScroll: true });
  });
  // Keep portfolio rail scrolling from intercepting model zoom gestures.
  dialog.addEventListener('wheel', event => event.stopPropagation(), { passive: true });
  dialog.querySelector('.cosmic-reset').addEventListener('click', () => {
    viewer.cameraOrbit = '35deg 65deg 105%';
    viewer.cameraTarget = 'auto auto auto';
    viewer.fieldOfView = 'auto';
  });
})();
