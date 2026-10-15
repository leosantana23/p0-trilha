/* Artesanatos Juliana — comportamento da página
   Organização: 1 utilidades · 2 rolagem (barra, topo, paralaxe) · 3 menu · 4 entrada dos blocos
   · 5 título animado · 6 números e Natal · 7 vitrine e foto ampliada · 8 guirlanda de família
   · 9 avaliações · 10 extras. Tudo respeita "reduzir movimento" e o modo ?static (sem animações). */
(function () {
  'use strict';

  /* ---------- 1. utilidades ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || location.search.indexOf('static') > -1;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var y = new Date().getFullYear();

  /* ---------- 2. rolagem: um único ouvinte, uma atualização por quadro ---------- */
  var header = $('#header'), progress = $('#progress'), toTop = $('#toTop'), hero = $('.hero');
  var ticking = false;
  function onScroll() {
    var sy = window.scrollY || root.scrollTop;
    var max = root.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', sy > 30);
    progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(sy / max, 1) : 0) + ')';
    toTop.classList.toggle('show', sy > 900);
    if (!reduce && sy < 1400) root.style.setProperty('--sy', sy);   // paralaxe suave dos brilhos do topo
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* o topo só se mexe enquanto está visível (economiza bateria) */
  if (hasIO) {
    new IntersectionObserver(function (es) { hero.classList.toggle('paused', !es[0].isIntersecting); }).observe(hero);
    var tk = $('.ticker');
    if (tk) new IntersectionObserver(function (es) { tk.classList.toggle('paused', !es[0].isIntersecting); }).observe(tk);
  }

  /* o desenho do topo acompanha de leve o mouse (só computador) */
  if (!reduce && finePointer) {
    var mouseTick = false, mx = 0, my = 0;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5;
      if (!mouseTick) { mouseTick = true; requestAnimationFrame(function () { hero.style.setProperty('--mx', mx.toFixed(3)); hero.style.setProperty('--my', my.toFixed(3)); mouseTick = false; }); }
    });
  }

  /* ---------- 3. menu (celular) e destaque da seção atual ---------- */
  var nav = $('#nav'), menuBtn = $('#menuBtn');
  function closeMenu() { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.textContent = '☰ Menu'; }
  menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? '✕ Fechar' : '☰ Menu';
  });
  $$('#nav a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  if (hasIO) {
    var links = $$('#nav a');
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); }); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) spy.observe(s); });
  }

  /* ---------- 4. entrada dos blocos ao rolar (uma vez, suave) ---------- */
  var chips = $$('.chip'), cards = $$('#grid .card');
  if (!reduce) {
    cards.forEach(function (c, i) { c.classList.add('reveal'); c.style.setProperty('--d', ((i % 3) * .1) + 's'); });
  }
  var rev = $$('.reveal');
  if (reduce || !hasIO) { rev.forEach(function (el) { el.classList.add('in'); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; el.classList.add('in'); io.unobserve(el);
        if (el.classList.contains('card')) setTimeout(function () { el.classList.remove('reveal', 'in'); }, 1400);   // devolve o efeito de passar o mouse
      });
    }, { threshold: .12 });
    rev.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 5. título do topo: palavra por palavra ---------- */
  var h1 = $('#titulo');
  if (!reduce && h1) {
    var n = 0;
    (function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w'; w.style.setProperty('--i', n++); w.textContent = t; frag.appendChild(w);
          });
          c.parentNode.replaceChild(frag, c);
        } else if (c.nodeType === 1) split(c);
      });
    })(h1);
    requestAnimationFrame(function () { requestAnimationFrame(function () { h1.classList.add('split-in'); }); });
  }

  /* ---------- 6. Natal e números ---------- */
  var now = new Date();
  var today = new Date(y, now.getMonth(), now.getDate());
  var xmas = new Date(y, 11, 25);
  if (today > xmas) xmas = new Date(y + 1, 11, 25);
  var days = Math.round((xmas - today) / 86400000);
  var cd = $('#cdText');
  if (days === 0) cd.textContent = 'Hoje é Natal! Feliz Natal a todos ♥';
  else if (days <= 120) cd.innerHTML = 'Faltam <b>' + days + '</b> dias para o Natal. Veja as guirlandas na vitrine';

  $('#anos').textContent = y - 2012;
  function count(el) {
    var end = parseInt(el.textContent, 10);
    if (reduce) return;
    var t0 = null;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1300, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    el.textContent = '0'; requestAnimationFrame(step);
  }
  if (hasIO) {
    var cio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { count(e.target); cio.unobserve(e.target); } }); }, { threshold: .6 });
    $$('[data-count]').forEach(function (el) { cio.observe(el); });
  }

  /* ---------- 7. vitrine: filtro e foto ampliada ---------- */
  function apply(f) {
    chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.filter === f)); });
    cards.forEach(function (card) {
      var show = f === 'todos' || card.dataset.cat.split(' ').indexOf(f) > -1;
      if (show) { card.hidden = false; card.classList.add('fading'); requestAnimationFrame(function () { requestAnimationFrame(function () { card.classList.remove('fading'); }); }); }
      else card.hidden = true;
    });
  }
  chips.forEach(function (c) { c.addEventListener('click', function () { apply(c.dataset.filter); }); });
  $$('[data-filter-link]').forEach(function (a) { a.addEventListener('click', function () { apply(a.dataset.filterLink); }); });

  var lb = $('#lb'), lbImg = $('#lbImg'), idx = 0;
  function visible() { return cards.filter(function (c) { return !c.hidden && c.offsetParent !== null; }); }
  function show(i) {
    var list = visible(); if (!list.length) return;
    idx = (i + list.length) % list.length;
    var c = list[idx], img = $('img', c), go = $('a.go', c);
    lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt;
    $('#lbTitle').textContent = $('h3', c).textContent;
    var b = $('#lbGo'); b.href = go.href; b.textContent = go.textContent.replace(' ›', '');
  }
  cards.forEach(function (c) {
    $('.pic', c).addEventListener('click', function () {
      show(visible().indexOf(c));
      if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
    });
  });
  $('#lbPrev').addEventListener('click', function () { show(idx - 1); });
  $('#lbNext').addEventListener('click', function () { show(idx + 1); });
  $('#lbClose').addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.open) return;
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  /* no celular: arrastar a foto para o lado troca de peça */
  var sx = null;
  lbImg.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lbImg.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
  });

  /* ---------- 8. guirlanda de família ---------- */
  /* foto interativa: pontos, foco com "luz", visita guiada e atalhos para o pedido */
  var hw = $('#hotwrap'), hots = $$('.hot'), hchips = $$('.hot-chip'), curHot = -1;
  function openHot(i, focusDot) {
    curHot = i;
    hots.forEach(function (h, k) {
      var on = k === i; h.classList.toggle('open', on);
      $('.dot', h).setAttribute('aria-expanded', String(on));
    });
    hchips.forEach(function (c, k) { c.setAttribute('aria-pressed', String(k === i)); });
    hw.classList.toggle('focus', i > -1);
    if (i > -1) {
      hw.style.setProperty('--hx', hots[i].style.left); hw.style.setProperty('--hy', hots[i].style.top);
      if (focusDot) $('.dot', hots[i]).focus({ preventScroll: true });
    }
  }
  hots.forEach(function (h, k) {
    $('.dot', h).addEventListener('click', function (e) { e.stopPropagation(); openHot(curHot === k ? -1 : k); });
    $$('.tipnav button', h).forEach(function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); openHot((k + parseInt(b.dataset.dir, 10) + hots.length) % hots.length, true); });
    });
    var go = $('.tipgo[data-go]', h);
    if (go) go.addEventListener('click', function (e) {
      e.stopPropagation();
      var row = $('#' + go.dataset.go).closest('.row'); openHot(-1);
      row.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      row.classList.remove('flash'); void row.offsetWidth; row.classList.add('flash');
    });
    h.addEventListener('click', function (e) { e.stopPropagation(); });
  });
  hchips.forEach(function (c, k) { c.addEventListener('click', function (e) { e.stopPropagation(); openHot(curHot === k ? -1 : k); }); });
  document.addEventListener('click', function () { if (curHot > -1) openHot(-1); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && curHot > -1) openHot(-1); });
  /* ao chegar na foto, os pontos "acenam" uma única vez */
  if (!reduce && hasIO && hw) {
    var wio = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { hw.classList.add('wave'); setTimeout(function () { hw.classList.remove('wave'); }, 2400); wio.disconnect(); }
    }, { threshold: .5 });
    wio.observe(hw);
  }

  /* passos acendem conforme a pessoa rola */
  var steps = $$('.steps li');
  if (reduce || !hasIO) { steps.forEach(function (s) { s.classList.add('active'); }); }
  else {
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('active', e.isIntersecting); });
    }, { rootMargin: '-35% 0px -35% 0px' });
    steps.forEach(function (s) { sio.observe(s); });
  }

  /* montador de pedido */
  var st = { adultos: 2, criancas: 1, pets: 0 };
  function plural(n, s, p) { return n + ' ' + (n === 1 ? s : p); }
  function build() {
    var frase = $('#frase').value;
    var txt = plural(st.adultos, 'adulto', 'adultos') + ', ' + plural(st.criancas, 'criança', 'crianças') + ' e ' + plural(st.pets, 'pet', 'pets');
    $('#resumo').textContent = 'Sua guirlanda: ' + txt + ' · frase: ' + frase;
    var msg = 'Olá, Juliana! Quero encomendar uma guirlanda de família.\nPessoas e pets: ' + txt + '.\nFrase: ' + frase + '.\nPosso te contar os detalhes de cada um?';
    $('#builderBtn').href = 'https://wa.me/5512981172440?text=' + encodeURIComponent(msg);
  }
  $$('.stepper button').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.dataset.step; st[k] = Math.max(0, Math.min(8, st[k] + parseInt(b.dataset.d, 10)));
      $('#' + k).textContent = st[k]; build();
    });
  });
  $('#frase').addEventListener('change', build); build();

  /* ---------- 9. avaliações: setas e barra de posição ---------- */
  var sl = $('#slider'), bar = $('#sliderBar');
  function by(dir) { var w = $('.quote', sl).getBoundingClientRect().width + 20; sl.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' }); }
  function pos() {
    var sw = sl.scrollWidth || 1;
    bar.style.width = Math.min(sl.clientWidth / sw * 100, 100) + '%';
    bar.style.marginLeft = (sl.scrollLeft / sw * 100) + '%';
  }
  $('#prev').addEventListener('click', function () { by(-1); });
  $('#next').addEventListener('click', function () { by(1); });
  sl.addEventListener('scroll', function () { requestAnimationFrame(pos); }, { passive: true });
  window.addEventListener('resize', pos); pos();

  /* ---------- 10. extras ---------- */
  $('#share').addEventListener('click', function () {
    var data = { title: 'Artesanatos Juliana', text: 'Olha que lindas as peças de feltro da Juliana!', url: location.href };
    if (navigator.share) navigator.share(data).catch(function () {});
    else window.open('https://wa.me/?text=' + encodeURIComponent(data.text + ' ' + data.url), '_blank', 'noopener');
  });
  $('#ano').textContent = y;
})();
