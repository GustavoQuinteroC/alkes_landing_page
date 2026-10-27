(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* tema */
  var tb = $('.nav__tema');
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('alkes-tema', t); } catch (e) {}
    if (tb) tb.setAttribute('aria-label', t === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
    var m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', t === 'dark' ? '#050A18' : '#F3F5FB');
  }
  if (tb) {
    setTheme(root.getAttribute('data-theme') || 'dark');
    tb.addEventListener('click', function () { setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); });
  }

  /* menú móvil */
  var bg = $('.nav__burger'), menu = $('.menu');
  function closeMenu() { if (!menu) return; menu.classList.remove('is-open'); bg.setAttribute('aria-expanded', 'false'); d.body.style.overflow = ''; }
  if (bg && menu) {
    bg.addEventListener('click', function () {
      var o = !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', o); bg.setAttribute('aria-expanded', String(o)); d.body.style.overflow = o ? 'hidden' : '';
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* entrada al hacer scroll */
  var rs = $$('[data-r]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
    rs.forEach(function (r) { io.observe(r); });
  } else rs.forEach(function (r) { r.classList.add('in'); });

  /* contador */
  $$('[data-count]').forEach(function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce || !('IntersectionObserver' in window)) { el.textContent = to; return; }
    el.textContent = '0';
    var o = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; o.disconnect();
      var t0 = performance.now(), dur = 1400;
      (function tick(t) {
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(to * e);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: .6 });
    o.observe(el);
  });

  /* luz que sigue al cursor en las tarjetas */
  if (fine && !reduce) {
    $$('.tile').forEach(function (t) {
      t.addEventListener('pointermove', function (e) {
        var r = t.getBoundingClientRect();
        t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* mapa de red: paralaje por capas y enlace resaltado al pasar el cursor */
  var net = $('.net');
  if (net && fine && !reduce) {
    var nds = $$('.nd', net), tx = 0, ty = 0, cx = 0, cy = 0, run = false, vis = true;
    new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(net);
    d.addEventListener('pointermove', function (e) {
      tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5;
      if (!run && vis) { run = true; requestAnimationFrame(loop); }
    });
    var loop = function () {
      cx += (tx - cx) * .07; cy += (ty - cy) * .07;
      nds.forEach(function (n) { var k = +n.getAttribute('data-depth') || 0; n.style.transform = 'translate3d(' + (-cx * k).toFixed(1) + 'px,' + (-cy * k).toFixed(1) + 'px,0)'; });
      if (Math.abs(tx - cx) > .002 || Math.abs(ty - cy) > .002) requestAnimationFrame(loop); else run = false;
    };
  }
  /* detalle animado de cada servicio */
  var wrap = $('.netwrap');
  if (wrap) {
    var nx = $('.nx', wrap), nxItems = $$('.nx__i', wrap), nodes = $$('button.nd', wrap), cur = -1, tOpen, tClose, lastType = 'mouse';
    var openI = function (i) {
      clearTimeout(tClose); cur = i;
      nx.classList.add('is-open'); net.classList.add('is-open');
      nxItems.forEach(function (it) { it.classList.toggle('is-on', +it.getAttribute('data-i') === i); });
      nodes.forEach(function (n) { var on = +n.getAttribute('data-i') === i; n.classList.toggle('is-on', on); var p = $('#ln' + n.getAttribute('data-ln'), net); if (p) p.classList.toggle('hot', on); });
    };
    var closeI = function () {
      clearTimeout(tOpen); cur = -1; nx.classList.remove('is-open'); net.classList.remove('is-open');
      nodes.forEach(function (n) { n.classList.remove('is-on'); });
      $$('.ln', net).forEach(function (p) { p.classList.remove('hot'); });
    };
    nodes.forEach(function (n) {
      var i = +n.getAttribute('data-i');
      n.addEventListener('pointerdown', function (e) { lastType = e.pointerType; });
      if (fine) n.addEventListener('pointerenter', function () { clearTimeout(tClose); clearTimeout(tOpen); tOpen = setTimeout(function () { openI(i); }, 90); });
      n.addEventListener('click', function () { if (lastType === 'mouse' && cur === i && fine) return; cur === i ? closeI() : openI(i); lastType = 'mouse'; });
    });
    if (fine) {
      wrap.addEventListener('pointerleave', function () { clearTimeout(tOpen); tClose = setTimeout(closeI, 380); });
      wrap.addEventListener('pointerenter', function () { clearTimeout(tClose); });
    }
    $('.nx__x', wrap).addEventListener('click', closeI);
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && cur > -1) { var n = nodes[cur]; closeI(); if (n) n.focus(); } });
    d.addEventListener('pointerdown', function (e) { if (cur > -1 && !wrap.contains(e.target)) closeI(); });
  }
  if (reduce) $$('animateMotion').forEach(function (a) { a.remove(); });

  /* productos en pestañas */
  var ptabs = $$('.ptab'), ppans = $$('.ppanel');
  function selTab(t, focus) {
    ptabs.forEach(function (x) { var on = x === t; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; });
    ppans.forEach(function (p) { p.classList.toggle('is-on', p.id === t.getAttribute('aria-controls')); });
    if (focus) t.focus();
    t.scrollIntoView({ block: 'nearest', inline: 'center' });
  }
  ptabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selTab(t); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, n = k === 'ArrowRight' ? i + 1 : k === 'ArrowLeft' ? i - 1 : k === 'Home' ? 0 : k === 'End' ? ptabs.length - 1 : -1;
      if (n < 0) return; e.preventDefault(); selTab(ptabs[(n + ptabs.length) % ptabs.length], true);
    });
  });

  /* riel de servicios */
  var rls = $$('.rl');
  function openRl(r) { rls.forEach(function (x) { x.classList.toggle('is-on', x === r); x.setAttribute('aria-expanded', String(x === r)); }); }
  rls.forEach(function (r) {
    r.addEventListener('click', function (e) { if (!r.classList.contains('is-on') && !e.target.closest('a')) openRl(r); });
    r.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target === r) { e.preventDefault(); openRl(r); } });
    if (fine) r.addEventListener('pointerenter', function () { openRl(r); });
  });

  /* pausa de las ilustraciones de servicios fuera de pantalla */
  if ('IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('is-off', !e.isIntersecting); }); });
    $$('.svc-c').forEach(function (c) { sio.observe(c); });
  }

  /* línea del proceso */
  var steps = $('.steps');
  if (steps && 'IntersectionObserver' in window && !reduce) {
    var items = $$('.step', steps), ln = $('.steps__ln', steps);
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-on'); var n = items.indexOf(e.target) + 1; ln.style.setProperty('--p', Math.min(1, (n - .5) / items.length + (n === items.length ? .5 : 0))); so.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -25% 0px' });
    items.forEach(function (s) { so.observe(s); });
  } else { $$('.step').forEach(function (s) { s.classList.add('is-on'); }); var l = $('.steps__ln'); if (l) l.style.setProperty('--p', 1); }

})();
