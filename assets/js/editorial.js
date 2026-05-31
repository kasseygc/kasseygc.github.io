/* Editorial homepage motion: scroll reveals + schwa watermark parallax.
   Kept as an external file so the HTML-compressing layout can't break it. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.editorial-home .reveal');

  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });

  items.forEach(function (el, i) {
    el.style.transitionDelay = ((i % 4) * 0.08) + 's';
    io.observe(el);
  });

  var mark = document.querySelector('.editorial-home .hero-mark, .editorial-home .ghost');
  if (mark) {
    window.addEventListener('scroll', function () {
      mark.style.transform = 'translateY(' + (window.scrollY * 0.06) + 'px)';
    }, { passive: true });
  }
})();
