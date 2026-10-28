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
    <div class="cosmic-views" role="group" aria-label="Model view"><button type="button" data-model="cosmic-kaksh.glb" aria-pressed="true">Furniture</button><button type="button" data-model="cosmic-kaksh-scene.glb" aria-pressed="false">Station scene</button></div>
    <div class="cosmic-stage">
      <model-viewer alt="Cosmic Kaksh: furniture designed for zero-gravity environments" camera-controls touch-action="none" camera-orbit="35deg 65deg 105%" shadow-intensity="0.6" exposure="1.1" interaction-prompt="none" loading="eager"></model-viewer>
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
  function failed() {
    clearTimeout(timeout);
    status.hidden = false;
    message.textContent = 'The 3D model could not load. Please try again or view the full project.';
    retry.hidden = false;
  }
  async function load(retryRequest = false) {
    status.hidden = false;
    retry.hidden = true;
    message.textContent = 'Loading 3D model…';
    clearTimeout(timeout);
    timeout = setTimeout(failed, 90000);
    try {
      const libraryURL = new URL('vendor/model-viewer/model-viewer.min.js', assets);
      const modelURL = new URL('models/' + modelFile, assets);
      if (retryRequest) {
        libraryURL.searchParams.set('retry', Date.now());
        modelURL.searchParams.set('retry', Date.now());
      }
      library ||= import(libraryURL.href).catch(error => { library = null; throw error; });
      await library;
      viewer.setAttribute('src', modelURL.href);
    } catch (error) { failed(); }
  }
  viewer.addEventListener('load', () => { clearTimeout(timeout); status.hidden = true; });
  viewer.addEventListener('error', failed);
  viewer.addEventListener('progress', event => {
    if (retry.hidden && event.detail.totalProgress < 1) message.textContent = `Loading 3D model… ${Math.round(event.detail.totalProgress * 100)}%`;
  });
  retry.addEventListener('click', () => load(true));
  dialog.querySelectorAll('[data-model]').forEach(button => {
    button.addEventListener('click', () => {
      if (modelFile === button.dataset.model) return;
      modelFile = button.dataset.model;
      dialog.querySelectorAll('[data-model]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      viewer.cameraOrbit = '35deg 65deg 105%';
      viewer.cameraTarget = 'auto auto auto';
      viewer.fieldOfView = 'auto';
      load();
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
