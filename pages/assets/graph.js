(function () {
  var hero = document.querySelector('.hero');
  if (!hero) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'graph-canvas';
  hero.insertBefore(canvas, hero.firstChild);
  var ctx = canvas.getContext('2d');

  var dpr = window.devicePixelRatio || 1;
  var W, H;

  function resize() {
    var r = hero.getBoundingClientRect();
    W = r.width;
    H = r.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  var sources = [
    { label: 'iMessage', color: '#34C759' },
    { label: 'Slack',    color: '#E01E5A' },
    { label: 'Gmail',    color: '#EA4335' },
    { label: 'WhatsApp', color: '#25D366' },
    { label: 'Calendar', color: '#60A5FA' },
    { label: 'Contacts', color: '#A78BFA' }
  ];

  // center point adapts to viewport: right-center on desktop, lower-center on mobile
  function centerX() { return W < 768 ? W * 0.5 : W * 0.55; }
  function centerY() { return W < 768 ? H * 0.78 : H * 0.5; }

  // scatter initial positions around center
  var nodes = sources.map(function (s, i) {
    var angle = (i / sources.length) * Math.PI * 2;
    var r = Math.min(W, H) * 0.22;
    return {
      x: centerX() + Math.cos(angle) * r + (Math.random() - 0.5) * 40,
      y: centerY() + Math.sin(angle) * r + (Math.random() - 0.5) * 40,
      vx: 0, vy: 0,
      label: s.label,
      color: s.color
    };
  });

  var cursor = { x: centerX(), y: centerY() };
  var hasMouse = false;
  var orbitAngle = 0;

  hero.addEventListener('mousemove', function (e) {
    var r = hero.getBoundingClientRect();
    cursor.x = e.clientX - r.left;
    cursor.y = e.clientY - r.top;
    hasMouse = true;
  });

  hero.addEventListener('touchmove', function (e) {
    var r = hero.getBoundingClientRect();
    var t = e.touches[0];
    cursor.x = t.clientX - r.left;
    cursor.y = t.clientY - r.top;
    hasMouse = true;
  }, { passive: true });

  hero.addEventListener('mouseleave', function () {
    hasMouse = false;
  });

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    // static layout: arrange in a circle, draw once
    nodes.forEach(function (n, i) {
      var angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
      var r = Math.min(W, H) * 0.22;
      n.x = centerX() + Math.cos(angle) * r;
      n.y = centerY() + Math.sin(angle) * r;
    });
    drawFrame();
    return;
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);

    // edges: cursor to each node
    nodes.forEach(function (n) {
      var dx = n.x - cursor.x;
      var dy = n.y - cursor.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var maxDist = Math.min(W, H) * 0.6;
      var alpha = Math.max(0, 1 - dist / maxDist) * 0.35;

      ctx.beginPath();
      ctx.moveTo(cursor.x, cursor.y);
      ctx.lineTo(n.x, n.y);
      ctx.strokeStyle = 'rgba(124, 92, 255, ' + alpha + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // source nodes
    nodes.forEach(function (n) {
      // glow
      var grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 24);
      grad.addColorStop(0, n.color + '33');
      grad.addColorStop(1, n.color + '00');
      ctx.beginPath();
      ctx.arc(n.x, n.y, 24, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // dot
      ctx.beginPath();
      ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.fill();

      // label
      ctx.font = '11px "Geist Mono", monospace';
      ctx.fillStyle = 'rgba(136, 136, 160, 0.7)';
      ctx.textAlign = 'center';
      ctx.fillText(n.label, n.x, n.y + 18);
    });

    // cursor dot
    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#7C5CFF';
    ctx.fill();
  }

  function tick() {
    // ambient orbit when no mouse
    if (!hasMouse) {
      orbitAngle += 0.004;
      var orbitR = Math.min(W, H) * 0.06;
      cursor.x = centerX() + Math.cos(orbitAngle) * orbitR;
      cursor.y = centerY() + Math.sin(orbitAngle) * orbitR;
    }

    var pad = 30;

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];

      // attraction toward cursor
      var dx = cursor.x - n.x;
      var dy = cursor.y - n.y;
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;
      var force = dist * 0.0003;
      n.vx += dx * force;
      n.vy += dy * force;

      // repulsion from other nodes
      for (var j = i + 1; j < nodes.length; j++) {
        var o = nodes[j];
        var rx = n.x - o.x;
        var ry = n.y - o.y;
        var rd = Math.sqrt(rx * rx + ry * ry) || 1;
        if (rd < 120) {
          var rep = (120 - rd) * 0.01;
          var ux = rx / rd * rep;
          var uy = ry / rd * rep;
          n.vx += ux;
          n.vy += uy;
          o.vx -= ux;
          o.vy -= uy;
        }
      }

      // damping
      n.vx *= 0.92;
      n.vy *= 0.92;

      // integrate
      n.x += n.vx;
      n.y += n.vy;

      // boundary clamping
      if (n.x < pad) { n.x = pad; n.vx *= -0.5; }
      if (n.x > W - pad) { n.x = W - pad; n.vx *= -0.5; }
      if (n.y < pad) { n.y = pad; n.vy *= -0.5; }
      if (n.y > H - pad) { n.y = H - pad; n.vy *= -0.5; }
    }

    drawFrame();
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
