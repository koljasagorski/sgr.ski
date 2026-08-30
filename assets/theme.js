/* Theme: system by default, with a three-state manual override.
   Runs render-blocking in <head> so the page never flashes the wrong theme. */
(function () {
  'use strict';

  var root   = document.documentElement;
  var KEY    = 'theme';
  var ORDER  = ['auto', 'light', 'dark'];
  var COLORS = { light: '#fbfbfa', dark: '#0e1013' };

  function read() {
    try {
      var v = localStorage.getItem(KEY);
      return ORDER.indexOf(v) > -1 ? v : 'auto';
    } catch (e) {
      return 'auto';
    }
  }

  function write(pref) {
    try {
      if (pref === 'auto') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, pref);
    } catch (e) { /* private mode / storage blocked — session-only is fine */ }
  }

  /* Browser UI colour. In auto we let the two authored media-scoped
     <meta name="theme-color"> tags do the work; an explicit choice needs an
     override, and the first matching tag wins, so it goes first in <head>. */
  function paintChrome(pref) {
    var el = document.getElementById('theme-color-override');
    if (pref === 'auto') {
      if (el) el.remove();
      return;
    }
    if (!el) {
      el = document.createElement('meta');
      el.id = 'theme-color-override';
      el.name = 'theme-color';
      document.head.insertBefore(el, document.head.firstChild);
    }
    el.content = COLORS[pref];
  }

  function apply(pref) {
    root.dataset.themePref = pref;
    if (pref === 'auto') delete root.dataset.theme;
    else root.dataset.theme = pref;
    paintChrome(pref);
  }

  /* Phase 1 — before first paint. */
  var pref = read();
  root.classList.add('js');
  apply(pref);

  /* Phase 2 — wire the control once it exists. */
  function wire() {
    var btn = document.getElementById('theme-switch');
    if (!btn) return;

    var label = btn.querySelector('[data-theme-label]');

    function describe() {
      var next = ORDER[(ORDER.indexOf(pref) + 1) % ORDER.length];
      if (label) label.textContent = pref.toUpperCase();
      /* WCAG 2.5.3 Label in Name: the accessible name has to contain the
         visible label, so the state word leads, verbatim. */
      btn.setAttribute(
        'aria-label',
        'Colour theme: ' + pref.toUpperCase() +
        (pref === 'auto' ? ' (follow system)' : '') +
        '. Activate for ' + (next === 'auto' ? 'system default' : next) + '.'
      );
    }

    btn.addEventListener('click', function () {
      pref = ORDER[(ORDER.indexOf(pref) + 1) % ORDER.length];
      write(pref);
      apply(pref);
      describe();
    });

    describe();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
