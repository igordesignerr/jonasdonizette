(function () {
  // Menu: sombra ao rolar
  var topo = document.getElementById('topo');
  function aoRolar() { topo.classList.toggle('rolou', window.scrollY > 10); }
  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();

  // Menu mobile
  var btn = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu');
  function fechar() {
    menu.classList.remove('aberto');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Abrir menu');
  }
  btn.addEventListener('click', function () {
    var abrir = !menu.classList.contains('aberto');
    menu.classList.toggle('aberto', abrir);
    btn.setAttribute('aria-expanded', String(abrir));
    btn.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
  });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') fechar(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechar(); });

  var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Contagem dos números (de 0 até o valor, desacelerando no fim)
  function formata(el, v) {
    var casas = +(el.dataset.casas || 0);
    var txt = v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
    el.textContent = (el.dataset.prefixo || '') + txt + (el.dataset.sufixo || '');
  }
  function conta(el) {
    var alvo = parseFloat(el.dataset.conta), dur = 1800, ini = null;
    function passo(t) {
      if (!ini) ini = t;
      var p = Math.min((t - ini) / dur, 1);
      formata(el, alvo * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(passo); else formata(el, alvo);
    }
    requestAnimationFrame(passo);
  }

  // 1. Máquina de escrever: escreve letra por letra quando a frase aparece
  function escrever(el) {
    var texto = el.textContent, i = 0;
    el.setAttribute('aria-label', texto);
    el.innerHTML = '<span class="escr-feito" aria-hidden="true"></span><span class="escr-cursor" aria-hidden="true"></span><span class="escr-resto" aria-hidden="true"></span>';
    var feito = el.children[0], resto = el.children[2];
    resto.textContent = texto;
    (function passo() {
      i++;
      feito.textContent = texto.slice(0, i);
      resto.textContent = texto.slice(i);
      if (i < texto.length) setTimeout(passo, texto[i - 1] === ' ' ? 70 : 38);
    })();
  }

  // 3. Inclinação 3D nos botões da hero (só com mouse)
  if (!semMovimento && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('[data-tilt-grupo] > a').forEach(function (bt) {
      bt.addEventListener('mousemove', function (e) {
        var r = bt.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        bt.classList.add('inclinando');
        bt.style.setProperty('--ry', (x * 18).toFixed(1) + 'deg');
        bt.style.setProperty('--rx', (-y * 22).toFixed(1) + 'deg');
        bt.style.setProperty('--sx', (-x * 14).toFixed(1) + 'px');
        bt.style.setProperty('--sy', (10 - y * 8).toFixed(1) + 'px');
      });
      bt.addEventListener('mouseleave', function () {
        bt.classList.remove('inclinando');
        ['--rx', '--ry', '--sx', '--sy'].forEach(function (p) { bt.style.removeProperty(p); });
      });
    });
  }

  // 4. Selo de texto circular: monta as letras em volta do círculo
  var selos = document.querySelectorAll('[data-circular]');
  // Letras distribuídas por igual em volta do círculo
  function montaSelo(selo) {
    var anel = selo.querySelector('.selo-anel');
    var letras = Array.from(selo.dataset.circular);
    anel.innerHTML = '';
    letras.forEach(function (l, i) {
      var sp = document.createElement('span');
      sp.className = 'selo-letra';
      sp.textContent = l;
      sp.style.transform = 'rotate(' + (360 / letras.length) * i + 'deg)';
      anel.appendChild(sp);
    });
  }
  selos.forEach(montaSelo);
  if (!semMovimento) {
    selos.forEach(function (selo) {
      var anel = selo.querySelector('.selo-anel'), tilt = selo.querySelector('.selo-tilt');
      var ang = 0, vel = 1, alvo = 1, ultimo = null, rodando = false;
      var cruzeiro = 360 / 22; // uma volta a cada 22 s
      function giro(t) {
        if (!rodando) { ultimo = null; return; }
        if (ultimo !== null) {
          var dt = Math.min(t - ultimo, 100) / 1000;
          vel += (alvo - vel) * Math.min(dt * 3, 1); // acelera e desacelera suave
          ang = (ang + cruzeiro * vel * dt) % 360;
          anel.style.transform = 'rotate(' + ang + 'deg)';
        }
        ultimo = t;
        requestAnimationFrame(giro);
      }
      new IntersectionObserver(function (e) {
        var vis = e[0].isIntersecting;
        if (vis && !rodando) { rodando = true; requestAnimationFrame(giro); }
        rodando = vis;
      }).observe(selo);
      if (window.matchMedia('(hover: hover)').matches) {
        selo.addEventListener('pointerenter', function () { alvo = 4; });
        selo.addEventListener('pointerleave', function () {
          alvo = 1; tilt.style.removeProperty('--srx'); tilt.style.removeProperty('--sry');
        });
        selo.addEventListener('pointermove', function (e) {
          var r = selo.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width * 2 - 1, y = (e.clientY - r.top) / r.height * 2 - 1;
          tilt.style.setProperty('--srx', (-y * 20).toFixed(1) + 'deg');
          tilt.style.setProperty('--sry', (x * 20).toFixed(1) + 'deg');
        });
      }
    });
  }

  // Botões de compartilhar (só abrem o link da rede; nenhum dado é coletado)
  document.querySelectorAll('.partilha').forEach(function (box) {
    var url = encodeURIComponent(location.href), tit = encodeURIComponent(box.dataset.titulo || document.title);
    var links = {
      whatsapp: 'https://wa.me/?text=' + tit + '%20' + url,
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + url,
      x: 'https://twitter.com/intent/tweet?text=' + tit + '&url=' + url
    };
    box.querySelectorAll('[data-rede]').forEach(function (el) {
      var rede = el.dataset.rede;
      if (links[rede]) { el.href = links[rede]; el.target = '_blank'; el.rel = 'noopener'; return; }
      el.addEventListener('click', function () {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(location.href).then(function () {
          el.classList.add('copiado'); el.setAttribute('aria-label', 'Link copiado');
          setTimeout(function () { el.classList.remove('copiado'); el.setAttribute('aria-label', 'Copiar link'); }, 2000);
        });
      });
    });
  });

  // Entradas suaves ao rolar
  var itens = document.querySelectorAll('.reveal');
  var numeros = document.querySelectorAll('[data-conta]');
  if (!('IntersectionObserver' in window) || semMovimento) {
    itens.forEach(function (el) { el.classList.add('visivel'); });
    return;
  }
  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('visivel'); obs.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  itens.forEach(function (el) { obs.observe(el); });

  var obsNum = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (en) {
      if (en.isIntersecting) { conta(en.target); obsNum.unobserve(en.target); }
    });
  }, { threshold: 0.6 });
  numeros.forEach(function (el) { formata(el, 0); obsNum.observe(el); });

  var obsEscr = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (en) {
      if (en.isIntersecting) { obsEscr.unobserve(en.target); setTimeout(function () { escrever(en.target); }, 350); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-escrever]').forEach(function (el) { obsEscr.observe(el); });
})();
