(() => {
  const TF = (window.__TubeFilm = window.__TubeFilm || {});

  const PANEL_ID = 'tubefilm-panel';

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

      panel.appendChild(body);
    }

    document.body.appendChild(panel);

    if (state.position && state.position.left && state.position.top) {
      panel.style.left = state.position.left;
      panel.style.top = state.position.top;
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    }

    makeDraggable(panel, header);
    return panel;
  };

  TF.unmountPanel = function () {
    const panel = document.getElementById(PANEL_ID);
    if (panel) panel.remove();
  };

  TF.savePanelPosition = function (pos) {
    if (TF._onPositionChange) TF._onPositionChange(pos);
  };
})();
