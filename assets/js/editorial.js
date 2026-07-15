/* ==========================================================================
   Editorial homepage motion — enhanced
   Drop-in replacement for assets/js/editorial.js

   Features:
     1. Scroll-reveal (existing, refined with per-element stagger)
     2. Scroll progress bar
     3. Nav shadow on scroll
     4. Section heading line-draw on enter
     5. Focus-list & writing-links staggered entrance
     6. About portrait reveal
     7. Card magnetic tilt on hover
     8. Ghost / watermark parallax (existing)
     9. Quote strip text parallax
    10. Cursor trailer dot (desktop only, non-touch)
   ========================================================================== */
(function () {
  'use strict';

  /* ---- Reduced motion check ---- */
  var prefersReduced = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  /* ---- Helper: safe querySelectorAll → array ---- */
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  /* ====================================================================
     1. SCROLL REVEAL  (existing behaviour, refined)
     ==================================================================== */
  var revealItems = $$('.editorial-home .reveal');

  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          revealIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    revealItems.forEach(function (el, i) {
      el.style.transitionDelay = ((i % 4) * 0.08) + 's';
      revealIO.observe(el);
    });
  }

  /* ====================================================================
     2. SCROLL PROGRESS BAR
     ==================================================================== */
  (function () {
    if (prefersReduced) return;
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          var scrollTop = window.scrollY;
          var docHeight = document.documentElement.scrollHeight - window.innerHeight;
          var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          bar.style.width = pct + '%';
          ticking = false;
        });
      }
    }, { passive: true });
  })();

  /* ====================================================================
     3. NAV SHADOW ON SCROLL
     ==================================================================== */
  (function () {
    var mast = document.querySelector('.masthead');
    if (!mast) return;
    var scrolled = false;

    window.addEventListener('scroll', function () {
      var past = window.scrollY > 30;
      if (past !== scrolled) {
        scrolled = past;
        mast.classList.toggle('scrolled', scrolled);
      }
    }, { passive: true });
  })();

  /* ====================================================================
     4. SECTION HEADING LINE-DRAW
     ==================================================================== */
  (function () {
    if (prefersReduced) return;
    var heads = $$('.editorial-home .sec-head');
    if (!heads.length || !('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('drawn');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });

    heads.forEach(function (h) { io.observe(h); });
  })();

  /* ====================================================================
     5. FOCUS-LIST, WRITING-LINKS & PORTRAIT STAGGER REVEAL
     ==================================================================== */
  (function () {
    if (prefersReduced) return;
    var targets = $$('.editorial-home .focus-list, .editorial-home .writing-links, .editorial-home .about-portrait');
    if (!targets.length || !('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });

    targets.forEach(function (el) { io.observe(el); });
  })();

  /* ====================================================================
     6. INK UNDERLINE  — inject a hand-drawn SVG stroke into target links
     ==================================================================== */
  (function () {
    if (prefersReduced) return;
    var SVGNS = 'http://www.w3.org/2000/svg';
    var links = $$('.editorial-home .writing-links a, .editorial-home .about-body a, .editorial-footer .foot-links a');
    links.forEach(function (a) {
      if (a.querySelector('svg')) return;
      var w = a.offsetWidth || 100;
      var svg = document.createElementNS(SVGNS, 'svg');
      svg.setAttribute('viewBox', '0 0 ' + w + ' 8');
      svg.setAttribute('preserveAspectRatio', 'none');
      var p = document.createElementNS(SVGNS, 'path');
      var j = function () { return (Math.random() * 1.6 - 0.8).toFixed(1); };
      var d = 'M1,' + (4 + +j()) +
              ' C ' + (w * 0.25) + ',' + (2 + +j()) + ' ' + (w * 0.4) + ',' + (6 + +j()) + ' ' + (w * 0.55) + ',' + (4 + +j()) +
              ' S ' + (w * 0.85) + ',' + (3 + +j()) + ' ' + (w - 1) + ',' + (4 + +j());
      p.setAttribute('d', d);
      svg.appendChild(p);
      a.classList.add('ink-uline');
      a.appendChild(svg);
      a.style.setProperty('--len', p.getTotalLength());
    });
  })();

  /* ====================================================================
     7. GHOST / WATERMARK PARALLAX  (existing)
     ==================================================================== */
  (function () {
    if (prefersReduced) return;
    var mark = document.querySelector('.editorial-home .hero-mark, .editorial-home .ghost');
    if (!mark) return;

    window.addEventListener('scroll', function () {
      mark.style.transform = 'translateY(' + (window.scrollY * 0.06) + 'px)';
    }, { passive: true });
  })();

  /* ====================================================================
     8. QUOTE STRIP TEXT PARALLAX
     ==================================================================== */
  (function () {
    if (prefersReduced) return;
    var strip = document.querySelector('.editorial-strip');
    if (!strip) return;

    var bq   = strip.querySelector('blockquote');
    var cite = strip.querySelector('cite');

    window.addEventListener('scroll', function () {
      var rect = strip.getBoundingClientRect();
      var vh   = window.innerHeight;

      // Only animate when the strip is near the viewport
      if (rect.bottom < -100 || rect.top > vh + 100) return;

      // 0 when top hits viewport bottom, 1 when centered
      var progress = 1 - (rect.top / vh);
      progress = Math.max(0, Math.min(progress, 2));

      var offset = (progress - 0.8) * -14;          // subtle shift
      var opacity = Math.min(1, progress * 1.3);

      if (bq) {
        bq.style.transform = 'translateY(' + offset + 'px)';
        bq.style.opacity = opacity;
      }
      if (cite) {
        cite.style.transform = 'translateY(' + (offset * 0.6) + 'px)';
        cite.style.opacity = Math.min(1, opacity * 0.9);
      }
    }, { passive: true });
  })();

})();
