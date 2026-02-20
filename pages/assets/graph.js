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

  var mobile = function () { return W < 768; };
  function cX() { return mobile() ? W * 0.5 : W * 0.55; }
  function cY() { return mobile() ? H * 0.78 : H * 0.5; }

  // Level 1: Core entity types
  var L1 = [
    { label: 'Messages',      color: '#7C5CFF' },
    { label: 'Conversations',  color: '#00D4AA' },
    { label: 'Events',        color: '#60A5FA' },
    { label: 'Docs',          color: '#E879F9' }
  ];

  // Level 2: Data sources — parents index into L1
  var L2 = [
    // Messages + Conversations
    { label: 'iMessage',          color: '#34C759', parents: [0, 1] },
    { label: 'Android Messages',  color: '#3DDC84', parents: [0, 1] },
    { label: 'WhatsApp',          color: '#25D366', parents: [0, 1] },
    { label: 'Signal',            color: '#3A76F0', parents: [0, 1] },
    { label: 'Slack',             color: '#E01E5A', parents: [0, 1] },
    { label: 'Discord',           color: '#5865F2', parents: [0, 1] },
    { label: 'Telegram',          color: '#26A5E4', parents: [0, 1] },
    { label: 'Messenger',         color: '#0084FF', parents: [0, 1] },
    // Messages + Conversations + Events
    { label: 'Gmail',             color: '#EA4335', parents: [0, 1, 2] },
    { label: 'Outlook',           color: '#0078D4', parents: [0, 1, 2] },
    // Messages only
    { label: 'Phone',             color: '#30D158', parents: [0] },
    { label: 'FaceTime',          color: '#30D158', parents: [0] },
    { label: 'LinkedIn',          color: '#0A66C2', parents: [0] },
    { label: 'Instagram',         color: '#E4405F', parents: [0] },
    // Events only
    { label: 'Google Calendar',   color: '#4285F4', parents: [2] },
    { label: 'Outlook Calendar',  color: '#0078D4', parents: [2] },
    // Docs
    { label: 'Google Drive',      color: '#4285F4', parents: [3] },
    { label: 'Dropbox',           color: '#0061FF', parents: [3] },
    { label: 'Apple Notes',       color: '#FFD60A', parents: [3] },
    { label: 'Notion',            color: '#EDEDF0', parents: [3] },
    { label: 'Obsidian',          color: '#7C3AED', parents: [3] },
    { label: 'Local Files',       color: '#8E8E93', parents: [3] }
  ];

  var innerAngle = 0;
  var outerAngle = 0;
  var INNER_SPEED = 0.0008;
  var OUTER_SPEED = 0.0005;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var x0 = cX(), y0 = cY();
    var dim = Math.min(W, H);
    var r1 = dim * (mobile() ? 0.14 : 0.17);
    var r2 = dim * (mobile() ? 0.28 : 0.34);

    // Compute L1 positions
    var l1p = L1.map(function (n, i) {
      var a = innerAngle + (i / L1.length) * Math.PI * 2 - Math.PI / 2;
      return { x: x0 + Math.cos(a) * r1, y: y0 + Math.sin(a) * r1, color: n.color, label: n.label };
    });

    // Compute L2 positions
    var l2p = L2.map(function (n, j) {
      var a = outerAngle + (j / L2.length) * Math.PI * 2 - Math.PI / 2;
      return { x: x0 + Math.cos(a) * r2, y: y0 + Math.sin(a) * r2, color: n.color, label: n.label, parents: n.parents, a: a };
    });

    // Edges: center → L1
    l1p.forEach(function (n) {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(n.x, n.y);
      ctx.strokeStyle = 'rgba(124, 92, 255, 0.18)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Edges: L1 → L2
    l2p.forEach(function (n) {
      n.parents.forEach(function (pi) {
        var p = l1p[pi];
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = 'rgba(124, 92, 255, 0.06)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });
    });

    // L2 nodes
    l2p.forEach(function (n) {
      // glow
      var g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 16);
      g.addColorStop(0, n.color + '30');
      g.addColorStop(1, n.color + '00');
      ctx.beginPath();
      ctx.arc(n.x, n.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      // dot
      ctx.beginPath();
      ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.fill();
      // label (radially outward)
      if (!mobile()) {
        var dx = n.x - x0, dy = n.y - y0;
        var len = Math.sqrt(dx * dx + dy * dy) || 1;
        var lx = n.x + (dx / len) * 14;
        var ly = n.y + (dy / len) * 14;
        ctx.font = '9px "Geist Mono", monospace';
        ctx.fillStyle = 'rgba(136, 136, 160, 0.55)';
        ctx.textAlign = dx > 0 ? 'left' : 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.label, lx, ly);
      }
    });

    // L1 nodes
    l1p.forEach(function (n) {
      // glow
      var g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 26);
      g.addColorStop(0, n.color + '44');
      g.addColorStop(1, n.color + '00');
      ctx.beginPath();
      ctx.arc(n.x, n.y, 26, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      // dot
      ctx.beginPath();
      ctx.arc(n.x, n.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.fill();
      // label
      ctx.font = '11px "Geist Mono", monospace';
      ctx.fillStyle = n.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(n.label, n.x, n.y + 12);
    });

    // Center node: LifeDB
    var cg = ctx.createRadialGradient(x0, y0, 0, x0, y0, 32);
    cg.addColorStop(0, 'rgba(124, 92, 255, 0.25)');
    cg.addColorStop(1, 'rgba(124, 92, 255, 0)');
    ctx.beginPath();
    ctx.arc(x0, y0, 32, 0, Math.PI * 2);
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x0, y0, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#7C5CFF';
    ctx.fill();
    ctx.font = 'bold 12px "Geist Mono", monospace';
    ctx.fillStyle = '#EDEDF0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('LifeDB', x0, y0 + 14);
  }

  if (reducedMotion) {
    draw();
    return;
  }

  function tick() {
    innerAngle += INNER_SPEED;
    outerAngle += OUTER_SPEED;
    draw();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
