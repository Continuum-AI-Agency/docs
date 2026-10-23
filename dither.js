// Glyph reveal for content images, matching the app's ascii-reveal "dither" preset
// (ramp ░▒▓█, source colors, cells 20→5, 85ms tick, 450ms fast media duration).
//
// Plates already painted in the viewport stay put, so the largest paint is not
// delayed. A plate that has not painted yet is held and decodes in as it enters.
// Reduced motion, a stalled decode, or a struggling main thread shows the photo.
(() => {
  if (window.__cnDither) return;
  window.__cnDither = true;

  const RAMP = " ░▒▓█";
  const CELLS = [20, 14, 10, 7, 5];
  const TICK = 85;
  const DUR = 450;
  const FONT = '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const ease = (x) => 1 - (1 - clamp(x)) ** 3;
  const easeIO = (x) => {
    x = clamp(x);
    return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
  };
  // Same integer hash as ascii-reveal, so the flicker pattern matches the app.
  const hash = (a, b, c) => {
    let h =
      Math.imul(a | 0, 0x27d4eb2d) ^
      Math.imul(((b | 0) + 0x9e3779b9) | 0, 0x85ebca6b) ^
      Math.imul(((c | 0) + 0x632be5ab) | 0, 0xc2b2ae35);
    h ^= h >>> 15;
    h = Math.imul(h, 0x2c1b3c6d);
    h ^= h >>> 12;
    h = Math.imul(h, 0x297a2d39);
    h ^= h >>> 15;
    return (h >>> 0) / 4294967296;
  };

  const parseColor = (s) => {
    if (!s) return null;
    const m = s.match(/rgba?\(([^)]+)\)/i);
    if (!m) return null;
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return [p[0], p[1], p[2], p[3] ?? 1];
  };

  const backdrop = (el) => {
    let n = el.parentElement;
    while (n) {
      const c = parseColor(getComputedStyle(n).backgroundColor);
      if (c && c[3] >= 0.5) return c;
      n = n.parentElement;
    }
    return document.documentElement.classList.contains("dark") ? [10, 10, 12, 1] : [251, 252, 253, 1];
  };

  const inView = (r) => r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;

  let io = null;
  let frame = 0;
  let scanFrame = 0;
  let last = 0;
  let slow = 0;
  let stressedUntil = 0;
  const active = new Set();

  const show = (img) => {
    active.delete(img);
    img.classList.remove("cn-hold");
    img.style.opacity = "";
    img._cnCanvas?.remove();
    img._cnCanvas = null;
  };

  const finishAll = () => {
    for (const img of active) show(img);
  };

  const loop = (now) => {
    frame = 0;
    if (last) {
      slow = now - last > 45 ? slow + 1 : Math.max(0, slow - 1);
      if (slow >= 8) stressedUntil = now + 10000;
    }
    last = now;
    if (motion.matches || now < stressedUntil) {
      finishAll();
      return;
    }
    for (const img of active) {
      if (!img.isConnected) {
        show(img);
        continue;
      }
      const t0 = img._cnT0;
      const q = (now - t0) / DUR;
      const canvas = img._cnCanvas;
      if (q >= 1 || !canvas) {
        show(img);
        continue;
      }
      img.style.opacity = String(q < 0.68 ? 0 : easeIO((q - 0.68) / 0.32));
      const ctx = canvas.getContext("2d");
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const alpha = q < 0.74 ? 1 : 1 - ease((q - 0.74) / 0.26);
      const steps = img._cnSteps;
      const si = Math.min(steps.length - 1, Math.floor((q / 0.8) * steps.length));
      const st = steps[si] || (steps[si] = img._cnBuild(si));
      ctx.globalAlpha = alpha;
      ctx.font = `${Math.round(st.ch * 1.02)}px ${FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const tick = Math.floor((now - t0) / TICK);
      const gate = q * 2.3;
      const lastGlyph = RAMP.length - 1;
      for (let i = 0; i < st.n; i++) {
        if (st.gate[i] > gate) continue;
        let lv = st.ink[i];
        if (hash(i, tick, 3) < 0.16) lv += (hash(i, tick, 77) - 0.5) * 0.35;
        const idx = Math.round(clamp(lv * 1.15) * lastGlyph);
        if (idx <= 0) continue;
        ctx.fillStyle = st.color[i];
        ctx.fillText(RAMP[idx], st.x[i], st.y[i]);
      }
    }
    if (active.size) frame = requestAnimationFrame(loop);
    else last = 0;
  };

  const kick = () => {
    if (!frame && active.size) frame = requestAnimationFrame(loop);
  };

  const reveal = (img) => {
    if (!img.isConnected || motion.matches) {
      show(img);
      return;
    }
    const cssW = img.offsetWidth;
    const cssH = img.offsetHeight;
    if (cssW < 2 || cssH < 2 || !img.naturalWidth) {
      show(img);
      return;
    }
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = Math.max(1, Math.round(cssW * dpr));
    const H = Math.max(1, Math.round(cssH * dpr));
    const bg = backdrop(img);
    const bgLum = (0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2]) / 255;
    let data = null;
    try {
      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const o = off.getContext("2d", { willReadFrequently: true });
      const fit = getComputedStyle(img).objectFit;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      if (fit === "cover" || fit === "contain") {
        const sc = fit === "cover" ? Math.max(W / iw, H / ih) : Math.min(W / iw, H / ih);
        o.drawImage(img, (W - iw * sc) / 2, (H - ih * sc) / 2, iw * sc, ih * sc);
      } else {
        o.drawImage(img, 0, 0, W, H);
      }
      data = o.getImageData(0, 0, W, H).data;
    } catch {
      show(img);
      return;
    }

    const cellScale = clamp(Math.min(cssW, cssH) / 230, 0.4, 1);
    const cells = CELLS.map((c) => Math.max(3, c * cellScale) * dpr);
    const ox = W / 2;
    const oy = H / 2;
    const maxD = Math.max(Math.hypot(ox, oy), Math.hypot(W - ox, oy), Math.hypot(ox, H - oy), Math.hypot(W - ox, H - oy)) || 1;
    let sInk = 0;
    let sR = 0;
    let sG = 0;
    let sB = 0;
    const sample = (px, py) => {
      let ix = px | 0;
      let iy = py | 0;
      if (ix < 0) ix = 0;
      if (iy < 0) iy = 0;
      if (ix >= W) ix = W - 1;
      if (iy >= H) iy = H - 1;
      const i = (iy * W + ix) * 4;
      const a = data[i + 3] / 255;
      const r = data[i] * a + bg[0] * (1 - a);
      const g = data[i + 1] * a + bg[1] * (1 - a);
      const b = data[i + 2] * a + bg[2] * (1 - a);
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      sInk = Math.abs(lum - bgLum) / Math.max(bgLum, 1 - bgLum);
      sR = r | 0;
      sG = g | 0;
      sB = b | 0;
    };
    img._cnBuild = (si) => {
      const ch = cells[si];
      const cw = ch * 0.62;
      const cols = Math.ceil(W / cw);
      const rows = Math.ceil(H / ch);
      const dx = cw / 3;
      const dy = ch / 3;
      const qd = 6 * dpr;
      const xs = [];
      const ys = [];
      const gs = [];
      const ks = [];
      const colors = [];
      for (let gy = 0; gy < rows; gy++) {
        const cy = (gy + 0.5) * ch;
        for (let gx = 0; gx < cols; gx++) {
          const cx = (gx + 0.5) * cw;
          sample(cx, cy);
          let best = sInk;
          let br = sR;
          let bgc = sG;
          let bb = sB;
          sample(cx - dx, cy - dy);
          if (sInk > best) { best = sInk; br = sR; bgc = sG; bb = sB; }
          sample(cx + dx, cy - dy);
          if (sInk > best) { best = sInk; br = sR; bgc = sG; bb = sB; }
          sample(cx - dx, cy + dy);
          if (sInk > best) { best = sInk; br = sR; bgc = sG; bb = sB; }
          sample(cx + dx, cy + dy);
          if (sInk > best) { best = sInk; br = sR; bgc = sG; bb = sB; }
          if (best < 0.04) continue;
          xs.push(cx);
          ys.push(cy);
          ks.push(best);
          gs.push(0.5 * hash((cx / qd) | 0, (cy / qd) | 0, 11) + 0.5 * (Math.hypot(cx - ox, cy - oy) / maxD));
          colors.push(`rgb(${br},${bgc},${bb})`);
        }
      }
      return { ch, n: xs.length, x: xs, y: ys, gate: gs, ink: ks, color: colors };
    };

    const parent = img.parentElement;
    if (!parent) {
      show(img);
      return;
    }
    if (getComputedStyle(parent).position === "static") parent.classList.add("cn-dither-host");
    const parentStyle = getComputedStyle(parent);
    const parentRect = parent.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    canvas.className = "cn-dither";
    canvas.setAttribute("aria-hidden", "true");
    canvas.width = W;
    canvas.height = H;
    canvas.style.left = `${imgRect.left - parentRect.left - (parseFloat(parentStyle.borderLeftWidth) || 0) + parent.scrollLeft}px`;
    canvas.style.top = `${imgRect.top - parentRect.top - (parseFloat(parentStyle.borderTopWidth) || 0) + parent.scrollTop}px`;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.style.borderRadius = getComputedStyle(img).borderRadius;
    parent.appendChild(canvas);
    img._cnCanvas = canvas;
    img._cnSteps = cells.map(() => null);
    img._cnT0 = performance.now();
    active.add(img);
    kick();
  };

  const whenReady = (img) => {
    if (img.complete && img.naturalWidth) {
      reveal(img);
      return;
    }
    const giveUp = setTimeout(() => show(img), 1200);
    img.decode().then(() => {
      clearTimeout(giveUp);
      reveal(img);
    }).catch(() => {
      clearTimeout(giveUp);
      show(img);
    });
  };

  const onIntersect = (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const img = entry.target;
      io.unobserve(img);
      whenReady(img);
    }
  };

  const arm = (img) => {
    if (!(img instanceof HTMLImageElement) || img.dataset.cnArmed || !img.getAttribute("src")) return;
    const rect = img.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    img.dataset.cnArmed = "1";
    img.decoding = "async";
    if (img.classList.contains("cn-hero")) {
      img.loading = "eager";
      if (!img.getAttribute("fetchpriority")) img.fetchPriority = "high";
    } else if (rect.width >= 48 && rect.height >= 48) {
      if (!img.complete) {
        img.loading = "lazy";
        img.fetchPriority = "low";
      }
    } else {
      return;
    }
    if (motion.matches || rect.width < 48) return;
    const ready = img.complete && img.naturalWidth > 0;
    if (ready && inView(rect)) return;
    img.classList.add("cn-hold");
    img.addEventListener("error", () => show(img), { once: true });
    if (!io) io = new IntersectionObserver(onIntersect, { rootMargin: "80px 0px" });
    io.observe(img);
  };

  const scan = () => {
    scanFrame = 0;
    const root = document.getElementById("content-area");
    if (!root) return;
    for (const img of root.querySelectorAll("img")) arm(img);
  };

  const schedule = () => {
    if (!scanFrame) scanFrame = requestAnimationFrame(scan);
  };

  motion.addEventListener("change", () => {
    if (motion.matches) finishAll();
  });

  const start = () => {
    scan();
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("load", scan, { once: true });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
