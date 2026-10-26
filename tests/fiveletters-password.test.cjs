const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

const source = fs.readFileSync(path.join(__dirname, '..', 'fivelettersformyhusband.html'), 'utf8');
const payload = source.match(/<script id="encrypted-page" type="application\/json">(.*?)<\/script>/s)[1];
const controller = source.match(/<script id="password-controller">(.*?)<\/script>/s)[1];

function page(crypto = webcrypto, data = payload) {
  const elements = new Map();
  for (const id of ['unlock-form', 'password', 'unlock', 'error', 'encrypted-page']) {
    elements.set(id, {
      value: '', textContent: '', disabled: false, attributes: {},
      addEventListener(type, callback) { this[type] = callback; },
      setAttribute(name, value) { this.attributes[name] = value; },
      removeAttribute(name) { delete this.attributes[name]; },
      focus() { this.focused = true; },
      select() { this.selected = true; }
    });
  }
  elements.get('encrypted-page').textContent = data;
  const document = {
    getElementById: id => elements.get(id),
    open() { this.opened = true; },
    write(html) { this.html = html; },
    close() { this.closed = true; }
  };
  vm.runInNewContext(controller, { document, window: { crypto }, atob, TextEncoder, TextDecoder });
  return {
    document, elements,
    async submit(value) {
      elements.get('password').value = value;
      await elements.get('unlock-form').submit({ preventDefault() {} });
    }
  };
}

test('the locked source contains encrypted data, without private text or media', () => {
  assert(!source.includes('const L='));
  assert(!source.includes('Dear husband,'));
  assert(!source.includes('data:image/'));
  assert(!source.includes('data:audio/'));
  const data = JSON.parse(payload);
  assert(data.iterations >= 600000);
  assert.equal(Buffer.from(data.salt, 'base64').length, 16);
  assert.equal(Buffer.from(data.iv, 'base64').length, 12);
});

test('incorrect password stays locked and permits another attempt', async () => {
  const p = page();
  await p.submit('incorrect-password');
  assert.equal(p.document.html, undefined);
  assert.match(p.elements.get('error').textContent, /try again/);
  assert.equal(p.elements.get('password').attributes['aria-invalid'], 'true');
  assert.equal(p.elements.get('password').focused, true);
  assert.equal(p.elements.get('unlock').disabled, false);
});

test('unavailable Web Crypto keeps the page locked', async () => {
  const unsupported = page({});
  await unsupported.submit('anything');
  assert.equal(unsupported.document.html, undefined);
  assert.equal(unsupported.elements.get('unlock').disabled, true);
  assert.match(unsupported.elements.get('error').textContent, /HTTPS/);
});

test('correct password restores all letters and media after a failed attempt', {
  skip: !process.env.FIVE_LETTERS_PASSWORD && 'Set FIVE_LETTERS_PASSWORD to test successful decryption'
}, async () => {
  const password = process.env.FIVE_LETTERS_PASSWORD;
  assert(!source.includes(password));
  const p = page();
  await p.submit('incorrect-password');
  await p.submit(password);
  assert.equal(p.document.opened, true);
  assert.equal(p.document.closed, true);
  assert(p.document.html.startsWith('<!DOCTYPE html>'));
  assert.equal((p.document.html.match(/t:"Open /g) || []).length, 5);
  assert(p.document.html.includes('data:image/'));
  assert(p.document.html.includes('data:audio/'));
  assert.equal(p.elements.get('password').value, '');
  assert.equal(p.elements.get('password').attributes['aria-invalid'], undefined);
  // Reloading creates a fresh locked page; no password or unlocked session is saved.
  assert.equal(page().document.html, undefined);
});

test('modified encrypted content cannot be unlocked', {
  skip: !process.env.FIVE_LETTERS_PASSWORD && 'Set FIVE_LETTERS_PASSWORD to test tamper protection'
}, async () => {
  const damaged = JSON.parse(payload);
  const content = Buffer.from(damaged.content, 'base64');
  content[0] ^= 1;
  damaged.content = content.toString('base64');
  const p = page(webcrypto, JSON.stringify(damaged));
  await p.submit(process.env.FIVE_LETTERS_PASSWORD);
  assert.equal(p.document.html, undefined);
  assert.match(p.elements.get('error').textContent, /try again/);
});
