/* kasseygc.github.io — site behaviour. No dependencies.
   Sections: utilities · theme · menu · copy · palette · keys · status bar ·
   specimen · portrait · index pages · concordance · reading pages */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var $ = function (s, el) { return (el || doc).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { /* storage blocked: the setting just won't persist */ }
    return null;
  }
  function isTyping(e) {
    var el = e.target;
    return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
  }
  function debounce(fn, ms) {
    var t;
    return function () { var a = arguments, self = this; clearTimeout(t); t = setTimeout(function () { fn.apply(self, a); }, ms); };
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve) {
      var ta = doc.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      doc.body.appendChild(ta); ta.select();
      try { doc.execCommand('copy'); } catch (e) { /* ignore */ }
      doc.body.removeChild(ta); resolve();
    });
  }

  var pal = {};
  try { pal = JSON.parse(($('#palette-data') || {}).textContent || '{}'); } catch (e) { pal = {}; }
  var prefix = pal.prefix || '';
  /* Internal URLs in JSON are language-neutral; polyglot only rewrites href attributes. */
  function localUrl(u) {
    if (!u || u.charAt(0) !== '/') return u;
    if (/^\/(assets|images|files)\//.test(u) || u === '/feed.xml') return u;
    return prefix + u;
  }

  /* ---------- theme ---------- */
  var darkMq = window.matchMedia('(prefers-color-scheme: dark)');
  function currentTheme() { return root.getAttribute('data-theme') || (darkMq.matches ? 'dark' : 'light'); }
  function syncTheme() {
    var th = currentTheme();
    $$('.theme-value').forEach(function (el) { el.textContent = el.getAttribute('data-' + th) || th; });
  }
  function toggleTheme() {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    store('theme', next);
    syncTheme();
    doc.dispatchEvent(new CustomEvent('themechange'));
  }
  if (darkMq.addEventListener) darkMq.addEventListener('change', syncTheme);
  syncTheme();

  /* ---------- grid overlay ---------- */
  function toggleGrid() { root.classList.toggle('show-grid'); }

  /* ---------- mobile menu ---------- */
  var nav = $('#site-nav');
  var menuBtn = $('[data-action="menu"]');
  function setMenu(open) {
    if (!nav || !menuBtn) return;
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  doc.addEventListener('click', function (e) {
    if (nav && nav.classList.contains('is-open') && !e.target.closest('#site-nav, [data-action="menu"]')) setMenu(false);
  });

  /* ---------- delegated actions ---------- */
  doc.addEventListener('click', function (e) {
    var copyBtn = e.target.closest('.copy');
    if (copyBtn) {
      var label = copyBtn.getAttribute('data-label') || copyBtn.textContent;
      copyBtn.setAttribute('data-label', label);
      copyText(copyBtn.getAttribute('data-copy')).then(function () {
        copyBtn.textContent = copyBtn.getAttribute('data-done') || '✓';
        copyBtn.classList.add('is-done');
        setTimeout(function () { copyBtn.textContent = label; copyBtn.classList.remove('is-done'); }, 1600);
      });
      return;
    }
    var b = e.target.closest('[data-action]');
    if (!b) return;
    var a = b.getAttribute('data-action');
    if (a === 'theme') toggleTheme();
    else if (a === 'palette') { e.preventDefault(); openPalette(); }
    else if (a === 'palette-close') closePalette();
    else if (a === 'menu') setMenu(!nav.classList.contains('is-open'));
  });

  if (isMac) $$('.kbd-mod').forEach(function (k) { k.textContent = '⌘'; });

  /* ---------- command palette ---------- */
  var dlg = $('#palette');
  var pin = $('#palette-input');
  var plist = $('#palette-list');
  var pItems = pal.items || [];
  var pShown = [];
  var pSel = 0;
  var GROUPS = ['pages', 'work', 'research', 'writing', 'actions'];

  function fuzzy(q, text) {
    var t = text.toLowerCase();
    var sub = t.indexOf(q);
    if (sub >= 0) {
      var idx = [];
      for (var k = 0; k < q.length; k++) idx.push(sub + k);
      var atWord = sub === 0 || /[\s\-·:(]/.test(t.charAt(sub - 1));
      return { s: 100 - sub * 0.5 - t.length * 0.02 + (atWord ? 20 : 0), idx: idx, sub: true };
    }
    var qi = 0, s = 0, last = -2, hits = [];
    for (var i = 0; i < t.length && qi < q.length; i++) {
      if (t.charAt(i) === q.charAt(qi)) {
        hits.push(i);
        s += i === last + 1 ? 3 : 1;
        if (i === 0 || /[\s\-·:(]/.test(t.charAt(i - 1))) s += 2;
        last = i; qi++;
      }
    }
    return qi === q.length ? { s: s - t.length * 0.02, idx: hits } : null;
  }
  function highlight(text, idx) {
    if (!idx || !idx.length) return esc(text);
    var out = '', set = {};
    idx.forEach(function (i) { set[i] = true; });
    for (var i = 0; i < text.length; i++) out += set[i] ? '<mark>' + esc(text.charAt(i)) + '</mark>' : esc(text.charAt(i));
    return out.replace(/<\/mark><mark>/g, '');
  }
  function renderPalette() {
    var q = pin.value.trim().toLowerCase();
    var groups = {}, best = {}, anySub = false;
    pItems.forEach(function (it) {
      var m = q ? fuzzy(q, it.t) : { s: 0, idx: [] };
      if (!m && q && it.s) { var ms = fuzzy(q, it.s); if (ms) m = { s: ms.s - 30, idx: [], sub: ms.sub }; }
      if (!m) return;
      if (m.sub) anySub = true;
      (groups[it.g] = groups[it.g] || []).push({ it: it, s: m.s, idx: m.idx, sub: !!m.sub });
    });
    /* If anything matches as a substring, drop the scattered subsequence matches. */
    Object.keys(groups).forEach(function (g) {
      if (anySub) groups[g] = groups[g].filter(function (r) { return r.sub; });
      if (!groups[g].length) { delete groups[g]; return; }
      best[g] = Math.max.apply(null, groups[g].map(function (r) { return r.s; }));
    });
    var order = GROUPS.slice();
    if (q) order.sort(function (a, b) { return (best[b] == null ? -Infinity : best[b]) - (best[a] == null ? -Infinity : best[a]); });
    plist.innerHTML = '';
    pShown = [];
    order.forEach(function (g) {
      var arr = groups[g];
      if (!arr) return;
      if (q) arr = arr.sort(function (a, b) { return b.s - a.s; }).slice(0, 8);
      var h = doc.createElement('li');
      h.className = 'pl-group'; h.setAttribute('role', 'presentation');
      h.textContent = (pal.groups && pal.groups[g]) || g;
      plist.appendChild(h);
      arr.forEach(function (r) {
        var n = pShown.length;
        var li = doc.createElement('li');
        li.className = 'pl-item'; li.id = 'pl-' + n; li.setAttribute('role', 'option');
        li.innerHTML = '<span class="pl-t">' + highlight(r.it.t, r.idx) + '</span>' + (r.it.s ? '<span class="pl-s">' + esc(r.it.s) + '</span>' : '');
        li.addEventListener('click', function () { runItem(r.it); });
        li.addEventListener('pointermove', function () { if (pSel !== n) selectItem(n, false); });
        plist.appendChild(li);
        pShown.push(r.it);
      });
    });
    if (!pShown.length) plist.innerHTML = '<li class="pl-none" role="presentation">' + esc(pal.none || '—') + '</li>';
    selectItem(0, true);
  }
  function selectItem(n, scroll) {
    if (!pShown.length) { pin.removeAttribute('aria-activedescendant'); return; }
    pSel = (n + pShown.length) % pShown.length;
    $$('.pl-item', plist).forEach(function (li, i) { li.setAttribute('aria-selected', String(i === pSel)); });
    var cur = $('#pl-' + pSel);
    pin.setAttribute('aria-activedescendant', 'pl-' + pSel);
    if (scroll && cur) cur.scrollIntoView({ block: 'nearest' });
  }
  function runItem(it) {
    if (!it) return;
    if (it.a === 'theme') { toggleTheme(); closePalette(); }
    else if (it.a === 'grid') { toggleGrid(); closePalette(); }
    else if (it.a === 'email') { copyText(it.s); flashStatus('copied ' + it.s); closePalette(); }
    else if (it.a === 'lang') {
      var target = (it.l === pal.defaultLang ? '' : '/' + it.l) + (pal.path || '/');
      location.href = target + location.hash;
    } else if (it.u) {
      var u = localUrl(it.u);
      closePalette();
      if (/^https?:/.test(u)) window.open(u, '_blank', 'noopener'); else location.href = u;
    }
  }
  function openPalette() {
    if (!dlg) return;
    setMenu(false);
    if (!dlg.open) { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); }
    pin.value = '';
    renderPalette();
    pin.focus();
  }
  function closePalette() {
    if (!dlg || !dlg.open) return;
    if (dlg.close) dlg.close(); else dlg.removeAttribute('open');
  }
  if (dlg) {
    pin.addEventListener('input', renderPalette);
    pin.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); selectItem(pSel + 1, true); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); selectItem(pSel - 1, true); }
      else if (e.key === 'Enter') { e.preventDefault(); runItem(pShown[pSel]); }
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closePalette(); });
  }

  /* ---------- global keys ---------- */
  doc.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && !e.altKey && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (dlg && dlg.open) closePalette(); else openPalette();
      return;
    }
    if (e.key === 'Escape') setMenu(false);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || isTyping(e) || (dlg && dlg.open)) return;
    if (e.key === '/') {
      e.preventDefault();
      var field = $('[data-ix-search], [data-kwic-input]');
      if (field) { field.focus({ preventScroll: true }); field.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' }); }
      else openPalette();
    } else if (e.key === 'g') {
      toggleGrid();
    }
  });

  /* ---------- status bar ---------- */
  var sbSection = $('[data-sb="section"]');
  var sbPos = $('[data-sb="pos"]');
  var sbHint = $('[data-sb="hint"]');
  var sections = $$('[data-section]');
  var flashTimer;
  if (sbHint) sbHint.textContent = (isMac ? '⌘K' : 'ctrl K') + ' palette · / search · g grid';
  function flashStatus(msg) {
    if (!sbHint) return;
    clearTimeout(flashTimer);
    var old = sbHint.getAttribute('data-default') || sbHint.textContent;
    sbHint.setAttribute('data-default', old);
    sbHint.textContent = msg;
    flashTimer = setTimeout(function () { sbHint.textContent = old; }, 1800);
  }
  var ticking = false;
  function updateStatus() {
    ticking = false;
    var max = root.scrollHeight - window.innerHeight;
    var y = window.scrollY;
    if (sbPos) sbPos.textContent = max <= 4 ? 'All' : y < 4 ? 'Top' : y >= max - 4 ? 'Bot' : Math.round(y / max * 100) + '%';
    if (sbSection) {
      var cur = null, line = window.innerHeight * 0.35;
      for (var i = 0; i < sections.length; i++) if (sections[i].getBoundingClientRect().top < line) cur = sections[i];
      sbSection.textContent = cur ? cur.getAttribute('data-section') : '';
    }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(updateStatus); } }, { passive: true });
  window.addEventListener('resize', debounce(updateStatus, 100));
  updateStatus();

  /* ---------- 404 ---------- */
  $$('[data-nf-path]').forEach(function (el) { el.textContent = location.pathname; });

  /* ---------- specimen: dependency arcs, POS, tokens ---------- */
  var SVGNS = 'http://www.w3.org/2000/svg';
  function svgEl(name, attrs) {
    var el = doc.createElementNS(SVGNS, name);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  $$('[data-specimen]').forEach(function (fig) {
    var stage = $('.sp-stage', fig);
    var svg = $('.sp-arcs', fig);
    var sent = $('.sp-sent', fig);
    var toks = $('.sp-tokens', fig);
    var readout = $('.sp-readout', fig);
    var tabs = $$('.sp-modes [role="tab"]', fig);
    var L = { head: readout.getAttribute('data-head') || 'head', deps: readout.getAttribute('data-deps') || 'dependents' };

    var words = $$('.w', sent).map(function (el, i) {
      return { el: el, form: $('.w-form', el), i: i + 1, head: +el.getAttribute('data-head'), rel: el.getAttribute('data-rel'), pos: el.getAttribute('data-pos'), lemma: el.getAttribute('data-lemma') };
    });
    var byIdx = {};
    words.forEach(function (w) { byIdx[w.i] = w; });
    var rootWord = words.filter(function (w) { return w.head === 0; })[0];
    var arcs = words.filter(function (w) { return w.head > 0; }).map(function (w) {
      return { h: w.head, d: w.i, rel: w.rel, lo: Math.min(w.head, w.i), hi: Math.max(w.head, w.i) };
    });
    /* Height level: one above the tallest arc nested inside this one (projective trees). */
    arcs.sort(function (a, b) { return (a.hi - a.lo) - (b.hi - b.lo); });
    arcs.forEach(function (a) {
      var lvl = 1;
      arcs.forEach(function (b) { if (b !== a && b.level && b.lo >= a.lo && b.hi <= a.hi) lvl = Math.max(lvl, b.level + 1); });
      a.level = lvl;
    });
    var maxLevel = arcs.reduce(function (m, a) { return Math.max(m, a.level); }, 1);
    var drawn = false, animated = false;

    function draw(animate) {
      if (fig.getAttribute('data-mode') === 'tokens') return;
      var fs = parseFloat(getComputedStyle(sent).fontSize) || 16;
      var step = Math.max(15, Math.round(fs * 1.02));
      var top = (maxLevel + 1) * step + 16;
      if (fig.getAttribute('data-mode') === 'deps') sent.style.setProperty('--arc-h', top + 'px');
      var y0 = sent.offsetTop + top - 3;

      /* Spread each word's arc endpoints so arcs nest instead of colliding:
         left-going arcs short→long, then the root arrow, then right-going long→short. */
      var ends = {};
      words.forEach(function (w) {
        var left = arcs.filter(function (a) { return a.hi === w.i; }).sort(function (a, b) { return (a.hi - a.lo) - (b.hi - b.lo); });
        var right = arcs.filter(function (a) { return a.lo === w.i; }).sort(function (a, b) { return (b.hi - b.lo) - (a.hi - a.lo); });
        var list = left.concat(w === rootWord ? ['root'] : [], right);
        var x0 = w.form.offsetLeft, width = w.form.offsetWidth, cx = x0 + width / 2;
        var gap = list.length > 1 ? Math.min(7, (width - 2) / (list.length - 1)) : 0;
        list.forEach(function (a, k) {
          var x = cx + (k - (list.length - 1) / 2) * gap;
          if (a === 'root') ends.root = x; else ends[(a.lo === w.i ? 'lo' : 'hi') + ':' + a.lo + '-' + a.hi] = x;
        });
      });

      svg.innerHTML = '';
      svg.setAttribute('width', sent.scrollWidth + 4);
      svg.setAttribute('height', y0 + 2);
      svg.setAttribute('viewBox', '0 0 ' + (sent.scrollWidth + 4) + ' ' + (y0 + 2));

      arcs.forEach(function (a) {
        var x1 = ends['lo:' + a.lo + '-' + a.hi], x2 = ends['hi:' + a.lo + '-' + a.hi];
        var yt = y0 - a.level * step;
        var r = Math.min(5, (x2 - x1) / 2);
        var xd = a.d === a.lo ? x1 : x2;
        var g = svgEl('g', { 'class': 'arc', 'data-h': a.h, 'data-d': a.d });
        var line = svgEl('path', { 'class': 'arc-line', d: 'M' + x1 + ',' + y0 + ' V' + (yt + r) + ' Q' + x1 + ',' + yt + ' ' + (x1 + r) + ',' + yt + ' H' + (x2 - r) + ' Q' + x2 + ',' + yt + ' ' + x2 + ',' + (yt + r) + ' V' + (y0 - 4) });
        var headArrow = svgEl('path', { 'class': 'arc-head', d: 'M' + (xd - 3) + ',' + (y0 - 5) + ' L' + (xd + 3) + ',' + (y0 - 5) + ' L' + xd + ',' + y0 + ' Z' });
        var lw = a.rel.length * 6.4 + 6, mx = (x1 + x2) / 2;
        var bg = svgEl('rect', { x: mx - lw / 2, y: yt - 6.5, width: lw, height: 13, rx: 2 });
        var label = svgEl('text', { x: mx, y: yt + 3.6, 'text-anchor': 'middle' });
        label.textContent = a.rel;
        g.appendChild(line); g.appendChild(headArrow); g.appendChild(bg); g.appendChild(label);
        svg.appendChild(g);
        a.g = g;
        if (animate) { g.style.setProperty('--delay', (a.level - 1) * 0.09 + 's'); }
      });
      if (rootWord) {
        var xr = ends.root, yr = y0 - (maxLevel + 1) * step + 4;
        var g = svgEl('g', { 'class': 'arc arc-root', 'data-h': 0, 'data-d': rootWord.i });
        g.appendChild(svgEl('path', { 'class': 'arc-line', d: 'M' + xr + ',' + (yr + 8) + ' V' + (y0 - 4) }));
        g.appendChild(svgEl('path', { 'class': 'arc-head', d: 'M' + (xr - 3) + ',' + (y0 - 5) + ' L' + (xr + 3) + ',' + (y0 - 5) + ' L' + xr + ',' + y0 + ' Z' }));
        var t = svgEl('text', { x: xr, y: yr + 3, 'text-anchor': 'middle' });
        t.textContent = 'root';
        g.appendChild(t);
        svg.appendChild(g);
        if (animate) g.style.setProperty('--delay', maxLevel * 0.09 + 's');
      }
      if (animate && !reduceMotion) {
        $$('.arc', svg).forEach(function (g) {
          var p = $('.arc-line', g);
          g.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 1);
          g.classList.add('arc-draw');
        });
      }
      drawn = true;
      if (active) focusWord(active);
    }

    /* ---- hover / focus readout ---- */
    var active = null;
    var defaultNote = function () {
      return fig.getAttribute('data-mode') === 'tokens' ? readout.getAttribute('data-note-tokens') : readout.getAttribute('data-note-deps');
    };
    function kv(k, v) { return '<span class="k">' + esc(k) + '=</span>' + v; }
    function focusWord(w) {
      active = w;
      words.forEach(function (o) {
        o.el.classList.toggle('is-active', o === w);
        o.el.classList.toggle('is-rel', !!w && o !== w && (o.i === w.head || o.head === w.i));
      });
      $$('.arc', svg).forEach(function (g) {
        g.classList.toggle('is-on', !!w && (+g.getAttribute('data-h') === w.i || +g.getAttribute('data-d') === w.i));
      });
      svg.classList.toggle('is-focused', !!w);
      if (!w) { readout.textContent = defaultNote(); return; }
      var head = w.head ? byIdx[w.head] : null;
      var deps = words.filter(function (o) { return o.head === w.i; }).map(function (o) { return esc(o.form.textContent) + '<span class="k">/' + esc(o.rel) + '</span>'; });
      readout.innerHTML = '<b>' + esc(w.form.textContent) + '</b>  ' +
        kv('upos', esc(w.pos)) + '  ' + kv('lemma', esc(w.lemma)) + '  ' + kv('deprel', esc(w.rel)) + '  ' +
        kv(L.head, head ? head.i + ':' + esc(head.form.textContent) : '0') +
        (deps.length ? '  ·  ' + esc(L.deps) + ': ' + deps.join(' ') : '');
    }
    words.forEach(function (w) {
      w.el.addEventListener('pointerenter', function () { focusWord(w); });
      w.el.addEventListener('click', function () { focusWord(active === w ? null : w); });
    });
    sent.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') focusWord(null); });
    sent.addEventListener('focus', function () { if (!active) focusWord(words[0]); });
    sent.addEventListener('blur', function () { focusWord(null); });
    sent.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var i = active ? active.i : 0;
      i = e.key === 'ArrowRight' ? Math.min(words.length, i + 1) : Math.max(1, i - 1);
      focusWord(byIdx[i]);
      var f = byIdx[i].form;
      if (f.offsetLeft < stage.scrollLeft || f.offsetLeft + f.offsetWidth > stage.scrollLeft + stage.clientWidth) stage.scrollLeft = f.offsetLeft - 40;
    });

    /* ---- tokens ---- */
    var enc = window.TextEncoder ? new TextEncoder() : null;
    $$('.tok', toks).forEach(function (tk) {
      tk.addEventListener('pointerenter', function () {
        $$('.tok.is-active', toks).forEach(function (o) { o.classList.remove('is-active'); });
        tk.classList.add('is-active');
        var text = tk.getAttribute('data-text');
        readout.innerHTML = kv('id', esc(tk.getAttribute('data-id'))) + '  ' + kv('text', '“' + esc(text.replace(/ /g, '·')) + '”') +
          (enc ? '  ' + kv('bytes', enc.encode(text).length) : '');
      });
    });
    toks.addEventListener('pointerleave', function () {
      $$('.tok.is-active', toks).forEach(function (o) { o.classList.remove('is-active'); });
      readout.textContent = defaultNote();
    });

    /* ---- modes ---- */
    function setMode(mode) {
      fig.setAttribute('data-mode', mode);
      tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t.getAttribute('data-mode') === mode)); });
      var tokens = mode === 'tokens';
      sent.hidden = tokens; svg.style.display = tokens ? 'none' : '';
      toks.hidden = !tokens;
      if (mode === 'deps') { draw(!animated && !reduceMotion); animated = true; }
      else if (mode === 'pos') sent.style.removeProperty('--arc-h');
      focusWord(null);
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { setMode(t.getAttribute('data-mode')); });
      t.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        n.focus(); n.click();
      });
    });

    /* First draw: once fonts are ready and the figure is on screen. */
    var ready = doc.fonts && doc.fonts.ready ? doc.fonts.ready : Promise.resolve();
    ready.then(function () {
      draw(false);
      if (reduceMotion || !('IntersectionObserver' in window)) { animated = true; return; }
      $$('.arc', svg).forEach(function (g) { g.style.opacity = '0'; });
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        animated = true;
        draw(true);
      }, { threshold: 0.4 });
      io.observe(stage);
    });
    window.addEventListener('resize', debounce(function () { if (drawn) draw(false); }, 120));
  });

  /* ---------- portrait: IPA glyphs, photo under a lens ---------- */
  $$('[data-portrait]').forEach(function (fig) {
    var box = $('.portrait-box', fig);
    function place(e) {
      var r = box.getBoundingClientRect();
      fig.style.setProperty('--x', (e.clientX - r.left) + 'px');
      fig.style.setProperty('--y', (e.clientY - r.top) + 'px');
      fig.style.setProperty('--r', Math.round(r.width * 0.19) + 'px');
    }
    box.addEventListener('pointerenter', function (e) { place(e); fig.classList.add('is-lens'); });
    box.addEventListener('pointermove', place);
    box.addEventListener('pointerleave', function () { fig.classList.remove('is-lens'); });
    box.addEventListener('click', function (e) { place(e); fig.classList.toggle('is-open'); });

    /* "Resolve" once on first view: glyphs settle from noise into the portrait. */
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    function resolve() {
      var pre = $$('.portrait-ascii', fig).filter(function (p) { return p.offsetParent !== null; })[0];
      if (!pre) return;
      var target = pre.textContent;
      var glyphs = Array.from(new Set(target.replace(/\s/g, '').split(''))).join('');
      var chars = Array.from(target);
      var order = chars.map(function () { return Math.random(); });
      var start = null, dur = 900;
      function frame(ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var out = '';
        for (var i = 0; i < chars.length; i++) {
          var c = chars[i];
          out += (c === ' ' || c === '\n' || order[i] < p) ? c : glyphs.charAt((Math.random() * glyphs.length) | 0);
        }
        pre.textContent = out;
        if (p < 1) requestAnimationFrame(frame); else pre.textContent = target;
      }
      requestAnimationFrame(frame);
    }
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      resolve();
    }, { threshold: 0.3 });
    io.observe(box);
  });

  /* ---------- index pages: filter chips, grep, preview pane, j/k ---------- */
  $$('[data-ix]').forEach(function (ix) {
    var rows = $$('.ix-row', ix);
    var chips = $$('.chip', ix);
    var search = $('[data-ix-search]', ix);
    var count = $('[data-ix-count]', ix);
    var empty = $('[data-ix-empty]', ix);
    var preview = $('[data-ix-preview]', ix);
    var openLabel = ix.getAttribute('data-open') || 'open';
    var filter = '*';
    var active = null;
    var texts = rows.map(function (r) { return r.textContent.toLowerCase().replace(/\s+/g, ' '); });

    function visible() { return rows.filter(function (r) { return !r.hidden; }); }
    function setActive(r, opts) {
      opts = opts || {};
      if (active) active.classList.remove('is-active');
      active = r;
      if (!r) { preview.innerHTML = ''; return; }
      r.classList.add('is-active');
      var link = $('.ix-link', r);
      preview.innerHTML = '<span class="pv-no">' + esc($('.ix-no', r).textContent) + '</span>' +
        '<h3 class="pv-title">' + esc($('.ix-title', r).textContent) + '</h3>' +
        $('.ix-detail', r).innerHTML +
        '<a class="pv-open" tabindex="-1" href="' + esc(link.getAttribute('href')) + '"' + (link.target ? ' target="_blank" rel="noopener"' : '') + '>' + esc(openLabel) + ' ' + esc($('.ix-go', r).textContent) + '</a>';
      if (opts.focus) link.focus({ preventScroll: true });
      if (opts.scroll) r.scrollIntoView({ block: opts.center ? 'center' : 'nearest' });
    }
    function apply() {
      var q = search ? search.value.trim().toLowerCase() : '';
      var terms = q ? q.split(/\s+/) : [];
      var n = 0;
      rows.forEach(function (r, i) {
        var okF = filter === '*' || (' ' + r.getAttribute('data-group') + ' ').indexOf(' ' + filter + ' ') >= 0;
        var okQ = terms.every(function (t) { return texts[i].indexOf(t) >= 0; });
        r.hidden = !(okF && okQ);
        if (!r.hidden) n++;
      });
      if (count) count.textContent = n + ' / ' + rows.length;
      if (empty) empty.hidden = n > 0;
      if (!active || active.hidden) setActive(visible()[0] || null);
    }
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        filter = c.getAttribute('data-filter');
        chips.forEach(function (o) { o.setAttribute('aria-pressed', String(o === c)); });
        apply();
      });
    });
    if (search) {
      search.addEventListener('input', apply);
      search.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { search.value = ''; apply(); search.blur(); }
        else if (e.key === 'ArrowDown' || e.key === 'Enter') {
          var first = visible()[0];
          if (first) { e.preventDefault(); setActive(first, { focus: true, scroll: true }); }
        }
      });
    }
    rows.forEach(function (r) {
      r.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') setActive(r); });
      $('.ix-link', r).addEventListener('focus', function () { if (active !== r) setActive(r); });
    });
    doc.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e) || (dlg && dlg.open)) return;
      if (e.key !== 'j' && e.key !== 'k') return;
      var vis = visible();
      if (!vis.length) return;
      var i = vis.indexOf(active);
      i = e.key === 'j' ? Math.min(vis.length - 1, i + 1) : Math.max(0, i - 1);
      setActive(vis[i], { focus: true, scroll: true });
      e.preventDefault();
    });

    apply();
    var hash = decodeURIComponent(location.hash.slice(1));
    var target = hash && doc.getElementById(hash);
    if (target && rows.indexOf(target) >= 0) setActive(target, { scroll: true, center: true });
  });

  /* ---------- concordance (KWIC) ---------- */
  var WORD = /[\p{L}\p{N}\p{M}'’\-]/u;
  var CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;
  function isWordChar(c) { return !!c && WORD.test(c) && !CJK.test(c); }
  /* Matches start at a word boundary ("tone" → tone, tones; not stones);
     a leading * allows infix matches ("*tone" → Cantonese). */
  function kwicRegex(q) {
    var infix = q.charAt(0) === '*';
    var core = q.replace(/^\*+|\*+$/g, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    if (!core) return null;
    try {
      return new RegExp((infix || CJK.test(core) ? '' : '(?<![\\p{L}\\p{N}])') + core, 'giu');
    } catch (e) {
      return new RegExp(core, 'gi');
    }
  }

  $$('[data-kwic]').forEach(function (kw) {
    var input = $('[data-kwic-input]', kw);
    var status = $('[data-kwic-status]', kw);
    var listDefault = $('[data-kwic-default]', kw);
    var listResults = $('[data-kwic-results]', kw);
    var idleStatus = status.textContent;
    var corpus = null, pending = null, seq = 0;
    var MAX = 150, CTX = 80;

    function load() {
      if (corpus) return Promise.resolve(corpus);
      if (!pending) {
        status.textContent = kw.getAttribute('data-loading');
        pending = fetch(kw.getAttribute('data-corpus'))
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
          .then(function (docs) {
            var ta = doc.createElement('textarea');
            corpus = docs.map(function (d) { ta.innerHTML = d.x; d.x = ta.value.replace(/\s+/g, ' '); return d; });
            return corpus;
          })
          .catch(function (err) { pending = null; throw err; });
      }
      return pending;
    }
    function find(q) {
      var re = kwicRegex(q);
      if (!re) return { hits: [], texts: 0 };
      var hits = [], texts = 0;
      corpus.forEach(function (d) {
        var m, n = 0;
        re.lastIndex = 0;
        while ((m = re.exec(d.x))) {
          var s = m.index, e = s + m[0].length;
          while (s > 0 && isWordChar(d.x.charAt(s - 1)) && isWordChar(d.x.charAt(s))) s--;
          while (e < d.x.length && isWordChar(d.x.charAt(e)) && isWordChar(d.x.charAt(e - 1))) e++;
          hits.push({ d: d, n: n++, l: d.x.slice(Math.max(0, s - CTX), s), k: d.x.slice(s, e), r: d.x.slice(e, e + CTX) });
          re.lastIndex = Math.max(e, re.lastIndex);
        }
        if (n) texts++;
      });
      return { hits: hits, texts: texts, q: q };
    }
    function render(res) {
      listResults.innerHTML = '';
      var tpl = kw.getAttribute('data-hits') || '{h} / {t}';
      status.textContent = res.hits.length ? tpl.replace('{h}', res.hits.length).replace('{t}', res.texts) : kw.getAttribute('data-none');
      if (!res.hits.length) {
        listResults.innerHTML = '<li class="kwic-empty">' + esc(kw.getAttribute('data-none')) + '</li>';
        return;
      }
      var f = doc.createDocumentFragment();
      res.hits.slice(0, MAX).forEach(function (h) {
        var href = localUrl(h.d.u) + '#kwic=' + encodeURIComponent(res.q) + '~' + h.n;
        var li = doc.createElement('li');
        li.innerHTML = '<a class="kw-row" href="' + esc(href) + '">' +
          '<span class="kw-src" title="' + esc(h.d.t) + '">' + esc(h.d.t) + '</span>' +
          '<span class="kw-l"><span>' + esc(h.l) + '</span></span>' +
          '<span class="kw-r"><span><b class="kw-k">' + esc(h.k) + '</b>' + esc(h.r) + '</span></span>' +
          '<span class="kw-tag">' + esc(h.d.y || h.d.k) + '</span></a>';
        f.appendChild(li);
      });
      listResults.appendChild(f);
      if (res.hits.length > MAX) {
        var more = doc.createElement('li');
        more.className = 'kwic-more';
        more.textContent = '+' + (res.hits.length - MAX) + ' …';
        listResults.appendChild(more);
      }
    }
    var run = debounce(function () {
      var q = input.value.trim();
      var my = ++seq;
      if (q.length < 2 && !/[^\x00-\x7f]/.test(q)) {
        listResults.hidden = true; listDefault.hidden = false; status.textContent = idleStatus;
        return;
      }
      load().then(function () {
        if (my !== seq) return;
        render(find(q));
        listDefault.hidden = true; listResults.hidden = false;
      }, function () { status.textContent = '× corpus'; });
    }, 140);
    input.addEventListener('input', run);
    input.addEventListener('focus', function () { load().then(function () { if (!input.value) status.textContent = idleStatus; }, function () {}); }, { once: true });
    input.addEventListener('keydown', function (e) { if (e.key === 'Escape') { input.value = ''; run(); input.blur(); } });
  });

  /* ---------- reading pages ---------- */
  /* CV headings "Role | Org" → role, dotted leader, org. */
  $$('.doc h3').forEach(function (h) {
    var parts = h.textContent.split(' | ');
    if (parts.length !== 2) return;
    h.innerHTML = '<span class="h3-row"><span>' + esc(parts[0]) + '</span><span class="h3-lead" aria-hidden="true"></span><span class="h3-org">' + esc(parts[1]) + '</span></span>';
  });

  /* Arriving from the concordance (#kwic=<query>~<n>): highlight the nth occurrence. */
  var kwicHash = /^#kwic=([^~]+)~(\d+)$/.exec(location.hash);
  var body = $('.post-body');
  if (kwicHash && body) {
    var re = kwicRegex(decodeURIComponent(kwicHash[1]));
    var want = +kwicHash[2];
    var walker = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    var nodes = [], text = '', node;
    while ((node = walker.nextNode())) { nodes.push({ node: node, start: text.length }); text += node.nodeValue; }
    var matches = [], m;
    if (re) while ((m = re.exec(text))) { matches.push(m); if (!m[0].length) re.lastIndex++; }
    var hit = matches[want] || matches[0];
    if (hit) {
      var at = hit.index, end = at + hit[0].length;
      while (end < text.length && isWordChar(text.charAt(end)) && isWordChar(text.charAt(end - 1))) end++;
      var owner = null;
      for (var i = nodes.length - 1; i >= 0; i--) if (nodes[i].start <= at) { owner = nodes[i]; break; }
      if (owner) {
        var range = doc.createRange();
        var local = at - owner.start;
        range.setStart(owner.node, local);
        range.setEnd(owner.node, Math.min(owner.node.nodeValue.length, local + (end - at)));
        var mark = doc.createElement('mark');
        mark.className = 'kwic-hit';
        try { range.surroundContents(mark); } catch (e) { mark = owner.node.parentElement; }
        setTimeout(function () { mark.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' }); }, 60);
      }
    }
  }

  /* Table of contents + scroll spy for essays and papers with 3+ headings. */
  var toc = $('[data-toc]');
  if (toc) {
    var heads = $$('.post-body :is(h2, h3, h4)').filter(function (h) { return h.textContent.trim().length > 1; });
    if (heads.length >= 3) {
      var levels = heads.map(function (h) { return +h.tagName.charAt(1); });
      var topLevel = Math.min.apply(null, levels);
      var ol = $('ol', toc);
      var links = heads.map(function (h, i) {
        if (!h.id) h.id = 's-' + (i + 1) + '-' + h.textContent.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 40);
        var li = doc.createElement('li');
        if (levels[i] > topLevel) li.className = 'toc-sub';
        var a = doc.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent.trim().replace(/\s+/g, ' ');
        li.appendChild(a); ol.appendChild(li);
        return a;
      });
      toc.hidden = false;
      var spy = function () {
        var cur = 0;
        heads.forEach(function (h, i) { if (h.getBoundingClientRect().top < window.innerHeight * 0.3) cur = i; });
        links.forEach(function (a, i) { a.classList.toggle('is-current', i === cur); });
      };
      window.addEventListener('scroll', debounce(spy, 50), { passive: true });
      spy();
    }
  }
})();
