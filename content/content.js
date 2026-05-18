(() => {
  const TF = (window.__TubeFilm = window.__TubeFilm || {});

  const STORAGE_KEY = 'tubefilm.state.v1';
  const DEFAULT_STATE = {
    enabled: true,
    activePreset: null,
    sliderValues: {},
    position: null,
    collapsed: false
  };

  let state = { ...DEFAULT_STATE };
  let currentVideo = null;
  let videoObserver = null;
  let saveTimer = null;

  function loadState() {
    return new Promise((resolve) => {
      try {
        chrome.storage.sync.get(STORAGE_KEY, (data) => {
          const loaded = data && data[STORAGE_KEY];
          state = { ...DEFAULT_STATE, ...(loaded || {}) };
          state.sliderValues = state.sliderValues || {};
          resolve();
        });
      } catch {
        resolve();
      }
    });
  }

  function saveState() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        chrome.storage.sync.set({ [STORAGE_KEY]: state });
      } catch {}
    }, 200);
  }

  function getDefaultSliderValues(presetId) {
    const preset = TF.PRESETS[presetId];
    const out = {};
    preset.sliders.forEach((s) => { out[s.key] = s.default; });
    return out;
  }

  function findVideo() {
    return document.querySelector('video.html5-main-video') || document.querySelector('video');
  }

  function applyCurrent() {
    const video = findVideo();
    if (!video) return;
    if (currentVideo && currentVideo !== video) {
      TF.clearVideo(currentVideo);
    }
    currentVideo = video;

    if (!state.enabled || !state.activePreset) {
      TF.clearVideo(video);
      return;
    }
    const preset = TF.PRESETS[state.activePreset];
    if (!preset) return;
    const values = state.sliderValues[state.activePreset] || getDefaultSliderValues(state.activePreset);
    TF.applyToVideo(video, preset, values);
  }

  function rerenderPanel() {
    TF.mountPanel(state, callbacks);
    const panel = document.getElementById('tubefilm-panel');
    if (panel && !state.enabled) panel.classList.add('tubefilm-disabled');
  }

  const callbacks = {
    onToggleEnabled() {
      state.enabled = !state.enabled;
      saveState();
      applyCurrent();
      rerenderPanel();
    },
    onToggleCollapsed() {
      state.collapsed = !state.collapsed;
      saveState();
      rerenderPanel();
    },
    onSelectPreset(id) {
      state.activePreset = id;
      if (!state.sliderValues[id]) {
        state.sliderValues[id] = getDefaultSliderValues(id);
      }
      saveState();
      applyCurrent();
      rerenderPanel();
    },
    onSlider(key, value) {
      const id = state.activePreset;
      if (!id) return;
      state.sliderValues[id] = state.sliderValues[id] || getDefaultSliderValues(id);
      state.sliderValues[id][key] = value;
      saveState();
      applyCurrent();
    }
  };

  TF._onPositionChange = (pos) => {
    state.position = pos;
    saveState();
  };

  function watchVideoChanges() {
    if (videoObserver) videoObserver.disconnect();
    videoObserver = new MutationObserver(() => {
      const v = findVideo();
      if (v && v !== currentVideo) {
        applyCurrent();
      }
    });
    videoObserver.observe(document.body, { childList: true, subtree: true });
  }

  function watchUrlChanges() {
    let lastUrl = location.href;
    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(applyCurrent, 300);
      }
    }, 500);
  }

  async function init() {
    await loadState();
    rerenderPanel();
    applyCurrent();
    watchVideoChanges();
    watchUrlChanges();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
