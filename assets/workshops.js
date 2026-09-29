/* sgr.ski/workshops — Firewall-Linie, Scroll-Bühnen, Phishing-Demo.
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

    /* ── Phishing-Film ─────────────────────────────────────────────────────
       Läuft stumm in Schleife, aber nur solange er sichtbar ist. Bei
       reduzierter Bewegung startet er nie von selbst. Der Schalter erfüllt
       WCAG 2.2.2 (Pause für bewegte Inhalte > 5 s). */
    var film = $('[data-film]');
    if (film) {
      var video = $('video', film);
      var toggle = $('[data-film-toggle]', film);
      var fIcon = $('[data-film-icon]', film);
      var fLabel = $('[data-film-label]', film);
      var userPaused = reduced;

      function paint() {
        var playing = !video.paused;
        fIcon.textContent = playing ? '❚❚' : '▶';
        fLabel.textContent = playing ? 'PAUSE' : 'ABSPIELEN';
        toggle.setAttribute('aria-label', playing ? 'Video anhalten' : 'Video abspielen');
      }
      function tryPlay() {
        var pr = video.play();
        if (pr && pr.catch) pr.catch(function () { paint(); });
      }
      /* Bildunterschrift folgt dem Film: 01 Klick · 02 Passwort · 03 Angreifer */
      var steps = $$('.film__steps > span', film);
      var CUTS = [3, 6.5];
      var lastStep = -1;
      video.addEventListener('timeupdate', function () {
        var t = video.currentTime;
        var i = t < CUTS[0] ? 0 : t < CUTS[1] ? 1 : 2;
        if (i === lastStep) return;
        lastStep = i;
        steps.forEach(function (el, k) { el.classList.toggle('is-active', k === i); });
      });
      video.addEventListener('play', paint);
      video.addEventListener('pause', paint);
      toggle.addEventListener('click', function () {
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
      paint();
    }

    /* ── Phishing-Demo: reine Simulation ─────────────────────────────────── */
    var demo = $('#demo');
    if (demo) {
      var UNPROT = [
        ['T+0,0', 'Seite aufgerufen. Gerät, Sprache und Zeitzone erkannt.'],
        ['T+6,4', 'E-Mail-Adresse übermittelt.'],
        ['T+9,8', 'Passwort übermittelt.'],
        ['T+14,2', 'Bestätigungscode in Echtzeit weitergereicht.'],
        ['T+15,0', 'Session übernommen. Zugriff auf das Postfach.', true]
      ];
      var PROT = [
        ['T+0,0', 'Seite aufgerufen. Gerät, Sprache und Zeitzone erkannt.'],
        ['T+6,4', 'E-Mail-Adresse übermittelt.'],
        ['T+8,1', 'Passkey verweigert: an die echte Domain gebunden. Keine Zugangsdaten, keine Session.', true]
      ];
      var DELAYS = [250, 1300, 2400, 3500, 4500];

      var playBtn = $('[data-demo-play]', demo);
      var playLabel = $('[data-demo-play-label]', demo);
      var protBtns = $$('[data-demo-prot]', demo);
      var el = {
        email: $('[data-demo-email]', demo),
        pwFields: $('[data-demo-pwfields]', demo),
        pw: $('[data-demo-pw]', demo),
        code: $('[data-demo-code]', demo),
        button: $('[data-demo-button]', demo),
        status: $('[data-demo-status]', demo),
        log: $('[data-demo-log]', demo)
      };

      var step = 0, running = false, prot = false, timers = [];

      function stop() { timers.forEach(clearTimeout); timers = []; }

      function render() {
        el.email.textContent = step >= 1 ? 'name@redaktion.de' : '';
        el.pw.textContent = step >= 2 ? '••••••••••' : '';
        el.code.textContent = step >= 3 ? '482 913' : '';
        el.pwFields.hidden = prot;
        el.button.textContent = prot ? 'MIT PASSKEY ANMELDEN' : 'ANMELDEN';
        el.status.textContent = prot
          ? (step >= 3 ? 'Passkey passt nicht zu dieser Domain. Abgebrochen.' : '')
          : (step >= 5 ? 'Angemeldet. Alles wirkt normal.' : '');

        playLabel.textContent = running ? 'LÄUFT …' : step > 0 ? 'NOCHMAL ABSPIELEN' : 'DEMO ABSPIELEN';
        protBtns.forEach(function (b) {
          b.setAttribute('aria-pressed', String((b.getAttribute('data-demo-prot') === 'on') === prot));
        });

        /* Nur anhängen, was neu ist — aria-live soll nicht alles neu vorlesen. */
        var events = (prot ? PROT : UNPROT).slice(0, step);
        var rows = $$('.log__row', el.log);
        if (rows.length > events.length || step === 0) {
          el.log.textContent = '';
          rows = [];
        }
        if (step === 0) {
          var idle = document.createElement('span');
          idle.className = 'log__idle';
          idle.textContent = 'Noch ist nichts passiert.';
          el.log.appendChild(idle);
          return;
        }
        var idleEl = $('.log__idle', el.log);
        if (idleEl) idleEl.remove();
        for (var i = rows.length; i < events.length; i++) {
          var row = document.createElement('div');
          row.className = 'log__row' + (events[i][2] ? ' log__row--hit' : '');
          var t = document.createElement('span');
          t.textContent = events[i][0];
          var txt = document.createElement('span');
          txt.textContent = events[i][1];
          row.appendChild(t);
          row.appendChild(txt);
          el.log.appendChild(row);
        }
      }

      playBtn.addEventListener('click', function () {
        stop();
        var max = prot ? 3 : 5;
        if (reduced) { step = max; running = false; render(); return; }
        step = 0; running = true; render();
        for (var i = 1; i <= max; i++) {
          (function (i) {
            timers.push(setTimeout(function () { step = i; running = i < max; render(); }, DELAYS[i - 1]));
          })(i);
        }
      });

      protBtns.forEach(function (b) {
        b.addEventListener('click', function () {
          stop();
          prot = b.getAttribute('data-demo-prot') === 'on';
          step = 0; running = false;
          render();
        });
      });

      render();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
