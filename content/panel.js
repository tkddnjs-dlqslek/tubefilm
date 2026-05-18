(() => {
  const TF = (window.__TubeFilm = window.__TubeFilm || {});

  const PANEL_ID = 'tubefilm-panel';
  const TOAST_ID = 'tubefilm-toast';
  const HINT_ID = 'tubefilm-first-hint';

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') node.className = v;
      else if (k === 'style') node.style.cssText = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    });
    children.forEach((c) => node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return node;
  }

  function makeDraggable(panel, handle) {
    let dragging = false;
    let startX = 0, startY = 0, baseLeft = 0, baseTop = 0;
    handle.addEventListener('mousedown', (e) => {
      if (e.target.closest('.tubefilm-btn, .tubefilm-toggle')) return;
      dragging = true;
      const rect = panel.getBoundingClientRect();
      baseLeft = rect.left;
      baseTop = rect.top;
      startX = e.clientX;
      startY = e.clientY;
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const left = Math.max(0, Math.min(window.innerWidth - 40, baseLeft + e.clientX - startX));
      const top = Math.max(0, Math.min(window.innerHeight - 40, baseTop + e.clientY - startY));
      panel.style.left = left + 'px';
      panel.style.top = top + 'px';
    });
    window.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      TF.savePanelPosition({ left: panel.style.left, top: panel.style.top });
    });
  }

  function buildSliders(preset, values, onChange) {
    const wrap = el('div', { class: 'tubefilm-sliders' });
    preset.sliders.forEach((s) => {
      const current = values[s.key] ?? s.default;
      const valLabel = el('span', { class: 'tubefilm-slider-val' }, [String(current)]);
      const row = el('div', { class: 'tubefilm-slider-row' }, [
        el('label', { class: 'tubefilm-slider-label' }, [s.label, valLabel]),
        el('input', {
          type: 'range',
          min: '0',
          max: '100',
          value: String(current),
          class: 'tubefilm-slider',
          oninput: (e) => {
            const v = Number(e.target.value);
            valLabel.textContent = String(v);
            onChange(s.key, v);
          }
        })
      ]);
      wrap.appendChild(row);
    });
    return wrap;
  }

  TF.mountPanel = function (state, callbacks) {
    let panel = document.getElementById(PANEL_ID);
    if (panel) panel.remove();

    panel = el('div', { id: PANEL_ID, class: state.collapsed ? 'tubefilm-collapsed' : '' });

    const header = el('div', { class: 'tubefilm-header' }, [
      el('span', { class: 'tubefilm-title' }, ['TubeFilm']),
      el('button', {
        class: 'tubefilm-btn tubefilm-toggle',
        title: state.enabled ? '끄기' : '켜기',
        onclick: () => callbacks.onToggleEnabled()
      }, [state.enabled ? 'ON' : 'OFF']),
      el('button', {
        class: 'tubefilm-btn',
        title: state.collapsed ? '펴기' : '접기',
        onclick: () => callbacks.onToggleCollapsed()
      }, [state.collapsed ? '+' : '–'])
    ]);

    panel.appendChild(header);

    if (!state.collapsed) {
      const body = el('div', { class: 'tubefilm-body' });

      const presetGrid = el('div', { class: 'tubefilm-preset-grid' });
      TF.PRESET_ORDER.forEach((id) => {
        const p = TF.PRESETS[id];
        const btn = el('button', {
          class: 'tubefilm-preset-btn' + (state.activePreset === id ? ' active' : ''),
          title: p.desc,
          onclick: () => callbacks.onSelectPreset(id)
        }, [
          el('span', { class: 'tubefilm-preset-name' }, [p.name]),
          el('span', { class: 'tubefilm-preset-desc' }, [p.desc])
        ]);
        presetGrid.appendChild(btn);
      });
      body.appendChild(presetGrid);

      if (state.activePreset) {
        const preset = TF.PRESETS[state.activePreset];
        const values = state.sliderValues[state.activePreset] || {};
        const sliderBlock = buildSliders(preset, values, callbacks.onSlider);
        body.appendChild(sliderBlock);
      } else {
        body.appendChild(el('div', { class: 'tubefilm-hint' }, ['프리셋을 선택하세요']));
      }

      const adRow = el('label', { class: 'tubefilm-check-row' }, [
        el('input', {
          type: 'checkbox',
          class: 'tubefilm-check',
          ...(state.adFilterOff ? { checked: 'checked' } : {}),
          onchange: (e) => callbacks.onToggleAdFilter(!!e.target.checked)
        }),
        el('span', {}, ['광고에는 필터 끄기'])
      ]);
      body.appendChild(adRow);

      panel.appendChild(body);
    }

    const host = TF._panelHost && document.contains(TF._panelHost) ? TF._panelHost : document.body;
    host.appendChild(panel);

    if (state.position && state.position.left && state.position.top) {
      panel.style.left = state.position.left;
      panel.style.top = state.position.top;
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    }

    makeDraggable(panel, header);

    if (!state.collapsed && !state.activePreset && !state.hintDismissed) {
      TF.showFirstHint(callbacks);
    } else {
      TF.dismissFirstHint(false);
    }

    return panel;
  };

  TF.showFirstHint = function (callbacks) {
    if (document.getElementById(HINT_ID)) return;
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return;
    const body = panel.querySelector('.tubefilm-body');
    if (!body) return;
    const hint = el('div', { id: HINT_ID, class: 'tubefilm-first-hint' }, [
      el('span', {}, ['처음 사용 — 프리셋을 골라 슬라이더로 강도 조절']),
      el('button', {
        class: 'tubefilm-hint-close',
        title: '닫기',
        onclick: () => {
          if (callbacks && callbacks.onDismissHint) callbacks.onDismissHint();
          TF.dismissFirstHint(false);
        }
      }, ['×'])
    ]);
    body.insertBefore(hint, body.firstChild);
  };

  TF.dismissFirstHint = function (persist) {
    const hint = document.getElementById(HINT_ID);
    if (hint) hint.remove();
  };

  TF.showToast = function (message, duration = 3000) {
    let toast = document.getElementById(TOAST_ID);
    if (toast) toast.remove();
    toast = el('div', { id: TOAST_ID, class: 'tubefilm-toast' }, [message]);
    const host = TF._panelHost && document.contains(TF._panelHost) ? TF._panelHost : document.body;
    host.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('tubefilm-toast-show'));
    setTimeout(() => {
      if (!toast.parentElement) return;
      toast.classList.remove('tubefilm-toast-show');
      setTimeout(() => toast.remove(), 250);
    }, duration);
  };

  TF.clampPanel = function () {
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    const maxLeft = window.innerWidth - Math.min(rect.width, 80);
    const maxTop = window.innerHeight - 40;
    let needsClamp = false;
    let left = rect.left;
    let top = rect.top;
    if (left > maxLeft) { left = Math.max(0, maxLeft - 16); needsClamp = true; }
    if (left < 0) { left = 0; needsClamp = true; }
    if (top > maxTop) { top = Math.max(0, maxTop - 16); needsClamp = true; }
    if (top < 0) { top = 0; needsClamp = true; }
    if (needsClamp) {
      panel.style.left = left + 'px';
      panel.style.top = top + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
      TF.savePanelPosition({ left: panel.style.left, top: panel.style.top });
    }
  };

  TF.setPanelHost = function (host) {
    TF._panelHost = host || null;
    const panel = document.getElementById(PANEL_ID);
    if (panel) {
      const target = host && document.contains(host) ? host : document.body;
      if (panel.parentElement !== target) target.appendChild(panel);
    }
    const toast = document.getElementById(TOAST_ID);
    if (toast) {
      const target = host && document.contains(host) ? host : document.body;
      if (toast.parentElement !== target) target.appendChild(toast);
    }
  };

  TF.unmountPanel = function () {
    const panel = document.getElementById(PANEL_ID);
    if (panel) panel.remove();
  };

  TF.savePanelPosition = function (pos) {
    if (TF._onPositionChange) TF._onPositionChange(pos);
  };
})();
