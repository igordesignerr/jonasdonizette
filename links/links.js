(function () {
  /* ===== CONFIGURAÇÃO — é só colar o link entre as aspas =====
     Vazio = o botão aparece, mas ainda não leva a lugar nenhum. */
  var REDES = {
    instagram: '',
    youtube: '',
    tiktok: '',
    facebook: '',
    whatsapp: ''   // formato: https://wa.me/55DDDNUMERO
  };

  document.querySelectorAll('[data-rede]').forEach(function (el) {
    var url = REDES[el.dataset.rede];
    if (url) { el.href = url; el.target = '_blank'; el.rel = 'noopener'; return; }
    el.setAttribute('aria-disabled', 'true');
    el.addEventListener('click', function (e) { e.preventDefault(); });
  });

  // Inclinação 3D que segue o mouse (só com mouse e sem "reduzir movimento")
  var sem = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (sem || !window.matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('.tilt').forEach(function (el) {
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.classList.add('inclinando');
      el.style.setProperty('--ry', (x * 10).toFixed(1) + 'deg');
      el.style.setProperty('--rx', (-y * 14).toFixed(1) + 'deg');
    });
    el.addEventListener('mouseleave', function () {
      el.classList.remove('inclinando');
      el.style.removeProperty('--rx'); el.style.removeProperty('--ry');
    });
  });
})();
