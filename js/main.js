/* ============================================================
   MAGMAX SYSTEMS — interactions
   ============================================================ */

/* ── preloader ── */
(function () {
  const pre = document.getElementById('preloader');
  const fill = document.getElementById('preloaderFill');
  if (!pre || !fill) return; // páginas internas não têm preloader
  let p = 0;
  const enter = () => {
    clearInterval(timer);
    pre.classList.add('done');
    const hero = document.getElementById('hero');
    if (hero) hero.classList.add('in');
    document.body.style.overflow = '';
  };
  const timer = setInterval(() => {
    p += Math.random() * 2.4 + 1.5;
    if (p >= 100) {
      p = 100;
      clearInterval(timer);
      fill.style.width = '100%';
      // TEMPORÁRIO: com o botão "Avançar" na tela, só entra no clique (avaliar a arte com calma)
      if (!skip) setTimeout(enter, 250);
      return;
    }
    fill.style.width = p + '%';
  }, 120);
  const skip = document.getElementById('preloaderSkip');
  if (skip) skip.addEventListener('click', enter);
  document.body.style.overflow = 'hidden';
})();

/* ── scatter field: mouse parallax on tiles ── */
(function () {
  const field = document.getElementById('scatterField');
  if (!field) return;
  const isCoarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (isCoarse) return;

  const tiles = Array.from(field.querySelectorAll('.scatter-tile'));
  let mx = 0, my = 0; // -1..1

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX / window.innerWidth - 0.5;
    my = e.clientY / window.innerHeight - 0.5;
    tiles.forEach((tile, i) => {
      const depth = 6 + ((i * 37) % 14); // varied depth per tile, deterministic
      tile.style.setProperty('--px', (mx * depth).toFixed(1) + 'px');
      tile.style.setProperty('--py', (my * depth).toFixed(1) + 'px');
    });
  }, { passive: true });
})();

/* ── custom cursor ── */
(function () {
  const isCoarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (isCoarse) return;

  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    dot.classList.add('active');
    ring.classList.add('active');
  }, { passive: true, once: false });

  function loop() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  }
  loop();

  document.querySelectorAll('[data-cursor], a, button').forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
})();

/* ── nav scroll state ── */
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return; // home não tem menu superior
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── mobile menu ── */
(function () {
  const burger = document.getElementById('navBurger');
  const menu = document.getElementById('mobileMenu');
  if (!burger || !menu) return;
  burger.addEventListener('click', () => {
    menu.classList.toggle('open');
    burger.classList.toggle('open');
  });
  menu.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => menu.classList.remove('open'))
  );
})();

/* ── scroll reveal ── */
(function () {
  const items = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  items.forEach((el) => io.observe(el));
})();

/* ── contact form → mailto fallback (no backend yet) ── */
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('cfNome').value.trim();
    const email = document.getElementById('cfEmail').value.trim();
    const msg = document.getElementById('cfMsg').value.trim();
    const body = encodeURIComponent(`${msg}\n\n— ${nome} (${email})`);
    window.location.href = `mailto:atendimento@magmaxsystems.com.br?subject=${encodeURIComponent(
      'Contato via site — ' + nome
    )}&body=${body}`;
  });
})();
