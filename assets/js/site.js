/* kasseygc.github.io — small enhancements only: the mobile menu and a page
   background that fades to the tint of whichever section is in view. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  /* Mobile menu */
  var menuBtn = doc.querySelector('[data-menu]');
  var nav = doc.getElementById('site-nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
    });
  }

  /* Links to other sites, and PDFs, open in a new tab so the site stays open. */
  Array.prototype.forEach.call(doc.querySelectorAll('a[href]'), function (a) {
    var href = a.getAttribute('href');
    if (/^(mailto|tel):/i.test(href) || href.charAt(0) === '#') return;
    var url;
    try { url = new URL(href, location.href); } catch (e) { return; }
    if (url.origin === location.origin && !/^\/files\//.test(url.pathname) && !/\.pdf$/i.test(url.pathname)) return;
    a.target = '_blank';
    var rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
    if (rel.indexOf('noopener') < 0) rel.push('noopener');
    a.setAttribute('rel', rel.join(' '));
  });

  /* Background tint */
  var tinted = doc.querySelectorAll('[data-tint]');
  if (tinted.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) root.style.setProperty('--tint', e.target.getAttribute('data-tint'));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    Array.prototype.forEach.call(tinted, function (el) { io.observe(el); });
  }

  /* CV headings written as "Role | Organisation": set the organisation apart. */
  Array.prototype.forEach.call(doc.querySelectorAll('.doc h3'), function (h) {
    var parts = h.textContent.split(' | ');
    if (parts.length !== 2) return;
    h.textContent = '';
    var row = doc.createElement('span');
    row.className = 'h3-row';
    var role = doc.createElement('span');
    role.textContent = parts[0];
    var org = doc.createElement('span');
    org.className = 'h3-org';
    org.textContent = parts[1];
    row.appendChild(role);
    row.appendChild(org);
    h.appendChild(row);
  });
})();
