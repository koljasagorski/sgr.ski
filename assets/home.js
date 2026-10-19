/* Home page: five designs, one per visit.
   Runs render-blocking in <head> so the page never flashes the wrong design.
   ?theme=1a|1b|1c|2a|2b forces one; otherwise a random one that differs from
   the last visit (localStorage "sgr.theme.last"). Without JS the page is 1a. */
(function () {
  'use strict';

  var root   = document.documentElement;
  var KEY    = 'sgr.theme.last';
  var THEMES = ['1a', '1b', '1c', '2a', '2b'];
  var CHROME = { '1a': '#0a0c0b', '1b': '#0b1424', '1c': '#0d0a06', '2a': '#0f0e13', '2b': '#08080a' };
  var SELF_QUERY = /[?&]theme=([^&#]*)/;

  function last() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function remember(t) {
    try { localStorage.setItem(KEY, t); } catch (e) { /* private mode: no memory, still works */ }
  }

  function pickOther(than) {
    var pool = THEMES.filter(function (t) { return t !== than; });
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function apply(t) {
    root.dataset.theme = t;
    var meta = document.getElementById('theme-color');
    if (meta) meta.content = CHROME[t];
    var name = document.getElementById('theme-name');
    if (name) name.textContent = t;
    remember(t);
    if (t === '2a') loadKey();
  }

  /* Phase 1 — before first paint. */
  var forced = SELF_QUERY.exec(location.search);
  var current = forced && THEMES.indexOf(forced[1]) > -1 ? forced[1] : pickOther(last());
  root.classList.add('js');
  root.dataset.theme = current;
  var meta0 = document.getElementById('theme-color');
  if (meta0) meta0.content = CHROME[current];
  remember(current);

  /* ── 1c: hexdump of the identity, built like `xxd` ─────────────────────── */
  var DUMP = 'Kolja Sagorski..Certified IT Security Analyst..20+ years on both sides of the firewall.........';

  function hexdump(host) {
    for (var i = 0; i < DUMP.length; i += 16) {
      var chunk = DUMP.slice(i, i + 16);
      var bytes = [];
      for (var j = 0; j < chunk.length; j++) {
        bytes.push(chunk.charCodeAt(j).toString(16).padStart(2, '0'));
      }
      var pairs = [];
      for (var k = 0; k < bytes.length; k += 2) pairs.push(bytes.slice(k, k + 2).join(''));

      var row = document.createElement('div');
      row.className = 'hex__row';
      [
        ['hex__off', i.toString(16).padStart(8, '0') + ':'],
        ['hex__bytes', pairs.join(' ')],
        ['hex__ascii', chunk.replace(/[^\x20-\x7e]/g, '.')]
      ].forEach(function (cell) {
        var s = document.createElement('span');
        s.className = cell[0];
        s.textContent = cell[1];
        row.appendChild(s);
      });
      host.appendChild(row);
    }
  }

  /* ── 2a: the real public key as backdrop (fallback: same-shaped noise) ─── */
  var keyDone = false;

  function noise() {
    var c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var x = 0x5EFB194E, out = '';
    for (var i = 0; i < 2200; i++) {
      x = (Math.imul(x, 1103515245) + 12345) >>> 0;
      out += c[(x >>> 16) % 64];
    }
    return out;
  }

  function loadKey() {
    var host = document.getElementById('keyblock');
    if (keyDone || !host) return;
    keyDone = true;
    host.textContent = noise();
    fetch('/kolja-sagorski.asc', { credentials: 'omit' })
      .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
      .then(function (txt) {
        var body = txt
          .replace(/-----(BEGIN|END) PGP PUBLIC KEY BLOCK-----/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (body) host.textContent = body;
      })
      .catch(function () { /* keep the noise */ });
  }

  /* Phase 2 — once the DOM exists. */
  function wire() {
    var host = document.getElementById('hexdump');
    if (host) hexdump(host);

    var foot = document.querySelector('.foot__theme');
    if (foot) foot.hidden = false;
    var name = document.getElementById('theme-name');
    if (name) name.textContent = current;

    var btn = document.getElementById('reroll');
    if (btn) {
      btn.addEventListener('click', function () {
        current = pickOther(current);
        apply(current);
        /* drop a forced ?theme= so a reload doesn't pin the old design */
        if (SELF_QUERY.test(location.search)) history.replaceState(null, '', location.pathname);
      });
    }

    if (current === '2a') loadKey();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
