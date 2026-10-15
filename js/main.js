/* Artesanatos Juliana — comportamento da página (menu, revelar ao rolar, vitrine, foto ampliada, pedido de guirlanda) */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || location.search.indexOf('static') > -1;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Cabeçalho: sombra ao rolar + menu do celular */
  var header = $('#header'), nav = $('#nav'), menuBtn = $('#menuBtn');
  window.addEventListener('scroll', function () { header.classList.toggle('scrolled', window.scrollY > 30); }, { passive: true });
  function closeMenu() { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.textContent = '☰ Menu'; }
  menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? '✕ Fechar' : '☰ Menu';
  });
  $$('#nav a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* Destaque do item do menu da seção atual */
  if ('IntersectionObserver' in window) {
    var links = $$('#nav a');
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) spy.observe(s); });
  }

  /* Revelar ao rolar (uma vez, suave) */
  var rev = $$('.reveal');
  if (reduce || !('IntersectionObserver' in window)) { rev.forEach(function (el) { el.classList.add('in'); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12 });
    rev.forEach(function (el) { io.observe(el); });
  }

  /* Contagem regressiva do Natal */
  var now = new Date(), y = now.getFullYear();
  var today = new Date(y, now.getMonth(), now.getDate());
  var xmas = new Date(y, 11, 25);
  if (today > xmas) xmas = new Date(y + 1, 11, 25);
  var days = Math.round((xmas - today) / 86400000);
  var cd = $('#cdText');
  if (days === 0) cd.textContent = 'Hoje é Natal! Feliz Natal a todos ♥';
  else if (days <= 120) cd.innerHTML = 'Faltam <b>' + days + '</b> dias para o Natal. Veja as guirlandas na vitrine';

  /* Números que sobem até o valor final */
  $('#anos').textContent = y - 2012;
  function count(el) {
    var end = parseInt(el.textContent, 10);
    if (reduce) return;
    var t0 = null;
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1300, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    el.textContent = '0'; requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { count(e.target); cio.unobserve(e.target); } }); }, { threshold: .6 });
    $$('[data-count]').forEach(function (el) { cio.observe(el); });
  }

  /* Filtro da vitrine */
  var chips = $$('.chip'), cards = $$('#grid .card');
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

  /* Foto ampliada */
  var lb = $('#lb'), idx = 0;
  function visible() { return cards.filter(function (c) { return !c.hidden && c.offsetParent !== null; }); }
  function show(i) {
    var list = visible(); if (!list.length) return;
    idx = (i + list.length) % list.length;
    var c = list[idx], img = $('img', c), go = $('a.go', c);
    $('#lbImg').src = img.currentSrc || img.src; $('#lbImg').alt = img.alt;
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
  document.addEventListener('keydown', function (e) { if (!lb.open) return; if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });

  /* Monte o seu pedido (guirlanda de família) */
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

  /* Avaliações: setas grandes */
  var sl = $('#slider');
  function by(dir) { var w = $('.quote', sl).getBoundingClientRect().width + 20; sl.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' }); }
  $('#prev').addEventListener('click', function () { by(-1); });
  $('#next').addEventListener('click', function () { by(1); });

  /* Compartilhar */
  $('#share').addEventListener('click', function () {
    var data = { title: 'Artesanatos Juliana', text: 'Olha que lindas as peças de feltro da Juliana!', url: location.href };
    if (navigator.share) navigator.share(data).catch(function () {});
    else window.open('https://wa.me/?text=' + encodeURIComponent(data.text + ' ' + data.url), '_blank', 'noopener');
  });
  $('#ano').textContent = y;
})();
