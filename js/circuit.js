/* ============================================================
   MAGMAX SYSTEMS — fundo de circuito com pulsos de energia
   ============================================================ */
(function () {
  var canvas = document.getElementById('circuitBg');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var buffer = document.createElement('canvas');
  var bctx = buffer.getContext('2d');

  var CELL = 46;
  var traces = [];
  var pulses = [];
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

  function buildTraces(w, h) {
    var cols = Math.max(4, Math.ceil(w / CELL));
    var rows = Math.max(4, Math.ceil(h / CELL));
    var count = Math.max(26, Math.min(90, Math.round((w * h) / 42000)));
    traces = [];
    for (var i = 0; i < count; i++) {
      var x = ((Math.random() * cols) | 0) * CELL;
      var y = ((Math.random() * rows) | 0) * CELL;
      var dir = pick(['h', 'v']);
      var pts = [{ x: x, y: y }];
      var segs = 4 + ((Math.random() * 5) | 0);
      for (var s = 0; s < segs; s++) {
        var len = (1 + ((Math.random() * 3) | 0)) * CELL;
        var nx = x, ny = y;
        if (dir === 'h') nx += (Math.random() < 0.5 ? -1 : 1) * len;
        else ny += (Math.random() < 0.5 ? -1 : 1) * len;
        nx = Math.max(0, Math.min(w, nx));
        ny = Math.max(0, Math.min(h, ny));
        pts.push({ x: nx, y: ny });
        x = nx; y = ny;
        dir = dir === 'h' ? 'v' : 'h';
      }
      traces.push({ pts: pts, bright: Math.random() < 0.2 });
    }
  }

  function segLen(a, b) { return Math.hypot(b.x - a.x, b.y - a.y); }

  function totalLen(pts) {
    var len = 0;
    for (var i = 1; i < pts.length; i++) len += segLen(pts[i - 1], pts[i]);
    return len;
  }

  function pointAt(pts, total, t) {
    var target = t * total;
    var acc = 0;
    for (var i = 1; i < pts.length; i++) {
      var sl = segLen(pts[i - 1], pts[i]);
      if (acc + sl >= target) {
        var segT = sl === 0 ? 0 : (target - acc) / sl;
        return {
          x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * segT,
          y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * segT,
        };
      }
      acc += sl;
    }
    return pts[pts.length - 1];
  }

  function drawBuffer(w, h) {
    buffer.width = w;
    buffer.height = h;
    bctx.fillStyle = '#050a16';
    bctx.fillRect(0, 0, w, h);

    traces.forEach(function (tr) {
      bctx.beginPath();
      tr.pts.forEach(function (p, i) {
        i === 0 ? bctx.moveTo(p.x, p.y) : bctx.lineTo(p.x, p.y);
      });
      bctx.lineJoin = 'round';
      bctx.lineCap = 'round';
      bctx.lineWidth = 1.3;
      bctx.strokeStyle = tr.bright ? 'rgba(90,175,255,.26)' : 'rgba(50,105,185,.14)';
      bctx.stroke();

      tr.pts.forEach(function (p, i) {
        if (i === 0 || i === tr.pts.length - 1) return;
        bctx.beginPath();
        bctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        bctx.fillStyle = 'rgba(90,170,250,.22)';
        bctx.fill();
      });

      // pad final
      var last = tr.pts[tr.pts.length - 1];
      bctx.beginPath();
      bctx.arc(last.x, last.y, 2.6, 0, Math.PI * 2);
      bctx.strokeStyle = 'rgba(120,195,255,.3)';
      bctx.lineWidth = 1;
      bctx.stroke();
    });
  }

  function resize() {
    var w = window.innerWidth;
    var h = Math.max(window.innerHeight, document.documentElement.scrollHeight, document.body.scrollHeight);
    canvas.width = w;
    canvas.height = h;
    buildTraces(w, h);
    drawBuffer(w, h);

    pulses = [];
    traces.forEach(function (tr) {
      if (Math.random() > 0.6) return; // nem todo trace ganha pulso
      var total = totalLen(tr.pts);
      if (total < CELL) return;
      pulses.push({ pts: tr.pts, total: total, t: Math.random(), speed: rand(0.00028, 0.00075) });
    });
  }

  function draw() {
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(buffer, 0, 0);

    if (!reduceMotion) {
      pulses.forEach(function (p) {
        p.t += p.speed;
        if (p.t > 1) p.t -= 1;
        var pos = pointAt(p.pts, p.total, p.t);

        var glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 9);
        glow.addColorStop(0, 'rgba(255,255,255,.9)');
        glow.addColorStop(0.35, 'rgba(170,225,255,.45)');
        glow.addColorStop(1, 'rgba(170,225,255,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      });
    }

    requestAnimationFrame(draw);
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  }, { passive: true });
  window.addEventListener('load', resize);

  resize();
  draw();
})();
