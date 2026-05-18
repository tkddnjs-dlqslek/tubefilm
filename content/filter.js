(() => {
  const TF = (window.__TubeFilm = window.__TubeFilm || {});

  const VIDEO_CLASS = 'tubefilm-video';
  const OVERLAY_CLASS = 'tubefilm-overlay';
  const LAYERS = ['grain', 'scanlines', 'vignette', 'lightleak'];
  let noiseDataUrl = null;

  function generateNoise(size = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return canvas.toDataURL('image/png');
  }

  function getNoise() {
    if (!noiseDataUrl) noiseDataUrl = generateNoise(256);
    return noiseDataUrl;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function buildFilterString(preset, sv) {
    const f = preset.filter;
    const intensity = (sv.intensity ?? 100) / 100;
    const warmth = (sv.warmth ?? 50) / 100;
    const sepiaMul = sv.sepia != null ? sv.sepia / 100 : 1;
    const contrastMul = sv.contrast != null ? sv.contrast / 100 : 1;
    const blurMul = sv.blur != null ? sv.blur / 100 : 1;

    const saturate = lerp(1, f.saturate ?? 1, intensity);
    const brightness = lerp(1, f.brightness ?? 1, intensity);
    const baseContrast = (f.contrast ?? 1) * contrastMul;
    const contrast = lerp(1, baseContrast, intensity);
    const sepia = (f.sepia ?? 0) * intensity * sepiaMul;
    const grayscale = (f.grayscale ?? 0) * intensity;
    const hue = (f.hueRotate ?? 0) * intensity + (sv.warmth != null ? (warmth - 0.5) * 20 : 0);
    const blur = (f.blur ?? 0) * intensity * blurMul;

    const parts = [
      `saturate(${saturate.toFixed(3)})`,
      `brightness(${brightness.toFixed(3)})`,
      `contrast(${contrast.toFixed(3)})`
    ];
    if (sepia > 0.001) parts.push(`sepia(${sepia.toFixed(3)})`);
    if (grayscale > 0.001) parts.push(`grayscale(${grayscale.toFixed(3)})`);
    if (Math.abs(hue) > 0.1) parts.push(`hue-rotate(${hue.toFixed(2)}deg)`);
    if (blur > 0.01) parts.push(`blur(${blur.toFixed(2)}px)`);
    return parts.join(' ');
  }

  function computeOverlayOpacities(preset, sv) {
    const o = preset.overlay;
    const intensity = (sv.intensity ?? 100) / 100;
    const grainMul = sv.grain != null ? sv.grain / 100 : 1;
    const vignetteMul = sv.vignette != null ? sv.vignette / 100 : 1;
    const scanlinesMul = sv.scanlines != null ? sv.scanlines / 100 : 1;
    const lightLeakMul = sv.lightLeak != null ? sv.lightLeak / 100 : 1;

    return {
      grain: (o.grain ?? 0) * intensity * grainMul,
      scanlines: (o.scanlines ?? 0) * intensity * scanlinesMul,
      vignette: (o.vignette ?? 0) * intensity * vignetteMul,
      lightleak: (o.lightLeak ?? 0) * intensity * lightLeakMul
    };
  }

  function ensureOverlay(video) {
    const parent = video.parentElement;
    if (!parent) return null;
    let overlay = parent.querySelector(`:scope > .${OVERLAY_CLASS}`);
    if (!overlay) {
      const cs = getComputedStyle(parent);
      if (cs.position === 'static') parent.style.position = 'relative';
      overlay = document.createElement('div');
      overlay.className = OVERLAY_CLASS;
      LAYERS.forEach((name) => {
        const layer = document.createElement('div');
        layer.className = `tubefilm-layer tubefilm-${name}`;
        if (name === 'grain') {
          layer.style.backgroundImage = `url(${getNoise()})`;
        } else if (name === 'scanlines') {
          layer.style.backgroundImage =
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 3px)';
        } else if (name === 'vignette') {
          layer.style.backgroundImage =
            'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.95) 100%)';
        } else if (name === 'lightleak') {
          layer.style.backgroundImage =
            'radial-gradient(circle at 92% 8%, rgba(255,180,100,0.7) 0%, transparent 38%), ' +
            'radial-gradient(circle at 5% 95%, rgba(255,120,160,0.55) 0%, transparent 35%)';
        }
        overlay.appendChild(layer);
      });
      parent.appendChild(overlay);
    }
    return overlay;
  }

  function removeOverlay(video) {
    const parent = video.parentElement;
    if (!parent) return;
    const overlay = parent.querySelector(`:scope > .${OVERLAY_CLASS}`);
    if (overlay) overlay.remove();
  }

  TF.applyToVideo = function (video, preset, sliderValues) {
    if (!video) return;
    video.classList.add(VIDEO_CLASS);
    video.style.setProperty('filter', buildFilterString(preset, sliderValues), 'important');

    const overlay = ensureOverlay(video);
    if (!overlay) return;
    const ops = computeOverlayOpacities(preset, sliderValues);
    LAYERS.forEach((name) => {
      const layer = overlay.querySelector(`.tubefilm-${name}`);
      if (!layer) return;
      const op = Math.max(0, Math.min(1, ops[name]));
      layer.style.opacity = String(op);
    });
  };

  TF.clearVideo = function (video) {
    if (!video) return;
    video.classList.remove(VIDEO_CLASS);
    video.style.removeProperty('filter');
    removeOverlay(video);
  };

  TF.regenerateNoise = function () {
    noiseDataUrl = generateNoise(256);
  };
})();
