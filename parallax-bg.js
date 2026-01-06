(() => {
  const layers = Array.from(document.querySelectorAll(".parallax-layer"));
  if (!layers.length) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const deviceMemory = navigator.deviceMemory || 0;
  const cpuCores = navigator.hardwareConcurrency || 0;
  const isCoarse = window.matchMedia("(pointer: coarse)").matches;
  const lowMemory = deviceMemory > 0 && deviceMemory <= 4;
  const lowCores = cpuCores > 0 && cpuCores <= 4;
  const lowPower = isCoarse || lowMemory || lowCores;

  const PERF = {
    activeFps: lowPower ? 24 : 40,
    idleFps: lowPower ? 6 : 12,
    idleDelay: 240,
    sleepDelay: lowPower ? 600 : 1000,
    maxDt: 64,
  };

  const SETTINGS = {
    scrollPower: 0.62,
    driftPower: lowPower ? 20 : 26,

    smoothScroll: lowPower ? 0.080 : 0.065,
    smoothMouse: lowPower ? 0.055 : 0.060,

    nearBoost: 1.15,
    farClamp: 0.85,
    scalePower: lowPower ? 0.016 : 0.020,
    rotatePower: lowPower ? 0.015 : 0.020,

    velocityBloom: 0.40,
    velocityDamp: 0.10,
    velBlurMax: lowPower ? 0.35 : 0.55,

    noiseSpeed: 0.12,
    noiseScale: 0.55,
    autoBias: 0.55,

    breatheAmount: lowPower ? 0.04 : 0.08,
    breatheSpeed: 0.18,
    breatheScrollMix: 0.35,

    smearX: 1.35,
    smearY: 0.35,
    smearScale: lowPower ? 0.06 : 0.10,
  };

  const lerp = (a, b, s) => a + (b - a) * s;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function hash2(ix, iy){
    let n = ix * 374761393 + iy * 668265263;
    n = (n ^ (n >> 13)) * 1274126177;
    n = n ^ (n >> 16);
    return (n >>> 0) / 4294967296;
  }
  function smoothstep(t){ return t * t * (3 - 2 * t); }
  function noise2(x, y){
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const x1 = x0 + 1, y1 = y0 + 1;
    const sx = smoothstep(x - x0);
    const sy = smoothstep(y - y0);
    const n00 = hash2(x0, y0);
    const n10 = hash2(x1, y0);
    const n01 = hash2(x0, y1);
    const n11 = hash2(x1, y1);
    const ix0 = lerp(n00, n10, sx);
    const ix1 = lerp(n01, n11, sx);
    return (lerp(ix0, ix1, sy) * 2 - 1);
  }

  let targetY = window.scrollY || 0;
  let y = targetY;

  let targetMX = 0, targetMY = 0;
  let mx = 0, my = 0;

  let t = 0;
  let sawMouse = false;

  let vy = 0;
  let lastY = targetY;
  let lastInputTime = performance.now();

  let docHeight = 1;
  const updateDocHeight = () => {
    docHeight = Math.max(
      1,
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
  };
  updateDocHeight();
  window.addEventListener("resize", updateDocHeight);

  const wake = () => {
    if (paused || document.hidden) return;
    if (!rafId) {
      lastFrame = 0;
      rafId = requestAnimationFrame(tick);
    }
  };

  const markInput = () => {
    lastInputTime = performance.now();
    wake();
  };

  window.addEventListener("scroll", () => {
    targetY = window.scrollY || 0;
    markInput();
  }, { passive: true });

  if (!isCoarse) {
    window.addEventListener("mousemove", (e) => {
      sawMouse = true;
      markInput();
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetMX = nx;
      targetMY = ny;
    }, { passive: true });
  } else {
    window.addEventListener("touchmove", () => {
      markInput();
    }, { passive: true });
  }

  function depthGain(d){
    const near = Math.pow(clamp(d / 0.90, 0, 1), 1.25);
    const far = 1 - near;
    return far * SETTINGS.farClamp + near * SETTINGS.nearBoost;
  }

  function modeMix(mode){
    switch(mode){
      case "locked": return { scroll: 0.55, drift: 0.35, scale: 0.40, rot: 0.00, op: 0.55 };
      case "float":  return { scroll: 0.75, drift: 0.55, scale: 0.55, rot: 0.10, op: 0.75 };
      case "drift":  return { scroll: 0.85, drift: 0.75, scale: 0.65, rot: 0.12, op: 0.90 };
      case "grain":  return { scroll: 0.95, drift: 0.35, scale: 0.20, rot: 0.00, op: 0.65 };
      case "tilt":   return { scroll: 1.00, drift: 1.00, scale: 0.90, rot: 1.00, op: 1.00 };
      case "smear":  return { scroll: 0.35, drift: 1.25, scale: 1.10, rot: 0.25, op: 0.75 };
      default:       return { scroll: 0.85, drift: 0.70, scale: 0.60, rot: 0.12, op: 0.80 };
    }
  }

  const root = layers[0].closest('div[aria-hidden="true"]');
  if (root) root.style.contain = "layout paint";

  const dynamicBlur = false;
  const dynamicOpacity = false;

  const layerData = layers.map((el, i) => {
    const depth = parseFloat(el.getAttribute("data-depth") || "0.15");
    const mode = (el.getAttribute("data-mode") || "float").toLowerCase();
    const mix = modeMix(mode);
    const dg = depthGain(depth);
    const fg = clamp((depth - 0.10) / 0.85, 0, 1);
    const fgCurve = Math.pow(fg, 1.35);
    const idx = i + 1;
    const phaseX = noise2(idx * 13.7, 2.1);
    const phaseY = noise2(4.2, idx * 9.9);
    const baseOpacity = parseFloat(getComputedStyle(el).opacity || "1") || 1;
    const baseBlur = Math.max(0, (0.62 - Math.min(depth, 0.62)) * 1.00);
    const smear = (mode === "smear");
    const animate = mode !== "smear" && mode !== "grain";

    if (!dynamicBlur) {
      el.style.filter = `blur(${baseBlur.toFixed(2)}px)`;
    }
    if (!dynamicOpacity) {
      el.style.opacity = baseOpacity.toFixed(3);
    }
    if (!animate) {
      el.style.transform = "translate3d(0, 0, 0) scale(1)";
    }

    return {
      el,
      depth,
      mode,
      mix,
      dg,
      fgCurve,
      idx,
      phaseX,
      phaseY,
      baseOpacity,
      baseBlur,
      smear,
      animate,
    };
  });

  const activeLayers = layerData.filter((layer) => layer.animate);

  let lastFrame = 0;
  let rafId = 0;
  let idleMode = false;
  let paused = false;

  function tick(now){
    if (paused) {
      rafId = 0;
      return;
    }
    if (!lastFrame) lastFrame = now;
    const frameMs = idleMode ? (1000 / PERF.idleFps) : (1000 / PERF.activeFps);
    if (now - lastFrame < frameMs) {
      rafId = requestAnimationFrame(tick);
      return;
    }
    const dt = Math.min(PERF.maxDt, now - lastFrame);
    lastFrame = now;

    y = lerp(y, targetY, SETTINGS.smoothScroll);

    const frameScale = Math.max(0.5, dt / 16.67);
    const rawVy = (targetY - lastY) / frameScale;
    lastY = targetY;
    vy = lerp(vy, rawVy, SETTINGS.velocityDamp);
    const speed = clamp(Math.abs(vy) / 60, 0, 1);

    t += (dt / 1000) * SETTINGS.noiseSpeed;

    const autoX = noise2(t * 0.9,  10.2) * 0.55 + noise2(t * 0.35, 3.7) * 0.35;
    const autoY = noise2(7.1, t * 0.8)  * 0.45 + noise2(2.6, t * 0.30) * 0.30;

    const desiredMX = sawMouse ? lerp(autoX, targetMX, 1 - SETTINGS.autoBias) : autoX;
    const desiredMY = sawMouse ? lerp(autoY, targetMY, 1 - SETTINGS.autoBias) : autoY;

    mx = lerp(mx, desiredMX, SETTINGS.smoothMouse);
    my = lerp(my, desiredMY, SETTINGS.smoothMouse);

    const scrollPhase = (y / docHeight) * Math.PI * 2;
    const breatheT = (t * (SETTINGS.breatheSpeed * 6.0)) + scrollPhase * SETTINGS.breatheScrollMix;

    for (let i = 0; i < activeLayers.length; i++) {
      const layer = activeLayers[i];
      const { el, depth, mix, dg, fgCurve, idx, phaseX, phaseY, baseOpacity, baseBlur, smear } = layer;

      const wobbleX = noise2(t * 1.1 + idx * 0.07, 1.7) * 0.55;
      const wobbleY = noise2(2.3, t * 1.0 + idx * 0.06) * 0.55;

      const scrollY = y * depth * SETTINGS.scrollPower * mix.scroll * dg;

      const driftBase = SETTINGS.driftPower * mix.drift * fgCurve * dg;

      const mxUse = smear ? (mx * SETTINGS.smearX) : mx;
      const myUse = smear ? (my * SETTINGS.smearY) : my;

      const driftX = (mxUse * 1.00 + wobbleX * 0.55 + phaseX * 0.12) * driftBase;
      const driftY = (myUse * 0.70 + wobbleY * 0.55 + phaseY * 0.12) * driftBase;

      const scaleBase = SETTINGS.scalePower * mix.scale * fgCurve;
      const smearScale = smear ? SETTINGS.smearScale * (0.35 + fgCurve) : 0;
      const scale = 1 + scaleBase + smearScale + (speed * 0.004 * fgCurve);

      const rot = (mx * 1.6 + wobbleX * 0.6) * SETTINGS.rotatePower * mix.rot * fgCurve;

      const bloomY = vy * SETTINGS.velocityBloom * depth * 0.10;

      if (dynamicBlur) {
        const velBlur = speed * SETTINGS.velBlurMax * (0.35 + fgCurve * 0.35);
        el.style.filter = `blur(${(baseBlur + velBlur).toFixed(2)}px)`;
      }

      if (dynamicOpacity) {
        const breatheWave =
          Math.sin(breatheT + idx * 0.9) * 0.55 +
          Math.sin(breatheT * 0.6 + idx * 0.4) * 0.45;
        const breathe = breatheWave * SETTINGS.breatheAmount * (0.25 + fgCurve * 0.75) * mix.op;
        el.style.opacity = clamp(baseOpacity * (1 + breathe), 0.02, 1).toFixed(3);
      }

      el.style.transform =
        `translate3d(${driftX.toFixed(2)}px, ${(scrollY + driftY + bloomY).toFixed(2)}px, 0)
         rotate(${rot.toFixed(4)}rad)
         scale(${scale.toFixed(4)})`;
    }

    idleMode = (now - lastInputTime) > PERF.idleDelay && speed < 0.02;
    if (idleMode && (now - lastInputTime) > PERF.sleepDelay) {
      rafId = 0;
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  function setPaused(value) {
    if (paused === value) return;
    paused = value;
    if (paused) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      return;
    }
    wake();
  }

  window.addEventListener("parallax-bg:toggle", (event) => {
    setPaused(!!event.detail?.paused);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    } else if (!paused) {
      lastFrame = 0;
      rafId = requestAnimationFrame(tick);
    }
  });

  rafId = requestAnimationFrame(tick);
})();
