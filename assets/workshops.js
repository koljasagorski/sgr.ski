/* sgr.ski/workshops — Firewall-Linie, Scroll-Bühnen, Phishing-Film.
   Läuft render-blocking im <head>, damit .js vor dem ersten Paint gesetzt ist
   und die Sticky-Bühnen nicht erst ausgeklappt und dann eingeklappt werden.
   Browserwerte werden lokal ausgelesen. IP, Provider und Standort meldet
   ip.sgr.ski (eigener Worker, ip-worker/) zurück — nichts wird gespeichert. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ── Was der Browser von sich aus preisgibt ──────────────────────────── */
  function probe() {
    var n = navigator, ua = n.userAgent || '';
    var os = 'Unbekannt';
    if (/Windows/.test(ua)) os = 'Windows';
    else if (/Android/.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';
    else if (/Mac OS X/.test(ua)) os = n.maxTouchPoints > 1 ? 'iPadOS' : 'macOS';
    else if (/Linux/.test(ua)) os = 'Linux';

    var br = 'Unbekannt';
    if (/Edg\//.test(ua)) br = 'Edge';
    else if (/Firefox\//.test(ua)) br = 'Firefox';
    else if (/Chrome\//.test(ua)) br = 'Chrome';
    else if (/Safari\//.test(ua)) br = 'Safari';

    var tz = '—';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '—'; } catch (e) { /* alt */ }
    var lang = (n.languages && n.languages.length ? n.languages.slice(0, 3) : [n.language]).join(', ');
    var scr = screen.width + ' × ' + screen.height + ' @' + Math.round((window.devicePixelRatio || 1) * 10) / 10 + 'x';

    /* FNV-1a über ein paar stabile Merkmale — nur zur Anschauung, lokal. */
    var raw = [ua, tz, lang, scr, n.hardwareConcurrency, n.platform, new Date().getTimezoneOffset()].join('|');
    var h = 2166136261;
    for (var i = 0; i < raw.length; i++) { h ^= raw.charCodeAt(i); h = Math.imul(h, 16777619); }
    var hex = ('00000000' + (h >>> 0).toString(16)).slice(-8);

    /* Grafikkarte: über WebGL lesbar, eines der stärksten Fingerprint-Merkmale. */
    var gpu = 'nicht auslesbar';
    try {
      var gl = document.createElement('canvas').getContext('webgl');
      if (gl) {
        var ext = gl.getExtension('WEBGL_debug_renderer_info');
        var r = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || '');
        /* "ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)" → "Apple M2" */
        var m = r.match(/Renderer:\s*([^,)]+)/) || r.match(/^ANGLE \([^,]+,\s*([^,(]+?)(?:\s*\(|,|\))/);
        gpu = (m ? m[1] : r).trim() || gpu;
      }
    } catch (e) { /* blockiert */ }

    var hw = [];
    if (n.hardwareConcurrency) hw.push(n.hardwareConcurrency + ' Kerne');
    if (n.deviceMemory) hw.push('≥ ' + n.deviceMemory + ' GB RAM');
    if (n.maxTouchPoints > 0) hw.push('Touch');

    return {
      tz: tz, lang: lang, screen: scr, os: os, browser: br, gpu: gpu,
      hw: hw.length ? hw.join(' · ') : 'nicht auslesbar',
      fp: hex.slice(0, 4) + ' ' + hex.slice(4) + ' · lokal berechnet'
    };
  }

  /* ── Was jeder Server sieht: IP, Netzbetreiber, ungefährer Standort ──── */
  function network() {
    if (!window.fetch) return;
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = ctrl && setTimeout(function () { ctrl.abort(); }, 5000);
    fetch('https://ip.sgr.ski/', { cache: 'no-store', credentials: 'omit', signal: ctrl && ctrl.signal })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        var country = d.country;
        try { country = new Intl.DisplayNames(['de'], { type: 'region' }).of(d.country) || d.country; } catch (e) { /* alt */ }
        var place = [d.city, d.region, country].filter(Boolean).join(', ');
        var prov = d.provider ? d.provider + (d.asn ? ' · AS' + d.asn : '') : '';
        var conn = [d.httpProtocol, d.tlsVersion && d.tlsVersion.replace('TLSv', 'TLS ')].filter(Boolean).join(' · ');
        var vals = {
          ip: d.ip,
          provider: prov,
          location: place,
          conn: conn,
          network: [d.ip, d.provider, d.city].filter(Boolean).join(' · ')
        };
        $$('[data-net]').forEach(function (el) {
          var v = vals[el.getAttribute('data-net')];
          if (v) el.textContent = v;
        });
      })
      .catch(function () {
        /* Blockiert oder offline: die neutralen Platzhalter bleiben stehen. */
        $$('[data-net="ip"]').forEach(function (el) { el.textContent = 'jedem Server bekannt'; });
      })
      .then(function () { if (timer) clearTimeout(timer); });
  }

  function init() {
    var bv = probe();
    $$('[data-bv]').forEach(function (el) { el.textContent = bv[el.getAttribute('data-bv')]; });
    network();

    var t0 = Date.now();
    var sinceEls = $$('[data-since]');
    function tick() {
      var sec = Math.floor((Date.now() - t0) / 1000);
      var txt = sec < 60 ? sec + ' s' : Math.floor(sec / 60) + ' min ' + ('0' + (sec % 60)).slice(-2) + ' s';
      sinceEls.forEach(function (el) { el.textContent = txt; });
    }
    setInterval(tick, 1000);

    /* ── Hero: ziehbare Firewall-Linie ───────────────────────────────────── */
    var hero = $('#hero');
    var handle = $('#hero-handle');
    var heroX = window.innerWidth < 700 ? 72 : 62;
    var dragging = false;

    function renderHero() {
      if (!hero) return;
      hero.style.setProperty('--x', heroX + '%');
      var val = Math.round(100 - heroX);
      handle.setAttribute('aria-valuenow', String(val));
      handle.setAttribute('aria-valuetext', val + ' Prozent Angreiferperspektive');
    }

    function heroFromPointer(clientX) {
      var r = hero.getBoundingClientRect();
      heroX = clamp(((clientX - r.left) / r.width) * 100, 0, 100);
      renderHero();
    }

    if (hero && handle) {
      handle.addEventListener('pointerdown', function (e) {
        dragging = true;
        try { handle.setPointerCapture(e.pointerId); } catch (_) { /* alt */ }
        heroFromPointer(e.clientX);
      });
      handle.addEventListener('pointermove', function (e) { if (dragging) heroFromPointer(e.clientX); });
      handle.addEventListener('pointerup', function () { dragging = false; });
      handle.addEventListener('pointercancel', function () { dragging = false; });
      handle.addEventListener('keydown', function (e) {
        var v = null;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') v = heroX - 5;
        else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') v = heroX + 5;
        else if (e.key === 'Home') v = 0;
        else if (e.key === 'End') v = 100;
        if (v === null) return;
        e.preventDefault();
        heroX = clamp(v, 0, 100);
        renderHero();
      });
      renderHero();
    }

    /* ── Scroll-Bühnen ───────────────────────────────────────────────────── */
    var stages = $$('[data-stage]');
    var chainStage = $('#chain-stage');
    var chain = chainStage && $('.chain', chainStage);
    var flow = $('#flow');
    var flowBox = flow && $('[data-flow]', flow);
    var flowWord = flow && $('[data-flow-word]', flow);
    var flowSide = flow && $('[data-flow-side]', flow);
    var flowSteps = flow ? $$('.flow__step', flow) : [];
    var WORDS = ['ANGRIFF.', 'VERSTEHEN.', 'SCHÜTZEN.', 'PRÜFEN.'];
    var lastFlow = -1;

    function progress(el) {
      var r = el.getBoundingClientRect();
      return clamp(-r.top / Math.max(1, r.height - window.innerHeight), 0, 1);
    }

    function stageX(p) {
      var e = clamp((p - 0.12) / 0.5, 0, 1);
      if (reduced) e = e > 0.5 ? 1 : 0;
      return 100 - e * 100;
    }

    function update() {
      stages.forEach(function (s) {
        var x = stageX(progress(s));
        s.style.setProperty('--x', x + '%');
        s.style.setProperty('--line-op', x > 0.5 && x < 99.5 ? '1' : '0');
      });

      if (chain) {
        var sp = progress(chainStage);
        var step = sp < 0.18 ? 0 : sp < 0.36 ? 1 : sp < 0.52 ? 2 : sp < 0.68 ? 3 : 4;
        chain.setAttribute('data-step', String(step));
      }

      if (flow) {
        var fe = clamp((progress(flow) - 0.05) / 0.85, 0, 0.999);
        var fi = Math.floor(fe * 4);
        if (fi !== lastFlow) {
          lastFlow = fi;
          var dark = fi < 2;
          flowBox.classList.toggle('dark', dark);
          flowWord.textContent = WORDS[fi];
          flowSide.textContent = dark ? 'DIE SEITE DES ANGREIFERS' : 'DEINE SEITE';
          flowSteps.forEach(function (li, i) { li.classList.toggle('is-active', i === fi); });
        }
      }
    }

    var raf = null;
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = null; update(); });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    /* ── Hintergrundvideos: laufen nur, solange sie sichtbar sind ────────── */
    if ('IntersectionObserver' in window) {
      $$('[data-bgvideo]').forEach(function (v) {
        new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) {
            var pr = v.play();
            if (pr && pr.catch) pr.catch(function () { /* blockiert: Poster bleibt */ });
          } else if (!v.paused) v.pause();
        }).observe(v);
      });
    }

    /* ── Phishing-Film ─────────────────────────────────────────────────────
       Autoplay, stumm, in Schleife — auch bei reduzierter Bewegung, auf
       ausdrücklichen Wunsch des Betreibers. Keine sichtbaren Bedienelemente:
       ein Klick aufs Bild hält an (WCAG 2.2.2), wer anhält, bleibt angehalten.
       Außerhalb des Sichtbereichs pausiert er. */
    var film = $('[data-film]');
    if (film) {
      var video = $('video', film);
      var userPaused = false;
      function tryPlay() {
        var pr = video.play();
        if (pr && pr.catch) pr.catch(function () { /* Autoplay blockiert, z. B. Stromsparmodus */ });
      }
      /* Großes Wort je Einstellung, synchron zu den Schnitten bei 3 s und 6,5 s */
      var SHOTS = [
        { until: 3,        word: 'EIN KLICK.',    line: 'Eine Mail kommt. Ein Klick.' },
        { until: 6.5,      word: 'EIN PASSWORT.', line: 'Anmelden wie jeden Tag.' },
        { until: Infinity, word: 'EIN ZUGANG.',   line: 'Beim Angreifer kommen die Zugangsdaten an.', heavy: true }
      ];
      var fWord = $('[data-film-word]', film);
      var fLine = $('[data-film-line]', film);
      var fCount = $('[data-film-count]', film);
      var lastShot = 0;
      video.addEventListener('timeupdate', function () {
        var t = video.currentTime, i = 0;
        while (t >= SHOTS[i].until) i++;
        if (i === lastShot) return;
        lastShot = i;
        fWord.textContent = SHOTS[i].word;
        fWord.classList.toggle('is-heavy', !!SHOTS[i].heavy);
        fWord.classList.remove('is-in');
        void fWord.offsetWidth; /* Animation neu starten */
        fWord.classList.add('is-in');
        fLine.textContent = SHOTS[i].line;
        fCount.textContent = '0' + (i + 1) + ' / 03';
      });
      video.addEventListener('click', function () {
        if (video.paused) { userPaused = false; tryPlay(); }
        else { userPaused = true; video.pause(); }
      });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          var inView = entries[0].isIntersecting;
          if (inView && !userPaused) tryPlay();
          else if (!inView && !video.paused) video.pause();
        }, { threshold: 0.35 }).observe(video);
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
